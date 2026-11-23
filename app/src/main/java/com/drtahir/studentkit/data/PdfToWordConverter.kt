package com.drtahir.studentkit.data

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.suspendCancellableCoroutine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream
import java.nio.charset.Charset
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.zip.Inflater
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import kotlin.coroutines.resume
import kotlin.math.abs
import kotlin.math.roundToInt

/**
 * Offline High-Accuracy PDF to Editable Microsoft Word (.docx) Converter.
 *
 * Converts BOTH digital/selectable PDFs and scanned/image PDFs into cleanly structured,
 * editable WordprocessingML (.docx) documents featuring:
 *  - Hybrid Native PDF Stream Parser + High-DPI PdfRenderer & Google ML Kit Layout OCR
 *  - Automatic Heading, Paragraph, Bullet/Numbered List, and Multi-Column Table (<w:tbl>) detection
 *  - XML 1.0 strict sanitization so Microsoft Word, Google Docs & LibreOffice open every file cleanly
 */
object PdfToWordConverter {

    enum class ConversionMode(val label: String, val subtitle: String) {
        SMART_HYBRID("Smart Hybrid", "Auto-detects digital text, tables & scanned OCR"),
        OCR_LAYOUT("High-Res OCR", "Best for scanned handouts, receipts & custom fonts"),
        FAST_NATIVE("Fast Stream + OCR", "Ultra-fast stream parse with per-page OCR fallback")
    }

    sealed class DocElement {
        data class Heading(val level: Int, val text: String) : DocElement()
        data class Paragraph(val text: String) : DocElement()
        data class ListItem(val text: String, val isNumbered: Boolean = false) : DocElement()
        data class Table(val rows: List<List<String>>) : DocElement()
    }

    data class PageExtraction(
        val pageNumber: Int,
        val elements: List<DocElement>,
        val usedOcr: Boolean,
        val plainText: String
    )

    data class ConversionResult(
        val docxUri: Uri,
        val fileName: String,
        val pagesConverted: Int,
        val totalWords: Int,
        val headingsCount: Int,
        val tablesCount: Int,
        val ocrPagesCount: Int,
        val previewText: String
    )

    data class SpatialLine(
        val text: String,
        val left: Float,
        val top: Float,
        val right: Float,
        val bottom: Float,
        val height: Float
    )

    suspend fun convertPdfToDocx(
        context: Context,
        sourceUri: Uri,
        documentTitle: String,
        mode: ConversionMode = ConversionMode.SMART_HYBRID,
        detectTables: Boolean = true,
        preservePageBreaks: Boolean = true,
        includeHeaderBanner: Boolean = true,
        selectedPageNumbers: Set<Int>? = null,
        onProgress: (Float, String) -> Unit
    ): ConversionResult? {
        val pfd = context.contentResolver.openFileDescriptor(sourceUri, "r") ?: return null
        var renderer: PdfRenderer? = null

        return try {
            onProgress(0.05f, "Inspecting PDF structure...")
            val nativePageStreams = if (mode != ConversionMode.OCR_LAYOUT) {
                extractNativeStreamTextByPage(context, sourceUri)
            } else {
                emptyList()
            }

            renderer = PdfRenderer(pfd)
            val totalPages = renderer.pageCount
            if (totalPages <= 0) return null

            val targetPages = if (selectedPageNumbers.isNullOrEmpty()) {
                (1..totalPages).toList()
            } else {
                selectedPageNumbers.filter { it in 1..totalPages }.sorted().ifEmpty { (1..totalPages).toList() }
            }

            val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
            val pageResults = mutableListOf<PageExtraction>()

            val targetRenderMaxDim = when (mode) {
                ConversionMode.OCR_LAYOUT -> 2400
                ConversionMode.SMART_HYBRID -> 2100
                ConversionMode.FAST_NATIVE -> 1900
            }

            for ((idx, pageNum) in targetPages.withIndex()) {
                val baseProgress = 0.08f + ((idx.toFloat() / targetPages.size.toFloat()) * 0.78f)
                onProgress(baseProgress, "Analyzing page $pageNum of $totalPages...")

                val zeroIdx = pageNum - 1
                val nativeText = nativePageStreams.getOrNull(zeroIdx)?.trim().orEmpty()
                val nativeCleanRatio = readabilityRatio(nativeText)

                val useNativeFastDirectly =
                    mode == ConversionMode.FAST_NATIVE &&
                        nativeText.length >= 30 &&
                        nativeCleanRatio >= 0.90f

                val extraction: PageExtraction = if (useNativeFastDirectly) {
                    val elements = buildElementsFromPlainText(nativeText, detectTables)
                    PageExtraction(
                        pageNumber = pageNum,
                        elements = elements,
                        usedOcr = false,
                        plainText = nativeText
                    )
                } else {
                    onProgress(
                        baseProgress + (0.35f / targetPages.size.toFloat()),
                        "Extracting layout & text on page $pageNum..."
                    )
                    val visionText = renderPageAndRunOcr(renderer, zeroIdx, targetRenderMaxDim, recognizer)
                    val ocrLines = extractSpatialLines(visionText)
                    val ocrCharCount = ocrLines.sumOf { it.text.length }

                    if (ocrCharCount >= 12) {
                        val elements = buildStructuredElements(ocrLines, detectTables)
                        val plain = renderElementsToPlainText(elements)
                        PageExtraction(
                            pageNumber = pageNum,
                            elements = elements,
                            usedOcr = true,
                            plainText = plain
                        )
                    } else if (nativeText.isNotBlank() && nativeCleanRatio >= 0.75f) {
                        val elements = buildElementsFromPlainText(nativeText, detectTables)
                        PageExtraction(
                            pageNumber = pageNum,
                            elements = elements,
                            usedOcr = false,
                            plainText = nativeText
                        )
                    } else {
                        PageExtraction(
                            pageNumber = pageNum,
                            elements = listOf(
                                DocElement.Paragraph("[Page $pageNum contained no selectable or OCR-readable text]")
                            ),
                            usedOcr = true,
                            plainText = ""
                        )
                    }
                }

                pageResults.add(extraction)
            }

            try {
                recognizer.close()
            } catch (_: Exception) {
            }

            onProgress(0.90f, "Building Microsoft Word (.docx) OpenXML package...")

            val safeBaseName = documentTitle
                .replace(Regex("\\.pdf$", RegexOption.IGNORE_CASE), "")
                .replace(Regex("[^a-zA-Z0-9._-]"), "_")
                .trim('_')
                .ifEmpty { "Converted_Document" }
            val outFileName = "${safeBaseName}_${System.currentTimeMillis()}.docx"

            val cleanTitle = documentTitle
                .replace(Regex("\\.pdf$", RegexOption.IGNORE_CASE), "")
                .ifBlank { "Converted PDF Document" }

            val docxUri = writeDocxToDownloads(
                context = context,
                fileName = outFileName,
                documentTitle = cleanTitle,
                pages = pageResults,
                preservePageBreaks = preservePageBreaks,
                includeHeaderBanner = includeHeaderBanner
            ) ?: return null

            val totalWords = pageResults.sumOf { page ->
                page.plainText.split(Regex("\\s+")).count { it.isNotBlank() }
            }
            val headingsCount = pageResults.sumOf { page ->
                page.elements.count { it is DocElement.Heading }
            }
            val tablesCount = pageResults.sumOf { page ->
                page.elements.count { it is DocElement.Table }
            }
            val ocrPagesCount = pageResults.count { it.usedOcr }
            val previewText = pageResults.joinToString("\n\n--- Page Break ---\n\n") { page ->
                "Page ${page.pageNumber}\n${page.plainText}"
            }.take(6000)

            onProgress(1.0f, "Editable Word document saved to Downloads!")

            ConversionResult(
                docxUri = docxUri,
                fileName = outFileName,
                pagesConverted = pageResults.size,
                totalWords = totalWords,
                headingsCount = headingsCount,
                tablesCount = tablesCount,
                ocrPagesCount = ocrPagesCount,
                previewText = previewText
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try {
                renderer?.close()
            } catch (_: Exception) {
            }
            try {
                pfd.close()
            } catch (_: Exception) {
            }
        }
    }

    private suspend fun renderPageAndRunOcr(
        renderer: PdfRenderer,
        pageIndex: Int,
        maxDimension: Int,
        recognizer: com.google.mlkit.vision.text.TextRecognizer
    ): Text? {
        val page = renderer.openPage(pageIndex)
        val wPt = page.width.coerceAtLeast(1).toFloat()
        val hPt = page.height.coerceAtLeast(1).toFloat()
        val longEdge = maxOf(wPt, hPt)
        val scale = (maxDimension.toFloat() / longEdge).coerceIn(1.25f, 3.2f)
        val targetW = (wPt * scale).roundToInt().coerceAtLeast(240)
        val targetH = (hPt * scale).roundToInt().coerceAtLeast(240)

        val bitmap = Bitmap.createBitmap(targetW, targetH, Bitmap.Config.ARGB_8888)
        return try {
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.WHITE)
            page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            page.close()

            val image = InputImage.fromBitmap(bitmap, 0)
            suspendCancellableCoroutine { continuation ->
                recognizer.process(image)
                    .addOnSuccessListener { visionText ->
                        if (continuation.isActive) continuation.resume(visionText)
                    }
                    .addOnFailureListener {
                        if (continuation.isActive) continuation.resume(null)
                    }
            }
        } catch (e: Exception) {
            try {
                page.close()
            } catch (_: Exception) {
            }
            null
        } finally {
            bitmap.recycle()
        }
    }

    private fun extractSpatialLines(visionText: Text?): List<SpatialLine> {
        if (visionText == null) return emptyList()
        val raw = mutableListOf<SpatialLine>()
        for (block in visionText.textBlocks) {
            for (line in block.lines) {
                val txt = sanitizeXmlText(line.text).trim()
                val box = line.boundingBox
                if (txt.isNotBlank() && box != null) {
                    raw.add(
                        SpatialLine(
                            text = txt,
                            left = box.left.toFloat(),
                            top = box.top.toFloat(),
                            right = box.right.toFloat(),
                            bottom = box.bottom.toFloat(),
                            height = box.height().toFloat().coerceAtLeast(10f)
                        )
                    )
                }
            }
        }
        return raw.sortedWith(compareBy<SpatialLine> { it.top }.thenBy { it.left })
    }

    private fun buildStructuredElements(
        lines: List<SpatialLine>,
        detectTables: Boolean
    ): List<DocElement> {
        if (lines.isEmpty()) return emptyList()

        val sortedHeights = lines.map { it.height }.sorted()
        val medianHeight = sortedHeights[sortedHeights.size / 2].coerceAtLeast(12f)
        val pageLeft = lines.minOf { it.left }
        val pageRight = lines.maxOf { it.right }
        val pageSpan = (pageRight - pageLeft).coerceAtLeast(100f)

        // 1. Group lines by visual baseline row (lines sitting on the same horizontal band)
        val rowTolerance = medianHeight * 0.58f
        val rowBands = mutableListOf<MutableList<SpatialLine>>()
        for (line in lines) {
            val lineCenterY = (line.top + line.bottom) / 2f
            val matchingBand = rowBands.lastOrNull()?.takeIf { band ->
                val bandCenterY = band.map { (it.top + it.bottom) / 2f }.average().toFloat()
                abs(lineCenterY - bandCenterY) <= rowTolerance
            }
            if (matchingBand != null) {
                matchingBand.add(line)
            } else {
                rowBands.add(mutableListOf(line))
            }
        }
        rowBands.forEach { band -> band.sortBy { it.left } }

        val elements = mutableListOf<DocElement>()
        val paragraphBuffer = StringBuilder()
        var lastParagraphBottom = -1f
        val pendingTableRows = mutableListOf<List<String>>()

        fun flushParagraph() {
            val content = paragraphBuffer.toString().trim()
            if (content.isNotEmpty()) {
                elements.add(DocElement.Paragraph(content))
            }
            paragraphBuffer.clear()
            lastParagraphBottom = -1f
        }

        fun flushTable() {
            if (pendingTableRows.size >= 2) {
                val maxCols = pendingTableRows.maxOf { it.size }.coerceAtLeast(2)
                val normalized = pendingTableRows.map { row ->
                    if (row.size < maxCols) row + List(maxCols - row.size) { "" } else row
                }
                elements.add(DocElement.Table(normalized))
            } else if (pendingTableRows.size == 1) {
                elements.add(DocElement.Paragraph(pendingTableRows[0].joinToString("   ")))
            }
            pendingTableRows.clear()
        }

        for (band in rowBands) {
            val bandTop = band.minOf { it.top }
            val bandBottom = band.maxOf { it.bottom }
            val bandHeight = band.maxOf { it.height }

            // Check if band has cleanly separated horizontal cells (indicating a table / key-value row)
            val isMultiCellRow = detectTables && band.size >= 2 && hasColumnGaps(band, medianHeight)

            if (isMultiCellRow) {
                flushParagraph()
                val cells = mergeCloseHorizontalCells(band, medianHeight)
                if (cells.size >= 2) {
                    pendingTableRows.add(cells)
                    continue
                }
            }

            if (pendingTableRows.isNotEmpty()) {
                flushTable()
            }

            val rowText = band.joinToString(" ") { it.text }.trim()
            if (rowText.isEmpty()) continue

            val isBullet = isBulletLine(rowText)
            val isNumbered = isNumberedListLine(rowText)
            val looksShortTitle = rowText.length <= 95 && !rowText.endsWith(".")
            val isHeadingSize = bandHeight >= medianHeight * 1.28f && looksShortTitle
            val isUpperHeading = rowText.length in 4..65 &&
                rowText.count { it.isLetter() } >= 4 &&
                rowText == rowText.uppercase(Locale.getDefault()) &&
                !isBullet && !isNumbered

            when {
                isHeadingSize -> {
                    flushParagraph()
                    val level = if (bandHeight >= medianHeight * 1.55f) 1 else 2
                    elements.add(DocElement.Heading(level, rowText))
                }
                isUpperHeading && band.first().left <= pageLeft + pageSpan * 0.25f -> {
                    flushParagraph()
                    elements.add(DocElement.Heading(2, rowText))
                }
                isBullet || isNumbered -> {
                    flushParagraph()
                    elements.add(DocElement.ListItem(rowText, isNumbered = isNumbered))
                }
                else -> {
                    val verticalGap = if (lastParagraphBottom >= 0f) bandTop - lastParagraphBottom else 0f
                    val startsNewParagraph = lastParagraphBottom >= 0f && verticalGap > medianHeight * 0.95f
                    if (startsNewParagraph) {
                        flushParagraph()
                    }
                    if (paragraphBuffer.isNotEmpty()) {
                        val currentStr = paragraphBuffer.toString()
                        if (currentStr.endsWith("-") && !currentStr.endsWith(" -")) {
                            paragraphBuffer.deleteCharAt(paragraphBuffer.length - 1)
                        } else {
                            paragraphBuffer.append(" ")
                        }
                    }
                    paragraphBuffer.append(rowText)
                    lastParagraphBottom = bandBottom
                }
            }
        }

        flushParagraph()
        flushTable()
        return elements
    }

    private fun hasColumnGaps(band: List<SpatialLine>, medianHeight: Float): Boolean {
        val gapThreshold = (medianHeight * 2.1f).coerceAtLeast(32f)
        for (i in 0 until band.size - 1) {
            val gap = band[i + 1].left - band[i].right
            if (gap >= gapThreshold) return true
        }
        return false
    }

    private fun mergeCloseHorizontalCells(
        band: List<SpatialLine>,
        medianHeight: Float
    ): List<String> {
        val gapThreshold = (medianHeight * 2.1f).coerceAtLeast(32f)
        val merged = mutableListOf<String>()
        val current = StringBuilder(band.first().text)
        var prevRight = band.first().right

        for (i in 1 until band.size) {
            val next = band[i]
            val gap = next.left - prevRight
            if (gap >= gapThreshold) {
                merged.add(current.toString().trim())
                current.clear()
                current.append(next.text)
            } else {
                current.append(" ").append(next.text)
            }
            prevRight = maxOf(prevRight, next.right)
        }
        if (current.isNotEmpty()) merged.add(current.toString().trim())
        return merged
    }

    private fun buildElementsFromPlainText(
        rawText: String,
        detectTables: Boolean
    ): List<DocElement> {
        val elements = mutableListOf<DocElement>()
        val paragraphs = rawText.split(Regex("\\n\\s*\\n"))
        for (block in paragraphs) {
            val lines = block.lines().map { it.trim() }.filter { it.isNotEmpty() }
            if (lines.isEmpty()) continue
            if (lines.size == 1) {
                val single = lines[0]
                when {
                    isBulletLine(single) -> elements.add(DocElement.ListItem(single, isNumbered = false))
                    isNumberedListLine(single) -> elements.add(DocElement.ListItem(single, isNumbered = true))
                    single.length in 3..65 && single == single.uppercase(Locale.getDefault()) && single.any { it.isLetter() } ->
                        elements.add(DocElement.Heading(2, single))
                    else -> elements.add(DocElement.Paragraph(single))
                }
            } else {
                val tableRows = if (detectTables && lines.count { it.contains("\t") || it.contains("   ") } >= 2) {
                    lines.map { line -> line.split(Regex("\\t+|\\s{3,}")).map { it.trim() }.filter { it.isNotEmpty() } }
                } else null

                if (tableRows != null && tableRows.all { it.size >= 2 }) {
                    val cols = tableRows.maxOf { it.size }
                    elements.add(DocElement.Table(tableRows.map { r -> if (r.size < cols) r + List(cols - r.size) { "" } else r }))
                } else {
                    for (line in lines) {
                        when {
                            isBulletLine(line) -> elements.add(DocElement.ListItem(line, isNumbered = false))
                            isNumberedListLine(line) -> elements.add(DocElement.ListItem(line, isNumbered = true))
                            else -> elements.add(DocElement.Paragraph(line))
                        }
                    }
                }
            }
        }
        return elements
    }

    private fun renderElementsToPlainText(elements: List<DocElement>): String {
        return buildString {
            for (el in elements) {
                when (el) {
                    is DocElement.Heading -> appendLine(el.text).appendLine()
                    is DocElement.Paragraph -> appendLine(el.text).appendLine()
                    is DocElement.ListItem -> appendLine(el.text)
                    is DocElement.Table -> {
                        for (row in el.rows) {
                            appendLine(row.joinToString(" | "))
                        }
                        appendLine()
                    }
                }
            }
        }.trim()
    }

    private fun isBulletLine(text: String): Boolean {
        val t = text.trimStart()
        return t.startsWith("•") || t.startsWith("- ") || t.startsWith("* ") ||
            t.startsWith("▪") || t.startsWith("►") || t.startsWith("✓")
    }

    private fun isNumberedListLine(text: String): Boolean {
        return Regex("^(\\d+[.)]|\\([\\da-zA-Z]+\\)|[a-zA-Z][.)])\\s+\\S+").containsMatchIn(text.trimStart())
    }

    private fun readabilityRatio(text: String): Float {
        if (text.isEmpty()) return 0f
        var good = 0
        for (ch in text) {
            if (ch.isLetterOrDigit() || ch.isWhitespace() || ch in ".,;:!?()[]{}-/+'\"@#%&*=\$Rs") {
                good++
            }
        }
        return good.toFloat() / text.length.toFloat()
    }

    /**
     * Lightweight pure-Kotlin PDF text stream extractor (decompresses /FlateDecode streams & extracts BT..ET text).
     * Bound safely in memory (~6MB cap) and used for fast native extraction + hybrid fallback.
     */
    private fun extractNativeStreamTextByPage(context: Context, uri: Uri): List<String> {
        return try {
            val pfd = context.contentResolver.openFileDescriptor(uri, "r") ?: return emptyList()
            val rawBytes = pfd.use { descriptor ->
                val size = descriptor.statSize
                if (size <= 0L || size > 6 * 1024 * 1024L) return emptyList()
                FileInputStream(descriptor.fileDescriptor).use { it.readBytes() }
            }
            val latin = String(rawBytes, Charset.forName("ISO-8859-1"))
            val decodedStreams = mutableListOf<String>()

            var searchFrom = 0
            while (searchFrom < latin.length) {
                val streamKw = latin.indexOf("stream", searchFrom)
                if (streamKw == -1) break
                val dictStart = (streamKw - 400).coerceAtLeast(0)
                val headerSlice = latin.substring(dictStart, streamKw)

                var dataStart = streamKw + 6
                if (dataStart < latin.length && latin[dataStart] == '\r') dataStart++
                if (dataStart < latin.length && latin[dataStart] == '\n') dataStart++

                val endStreamIdx = latin.indexOf("endstream", dataStart)
                if (endStreamIdx == -1) break
                var dataEnd = endStreamIdx
                while (dataEnd > dataStart && (latin[dataEnd - 1] == '\n' || latin[dataEnd - 1] == '\r')) {
                    dataEnd--
                }

                if (dataEnd > dataStart && !headerSlice.contains("/Subtype /Image") && !headerSlice.contains("/Subtype/Image")) {
                    val sliceBytes = rawBytes.copyOfRange(dataStart, dataEnd)
                    val streamText = if (headerSlice.contains("/FlateDecode")) {
                        decompressFlate(sliceBytes)
                    } else {
                        String(sliceBytes, Charset.forName("ISO-8859-1"))
                    }
                    if (!streamText.isNullOrBlank() && streamText.contains("BT") && streamText.contains("ET")) {
                        val extracted = extractTextOperators(streamText)
                        if (extracted.isNotBlank()) decodedStreams.add(extracted)
                    }
                }
                searchFrom = endStreamIdx + 9
            }
            decodedStreams
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun decompressFlate(compressed: ByteArray): String? {
        val inflater = Inflater()
        return try {
            inflater.setInput(compressed)
            val bos = ByteArrayOutputStream(compressed.size * 2)
            val buffer = ByteArray(4096)
            var guard = 0
            while (!inflater.finished() && guard < 1024) {
                val count = inflater.inflate(buffer)
                if (count == 0) {
                    if (inflater.needsInput() || inflater.needsDictionary()) break
                }
                bos.write(buffer, 0, count)
                guard++
            }
            bos.toString("ISO-8859-1")
        } catch (_: Exception) {
            null
        } finally {
            inflater.end()
        }
    }

    private fun extractTextOperators(stream: String): String {
        val sb = StringBuilder()
        var i = 0
        val n = stream.length
        while (i < n) {
            if (stream[i] == '(') {
                val start = i
                i++
                val lit = StringBuilder()
                var depth = 1
                while (i < n && depth > 0) {
                    val c = stream[i]
                    if (c == '\\' && i + 1 < n) {
                        i++
                        when (val esc = stream[i]) {
                            'n' -> lit.append('\n')
                            'r' -> lit.append('\r')
                            't' -> lit.append('\t')
                            else -> lit.append(esc)
                        }
                    } else if (c == '(') {
                        depth++
                        lit.append(c)
                    } else if (c == ')') {
                        depth--
                        if (depth > 0) lit.append(c)
                    } else {
                        lit.append(c)
                    }
                    i++
                }
                val after = stream.substring(i, (i + 12).coerceAtMost(n))
                if (after.contains("Tj") || after.contains("'") || after.contains("\"") || stream.substring((start - 4).coerceAtLeast(0), start).contains("[")) {
                    sb.append(lit)
                }
            } else {
                // Newline hint on line-advance PDF operators
                if (i + 2 < n && (stream[i] == 'T' && (stream[i + 1] == 'd' || stream[i + 1] == 'D' || stream[i + 1] == '*'))) {
                    if (sb.isNotEmpty() && !sb.endsWith("\n")) sb.append('\n')
                }
                i++
            }
        }
        return sanitizeXmlText(sb.toString()).trim()
    }

    private fun writeDocxToDownloads(
        context: Context,
        fileName: String,
        documentTitle: String,
        pages: List<PageExtraction>,
        preservePageBreaks: Boolean,
        includeHeaderBanner: Boolean
    ): Uri? {
        return try {
            val resolver = context.contentResolver
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(
                    MediaStore.MediaColumns.MIME_TYPE,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
            }
            val collectionUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                MediaStore.Downloads.EXTERNAL_CONTENT_URI
            } else {
                MediaStore.Files.getContentUri("external")
            }
            val uri = resolver.insert(collectionUri, contentValues) ?: return null
            resolver.openOutputStream(uri)?.use { os ->
                writeDocxZip(
                    outputStream = os,
                    documentTitle = documentTitle,
                    pages = pages,
                    preservePageBreaks = preservePageBreaks,
                    includeHeaderBanner = includeHeaderBanner
                )
            }
            uri
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun writeDocxZip(
        outputStream: OutputStream,
        documentTitle: String,
        pages: List<PageExtraction>,
        preservePageBreaks: Boolean,
        includeHeaderBanner: Boolean
    ) {
        ZipOutputStream(outputStream).use { zip ->
            // 1. [Content_Types].xml
            zip.putNextEntry(ZipEntry("[Content_Types].xml"))
            zip.write(
                """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                  <Default Extension="xml" ContentType="application/xml"/>
                  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
                  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
                </Types>
                """.trimIndent().toByteArray(Charsets.UTF_8)
            )
            zip.closeEntry()

            // 2. _rels/.rels
            zip.putNextEntry(ZipEntry("_rels/.rels"))
            zip.write(
                """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
                </Relationships>
                """.trimIndent().toByteArray(Charsets.UTF_8)
            )
            zip.closeEntry()

            // 3. word/_rels/document.xml.rels
            zip.putNextEntry(ZipEntry("word/_rels/document.xml.rels"))
            zip.write(
                """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
                </Relationships>
                """.trimIndent().toByteArray(Charsets.UTF_8)
            )
            zip.closeEntry()

            // 4. word/styles.xml
            zip.putNextEntry(ZipEntry("word/styles.xml"))
            zip.write(
                """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                  <w:docDefaults>
                    <w:rPrDefault>
                      <w:rPr>
                        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
                        <w:sz w:val="22"/>
                        <w:szCs w:val="22"/>
                        <w:color w:val="1E293B"/>
                      </w:rPr>
                    </w:rPrDefault>
                    <w:pPrDefault>
                      <w:pPr>
                        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
                      </w:pPr>
                    </w:pPrDefault>
                  </w:docDefaults>
                  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
                    <w:name w:val="Normal"/>
                    <w:qFormat/>
                  </w:style>
                  <w:style w:type="paragraph" w:styleId="Heading1">
                    <w:name w:val="heading 1"/>
                    <w:basedOn w:val="Normal"/>
                    <w:next w:val="Normal"/>
                    <w:qFormat/>
                    <w:pPr>
                      <w:keepNext/>
                      <w:spacing w:before="240" w:after="100"/>
                    </w:pPr>
                    <w:rPr>
                      <w:b/>
                      <w:color w:val="0F4C81"/>
                      <w:sz w:val="32"/>
                      <w:szCs w:val="32"/>
                    </w:rPr>
                  </w:style>
                  <w:style w:type="paragraph" w:styleId="Heading2">
                    <w:name w:val="heading 2"/>
                    <w:basedOn w:val="Normal"/>
                    <w:next w:val="Normal"/>
                    <w:qFormat/>
                    <w:pPr>
                      <w:keepNext/>
                      <w:spacing w:before="180" w:after="80"/>
                    </w:pPr>
                    <w:rPr>
                      <w:b/>
                      <w:color w:val="0F5132"/>
                      <w:sz w:val="26"/>
                      <w:szCs w:val="26"/>
                    </w:rPr>
                  </w:style>
                  <w:style w:type="paragraph" w:styleId="ListParagraph">
                    <w:name w:val="List Paragraph"/>
                    <w:basedOn w:val="Normal"/>
                    <w:qFormat/>
                    <w:pPr>
                      <w:ind w:left="420" w:hanging="180"/>
                      <w:spacing w:after="80"/>
                    </w:pPr>
                  </w:style>
                </w:styles>
                """.trimIndent().toByteArray(Charsets.UTF_8)
            )
            zip.closeEntry()

            // 5. word/document.xml
            zip.putNextEntry(ZipEntry("word/document.xml"))
            val dateStr = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date())
            val xml = buildString {
                append("""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>""")
                append("""<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">""")
                append("<w:body>")

                if (includeHeaderBanner) {
                    append("<w:p><w:pPr><w:pStyle w:val=\"Heading1\"/><w:jc w:val=\"center\"/></w:pPr>")
                    append("<w:r><w:t xml:space=\"preserve\">${escapeXml(documentTitle)}</w:t></w:r></w:p>")
                    append("<w:p><w:pPr><w:jc w:val=\"center\"/><w:spacing w:after=\"200\"/></w:pPr>")
                    append("<w:r><w:rPr><w:i/><w:sz w:val=\"18\"/><w:color w:val=\"64748B\"/></w:rPr>")
                    append("<w:t xml:space=\"preserve\">Converted from PDF to Editable Word (.docx) • ${pages.size} page(s) • $dateStr</w:t></w:r></w:p>")
                }

                pages.forEachIndexed { pageIdx, page ->
                    if (pageIdx > 0) {
                        if (preservePageBreaks) {
                            append("<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>")
                        } else {
                            append("<w:p><w:pPr><w:spacing w:before=\"160\" w:after=\"120\"/></w:pPr>")
                            append("<w:r><w:rPr><w:b/><w:sz w:val=\"18\"/><w:color w:val=\"64748B\"/></w:rPr>")
                            append("<w:t xml:space=\"preserve\">— Page ${page.pageNumber} —</w:t></w:r></w:p>")
                        }
                    }

                    for (el in page.elements) {
                        when (el) {
                            is DocElement.Heading -> {
                                val style = if (el.level <= 1) "Heading1" else "Heading2"
                                append("<w:p><w:pPr><w:pStyle w:val=\"$style\"/></w:pPr>")
                                append("<w:r><w:t xml:space=\"preserve\">${escapeXml(el.text)}</w:t></w:r></w:p>")
                            }
                            is DocElement.ListItem -> {
                                append("<w:p><w:pPr><w:pStyle w:val=\"ListParagraph\"/></w:pPr>")
                                append("<w:r><w:t xml:space=\"preserve\">${escapeXml(el.text)}</w:t></w:r></w:p>")
                            }
                            is DocElement.Paragraph -> {
                                append("<w:p><w:r><w:t xml:space=\"preserve\">${escapeXml(el.text)}</w:t></w:r></w:p>")
                            }
                            is DocElement.Table -> {
                                append(renderWordTableXml(el.rows))
                                append("<w:p><w:pPr><w:spacing w:before=\"0\" w:after=\"80\"/></w:pPr></w:p>")
                            }
                        }
                    }
                }

                // A4 Page Section Properties (11906 x 16838 dxa, 0.75in margins)
                append(
                    """
                    <w:sectPr>
                      <w:pgSz w:w="11906" w:h="16838"/>
                      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
                    </w:sectPr>
                    """.trimIndent()
                )
                append("</w:body></w:document>")
            }
            zip.write(xml.toByteArray(Charsets.UTF_8))
            zip.closeEntry()
            zip.finish()
        }
    }

    private fun renderWordTableXml(rows: List<List<String>>): String {
        if (rows.isEmpty()) return ""
        val colCount = rows.maxOf { it.size }.coerceAtLeast(1)
        val usableWidthDxa = 9746
        val colWidthDxa = (usableWidthDxa / colCount).coerceAtLeast(800)

        return buildString {
            append("<w:tbl>")
            append(
                """
                <w:tblPr>
                  <w:tblW w:w="$usableWidthDxa" w:type="dxa"/>
                  <w:tblBorders>
                    <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                  </w:tblBorders>
                  <w:tblCellMar>
                    <w:top w:w="80" w:type="dxa"/>
                    <w:left w:w="120" w:type="dxa"/>
                    <w:bottom w:w="80" w:type="dxa"/>
                    <w:right w:w="120" w:type="dxa"/>
                  </w:tblCellMar>
                </w:tblPr>
                """.trimIndent()
            )
            append("<w:tblGrid>")
            repeat(colCount) { append("<w:gridCol w:w=\"$colWidthDxa\"/>") }
            append("</w:tblGrid>")

            rows.forEachIndexed { rIdx, row ->
                append("<w:tr>")
                for (cIdx in 0 until colCount) {
                    val cellText = row.getOrElse(cIdx) { "" }
                    append("<w:tc><w:tcPr><w:tcW w:w=\"$colWidthDxa\" w:type=\"dxa\"/>")
                    if (rIdx == 0) {
                        append("<w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"F1F5F9\"/>")
                    }
                    append("</w:tcPr><w:p><w:pPr><w:spacing w:before=\"0\" w:after=\"0\"/></w:pPr><w:r>")
                    if (rIdx == 0) {
                        append("<w:rPr><w:b/></w:rPr>")
                    }
                    append("<w:t xml:space=\"preserve\">${escapeXml(cellText)}</w:t></w:r></w:p></w:tc>")
                }
                append("</w:tr>")
            }
            append("</w:tbl>")
        }
    }

    private fun sanitizeXmlText(input: String): String {
        if (input.isEmpty()) return ""
        val sb = StringBuilder(input.length)
        var i = 0
        while (i < input.length) {
            val ch = input[i]
            if (Character.isHighSurrogate(ch)) {
                if (i + 1 < input.length && Character.isLowSurrogate(input[i + 1])) {
                    sb.append(ch).append(input[i + 1])
                    i += 2
                    continue
                }
            } else if (!Character.isLowSurrogate(ch)) {
                val code = ch.code
                if (code == 0x9 || code == 0xA || code == 0xD || (code in 0x20..0xD7FF) || (code in 0xE000..0xFFFD)) {
                    sb.append(ch)
                }
            }
            i++
        }
        return sb.toString()
    }

    private fun escapeXml(input: String): String {
        val clean = sanitizeXmlText(input)
        val sb = StringBuilder(clean.length + 16)
        for (ch in clean) {
            when (ch) {
                '&' -> sb.append("&amp;")
                '<' -> sb.append("&lt;")
                '>' -> sb.append("&gt;")
                '"' -> sb.append("&quot;")
                '\'' -> sb.append("&apos;")
                else -> sb.append(ch)
            }
        }
        return sb.toString()
    }
}
