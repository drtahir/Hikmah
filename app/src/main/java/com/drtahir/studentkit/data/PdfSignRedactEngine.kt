package com.drtahir.studentkit.data

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.xmlpull.v1.XmlPullParser
import org.xmlpull.v1.XmlPullParserFactory
import java.io.StringReader
import java.util.zip.ZipInputStream

/**
 * Interactive PDF Fill, Sign & Permanent Redaction Engine + Word (.docx) / Text to PDF Converter.
 */
object PdfSignRedactEngine {

    sealed class PdfOverlayAnnotation {
        abstract val pageIndex: Int
        abstract val xNorm: Float
        abstract val yNorm: Float

        data class TextStamp(
            override val pageIndex: Int,
            override val xNorm: Float,
            override val yNorm: Float,
            val text: String,
            val colorInt: Int = Color.parseColor("#1E3A8A"),
            val textSizeScale: Float = 1.0f
        ) : PdfOverlayAnnotation()

        data class RedactionBox(
            override val pageIndex: Int,
            override val xNorm: Float,
            override val yNorm: Float,
            val widthNorm: Float = 0.28f,
            val heightNorm: Float = 0.055f
        ) : PdfOverlayAnnotation()

        data class SignatureStrokeStamp(
            override val pageIndex: Int,
            override val xNorm: Float,
            override val yNorm: Float,
            val widthNorm: Float = 0.28f,
            val heightNorm: Float = 0.11f,
            val strokes: List<List<Pair<Float, Float>>>, // normalized 0..1 inside stamp box
            val inkColorInt: Int = Color.parseColor("#0F172A")
        ) : PdfOverlayAnnotation()
    }

    /**
     * Burns redaction boxes, text stamps, and drawn signatures permanently into a flattened PDF.
     */
    suspend fun exportSignedAndRedactedPdf(
        context: Context,
        sourceUri: Uri,
        sourceName: String,
        annotations: List<PdfOverlayAnnotation>,
        onProgress: (Float, String) -> Unit
    ): Uri? = withContext(Dispatchers.IO) {
        val pfd = context.contentResolver.openFileDescriptor(sourceUri, "r") ?: return@withContext null
        var renderer: PdfRenderer? = null
        val outDoc = PdfDocument()
        try {
            renderer = PdfRenderer(pfd)
            val total = renderer.pageCount
            if (total <= 0) return@withContext null

            val grouped = annotations.groupBy { it.pageIndex }
            for (pageIdx in 0 until total) {
                onProgress(0.1f + 0.8f * (pageIdx.toFloat() / total.toFloat()), "Flattening page ${pageIdx + 1} of $total...")
                val page = renderer.openPage(pageIdx)
                val targetW = (page.width * 2).coerceIn(800, 1654)
                val targetH = ((targetW.toFloat() / page.width.coerceAtLeast(1)) * page.height).toInt().coerceAtLeast(800)

                val bmp = Bitmap.createBitmap(targetW, targetH, Bitmap.Config.ARGB_8888)
                val bmpCanvas = Canvas(bmp)
                bmpCanvas.drawColor(Color.WHITE)
                page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_PRINT)
                page.close()

                // Burn Redactions, Signatures, and Text Stamps permanently onto rasterized page
                grouped[pageIdx]?.forEach { ann ->
                    when (ann) {
                        is PdfOverlayAnnotation.RedactionBox -> {
                            val cx = ann.xNorm * targetW
                            val cy = ann.yNorm * targetH
                            val rw = ann.widthNorm * targetW
                            val rh = ann.heightNorm * targetH
                            val paint = Paint().apply {
                                color = Color.BLACK
                                style = Paint.Style.FILL
                            }
                            bmpCanvas.drawRect(RectF(cx - rw / 2f, cy - rh / 2f, cx + rw / 2f, cy + rh / 2f), paint)
                        }

                        is PdfOverlayAnnotation.TextStamp -> {
                            val paint = Paint().apply {
                                color = ann.colorInt
                                isAntiAlias = true
                                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                                textSize = (targetW * 0.026f * ann.textSizeScale).coerceAtLeast(18f)
                            }
                            bmpCanvas.drawText(ann.text, ann.xNorm * targetW, ann.yNorm * targetH, paint)
                        }

                        is PdfOverlayAnnotation.SignatureStrokeStamp -> {
                            val left = (ann.xNorm - ann.widthNorm / 2f) * targetW
                            val top = (ann.yNorm - ann.heightNorm / 2f) * targetH
                            val boxW = ann.widthNorm * targetW
                            val boxH = ann.heightNorm * targetH
                            val paint = Paint().apply {
                                color = ann.inkColorInt
                                style = Paint.Style.STROKE
                                strokeWidth = (targetW * 0.0045f).coerceAtLeast(3.5f)
                                strokeCap = Paint.Cap.ROUND
                                strokeJoin = Paint.Join.ROUND
                                isAntiAlias = true
                            }
                            ann.strokes.forEach { stroke ->
                                if (stroke.size >= 2) {
                                    val path = Path()
                                    path.moveTo(left + stroke[0].first * boxW, top + stroke[0].second * boxH)
                                    for (i in 1 until stroke.size) {
                                        path.lineTo(left + stroke[i].first * boxW, top + stroke[i].second * boxH)
                                    }
                                    bmpCanvas.drawPath(path, paint)
                                }
                            }
                        }
                    }
                }

                val pageInfo = PdfDocument.PageInfo.Builder(targetW, targetH, pageIdx + 1).create()
                val pdfPage = outDoc.startPage(pageInfo)
                pdfPage.canvas.drawBitmap(bmp, 0f, 0f, null)
                outDoc.finishPage(pdfPage)
                bmp.recycle()
            }

            onProgress(0.95f, "Saving signed/redacted PDF to Downloads...")
            val base = sourceName.replace(Regex("\\.pdf$", RegexOption.IGNORE_CASE), "").replace(Regex("[^a-zA-Z0-9._-]"), "_")
            val fileName = "${base}_signed_redacted_${System.currentTimeMillis()}.pdf"
            val uri = savePdfToDownloads(context, outDoc, fileName)
            onProgress(1f, "Flattened PDF saved cleanly!")
            uri
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try { outDoc.close() } catch (_: Exception) {}
            try { renderer?.close() } catch (_: Exception) {}
            try { pfd.close() } catch (_: Exception) {}
        }
    }

    /**
     * Reads plain text / paragraphs from a Word (.docx) OOXML package or plain .txt / .md file.
     */
    suspend fun extractReadableTextFromDocument(context: Context, uri: Uri, fileName: String): String = withContext(Dispatchers.IO) {
        try {
            if (fileName.endsWith(".docx", ignoreCase = true)) {
                var docXmlContent: String? = null
                context.contentResolver.openInputStream(uri)?.use { stream ->
                    ZipInputStream(stream).use { zis ->
                        var entry = zis.nextEntry
                        while (entry != null) {
                            if (entry.name == "word/document.xml") {
                                docXmlContent = zis.readBytes().toString(Charsets.UTF_8)
                                break
                            }
                            entry = zis.nextEntry
                        }
                    }
                }
                if (!docXmlContent.isNullOrBlank()) {
                    val factory = XmlPullParserFactory.newInstance()
                    val parser = factory.newPullParser()
                    parser.setInput(StringReader(docXmlContent))
                    val sb = StringBuilder()
                    var currentPara = StringBuilder()
                    var eventType = parser.eventType
                    while (eventType != XmlPullParser.END_DOCUMENT) {
                        when (eventType) {
                            XmlPullParser.TEXT -> currentPara.append(parser.text)
                            XmlPullParser.END_TAG -> {
                                if (parser.name.endsWith(":p") || parser.name == "p" || parser.name == "w:p") {
                                    val trimmed = currentPara.toString().trim()
                                    if (trimmed.isNotEmpty()) sb.appendLine(trimmed).appendLine()
                                    currentPara = StringBuilder()
                                }
                            }
                        }
                        eventType = parser.next()
                    }
                    return@withContext sb.toString().trim()
                }
            }
            context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }.orEmpty()
        } catch (e: Exception) {
            e.printStackTrace()
            ""
        }
    }

    /**
     * Renders Word/Markdown/Text content into a paginated A4 print-ready PDF in Downloads.
     */
    suspend fun convertTextOrDocxToPdf(
        context: Context,
        title: String,
        bodyText: String
    ): Uri? = withContext(Dispatchers.IO) {
        val doc = PdfDocument()
        try {
            val pageW = 595
            val pageH = 842
            val margin = 46f
            val contentW = pageW - (margin * 2)

            val titlePaint = Paint().apply {
                color = Color.parseColor("#0F5132")
                textSize = 18f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
            }
            val bodyPaint = Paint().apply {
                color = Color.parseColor("#1E293B")
                textSize = 11.5f
                typeface = Typeface.DEFAULT
                isAntiAlias = true
            }
            val headingPaint = Paint().apply {
                color = Color.parseColor("#0F172A")
                textSize = 14f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
            }
            val footerPaint = Paint().apply {
                color = Color.GRAY
                textSize = 9f
                isAntiAlias = true
            }

            var pageNum = 1
            var currentPage = doc.startPage(PdfDocument.PageInfo.Builder(pageW, pageH, pageNum).create())
            var canvas = currentPage.canvas
            var y = margin + 10f

            if (title.isNotBlank()) {
                canvas.drawText(title, margin, y, titlePaint)
                y += 22f
                val linePaint = Paint().apply { color = Color.parseColor("#CBD5E1"); strokeWidth = 1f }
                canvas.drawLine(margin, y, pageW - margin, y, linePaint)
                y += 18f
            }

            fun ensureSpace(needed: Float) {
                if (y + needed > pageH - margin - 20f) {
                    canvas.drawText("Page $pageNum", pageW / 2f - 18f, pageH - 22f, footerPaint)
                    doc.finishPage(currentPage)
                    pageNum++
                    currentPage = doc.startPage(PdfDocument.PageInfo.Builder(pageW, pageH, pageNum).create())
                    canvas = currentPage.canvas
                    y = margin
                }
            }

            bodyText.split("\n").forEach { rawLine ->
                val trimmed = rawLine.trimEnd()
                if (trimmed.isBlank()) {
                    y += 8f
                    return@forEach
                }
                val isHeading = trimmed.startsWith("#") || (trimmed.length in 3..55 && trimmed == trimmed.uppercase() && trimmed.any { it.isLetter() })
                val cleanLine = trimmed.removePrefix("###").removePrefix("##").removePrefix("#").trim()
                val activePaint = if (isHeading) headingPaint else bodyPaint
                val lineHeight = if (isHeading) 20f else 16f

                val words = cleanLine.split(" ")
                var current = ""
                for (w in words) {
                    val candidate = if (current.isEmpty()) w else "$current $w"
                    if (activePaint.measureText(candidate) > contentW) {
                        ensureSpace(lineHeight)
                        canvas.drawText(current, margin, y, activePaint)
                        y += lineHeight
                        current = w
                    } else {
                        current = candidate
                    }
                }
                if (current.isNotEmpty()) {
                    ensureSpace(lineHeight)
                    canvas.drawText(current, margin, y, activePaint)
                    y += lineHeight + (if (isHeading) 4f else 1f)
                }
            }

            canvas.drawText("Page $pageNum", pageW / 2f - 18f, pageH - 22f, footerPaint)
            doc.finishPage(currentPage)

            val safeBase = title.replace(Regex("[^a-zA-Z0-9._-]"), "_").ifBlank { "Document" }
            savePdfToDownloads(context, doc, "${safeBase}_converted_${System.currentTimeMillis()}.pdf")
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try { doc.close() } catch (_: Exception) {}
        }
    }

    private fun savePdfToDownloads(context: Context, doc: PdfDocument, fileName: String): Uri? {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }
        }
        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Downloads.EXTERNAL_CONTENT_URI
        } else {
            MediaStore.Files.getContentUri("external")
        }
        val uri = resolver.insert(collection, values) ?: return null
        resolver.openOutputStream(uri)?.use { doc.writeTo(it) }
        return uri
    }
}
