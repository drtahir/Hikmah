package com.drtahir.studentkit.data

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import java.io.BufferedOutputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.util.Locale
import kotlin.math.roundToInt

/**
 * Streaming ISO 32000-1 / PDF 1.4 JPEG-compressed PDF writer.
 *
 * Replaces android.graphics.pdf.PdfDocument for PDF compression because Skia's PdfDocument
 * embeds drawn bitmaps using lossless Flate compression, which inflates multi-page PDFs.
 * This compressor writes genuine /DCTDecode JPEG XObjects page-by-page to disk with bounded memory.
 */
object StandardPdfCompressor {

    data class CompressionOutput(
        val tempFile: File,
        val originalBytes: Long,
        val compressedBytes: Long,
        val keptOriginal: Boolean
    ) {
        val savedPercent: Int
            get() = if (originalBytes > 0L && compressedBytes < originalBytes) {
                (((originalBytes - compressedBytes) * 100.0) / originalBytes).roundToInt().coerceIn(0, 99)
            } else {
                0
            }
    }

    fun formatByteSize(bytes: Long): String {
        if (bytes <= 0L) return "0 KB"
        val kb = bytes / 1024.0
        val mb = kb / 1024.0
        return if (mb >= 1.0) {
            String.format(Locale.US, "%.2f MB", mb)
        } else {
            String.format(Locale.US, "%.1f KB", kb)
        }
    }

    fun compressPdfToTempFile(
        context: Context,
        sourceUri: Uri,
        knownOriginalBytes: Long,
        qualityPercent: Int,
        maxDimension: Int,
        onProgress: (Float, String) -> Unit
    ): CompressionOutput? {
        val clampedQuality = qualityPercent.coerceIn(20, 95)
        val clampedMaxDim = maxDimension.coerceIn(480, 2400)

        val pfd = context.contentResolver.openFileDescriptor(sourceUri, "r") ?: return null
        val detectedBytes = pfd.statSize.takeIf { it > 0L } ?: knownOriginalBytes.coerceAtLeast(0L)

        val tempOutFile = File(context.cacheDir, "compressed_pdf_${System.currentTimeMillis()}.pdf")
        var renderer: PdfRenderer? = null

        try {
            renderer = PdfRenderer(pfd)
            val totalPages = renderer.pageCount
            if (totalPages <= 0) {
                return null
            }

            // Object IDs:
            // 1: Catalog, 2: Pages, for page i: page=3+i*3, content=4+i*3, image=5+i*3, info=3+totalPages*3
            val infoObjId = 3 + totalPages * 3
            val offsets = LongArray(infoObjId + 1)

            BufferedOutputStream(FileOutputStream(tempOutFile), 65536).use { bos ->
                var bytesWritten = 0L

                fun writeRaw(bytes: ByteArray) {
                    bos.write(bytes)
                    bytesWritten += bytes.size
                }

                fun writeAscii(text: String) {
                    writeRaw(text.toByteArray(Charsets.ISO_8859_1))
                }

                // PDF Header + binary marker bytes
                writeAscii("%PDF-1.4\n")
                writeRaw(
                    byteArrayOf(
                        '%'.code.toByte(),
                        0xE2.toByte(),
                        0xE3.toByte(),
                        0xCF.toByte(),
                        0xD3.toByte(),
                        '\n'.code.toByte()
                    )
                )

                // 1. Catalog Object
                offsets[1] = bytesWritten
                writeAscii("1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj\n")

                // 2. Pages Tree Object
                offsets[2] = bytesWritten
                val kidsList = (0 until totalPages).joinToString(" ") { idx -> "${3 + idx * 3} 0 R" }
                writeAscii("2 0 obj\n<<\n  /Type /Pages\n  /Kids [ $kidsList ]\n  /Count $totalPages\n>>\nendobj\n")

                val jpegBuffer = ByteArrayOutputStream(131072)

                for (i in 0 until totalPages) {
                    val prog = 0.10f + ((i + 1).toFloat() / totalPages.toFloat()) * 0.78f
                    onProgress(prog, "Compressing page ${i + 1} of $totalPages (Q: $clampedQuality%)...")

                    val page = renderer.openPage(i)
                    val wPt = page.width.coerceAtLeast(1).toFloat()
                    val hPt = page.height.coerceAtLeast(1).toFloat()
                    val longSide = maxOf(wPt, hPt)

                    // Never blow up small pages beyond 2x; scale larger pages down to clampedMaxDim
                    val scale = minOf(clampedMaxDim.toFloat() / longSide, 2.0f)
                    val targetW = (wPt * scale).roundToInt().coerceAtLeast(32)
                    val targetH = (hPt * scale).roundToInt().coerceAtLeast(32)

                    val bmp = Bitmap.createBitmap(targetW, targetH, Bitmap.Config.ARGB_8888)
                    val jpegBytes: ByteArray
                    try {
                        val canvas = Canvas(bmp)
                        canvas.drawColor(Color.WHITE)
                        page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                        jpegBuffer.reset()
                        bmp.compress(Bitmap.CompressFormat.JPEG, clampedQuality, jpegBuffer)
                        jpegBytes = jpegBuffer.toByteArray()
                    } finally {
                        page.close()
                        bmp.recycle()
                    }

                    val pageObjId = 3 + i * 3
                    val contentObjId = pageObjId + 1
                    val imageObjId = pageObjId + 2

                    val wStr = String.format(Locale.US, "%.2f", wPt)
                    val hStr = String.format(Locale.US, "%.2f", hPt)

                    // Page Object
                    offsets[pageObjId] = bytesWritten
                    writeAscii(
                        "$pageObjId 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n" +
                            "  /MediaBox [ 0 0 $wStr $hStr ]\n" +
                            "  /Resources <<\n    /XObject << /Im0 $imageObjId 0 R >>\n    /ProcSet [ /PDF /ImageC ]\n  >>\n" +
                            "  /Contents $contentObjId 0 R\n>>\nendobj\n"
                    )

                    // Content Stream Object
                    val contentBytes = "q\n$wStr 0 0 $hStr 0 0 cm\n/Im0 Do\nQ\n".toByteArray(Charsets.ISO_8859_1)
                    offsets[contentObjId] = bytesWritten
                    writeAscii("$contentObjId 0 obj\n<<\n  /Length ${contentBytes.size}\n>>\nstream\n")
                    writeRaw(contentBytes)
                    writeAscii("\nendstream\nendobj\n")

                    // JPEG Image XObject (/DCTDecode)
                    offsets[imageObjId] = bytesWritten
                    writeAscii(
                        "$imageObjId 0 obj\n<<\n  /Type /XObject\n  /Subtype /Image\n" +
                            "  /Width $targetW\n  /Height $targetH\n" +
                            "  /ColorSpace /DeviceRGB\n  /BitsPerComponent 8\n" +
                            "  /Filter /DCTDecode\n  /Length ${jpegBytes.size}\n>>\nstream\n"
                    )
                    writeRaw(jpegBytes)
                    writeAscii("\nendstream\nendobj\n")
                }

                // Info Object
                offsets[infoObjId] = bytesWritten
                writeAscii("$infoObjId 0 obj\n<<\n  /Producer (Hikmah StudentKit PDF Compressor)\n>>\nendobj\n")

                // Cross-Reference Table
                val startXref = bytesWritten
                writeAscii("xref\n0 ${infoObjId + 1}\n0000000000 65535 f \n")
                for (objIdx in 1..infoObjId) {
                    writeAscii(String.format(Locale.US, "%010d 00000 n \n", offsets[objIdx]))
                }

                // Trailer
                writeAscii(
                    "trailer\n<<\n  /Size ${infoObjId + 1}\n  /Root 1 0 R\n  /Info $infoObjId 0 R\n>>\n" +
                        "startxref\n$startXref\n%%EOF\n"
                )
                bos.flush()
            }

            renderer.close()
            renderer = null
            pfd.close()

            val compressedBytes = tempOutFile.length()
            val originalBytes = detectedBytes.takeIf { it > 0L } ?: run {
                context.contentResolver.openInputStream(sourceUri)?.use { input ->
                    var count = 0L
                    val buf = ByteArray(8192)
                    while (true) {
                        val read = input.read(buf)
                        if (read == -1) break
                        count += read
                    }
                    count
                } ?: 0L
            }

            // Safeguard: never bloat an already ultra-compact (e.g. pure-vector) PDF
            if (originalBytes > 0L && compressedBytes >= originalBytes) {
                context.contentResolver.openInputStream(sourceUri)?.use { input ->
                    FileOutputStream(tempOutFile).use { output ->
                        input.copyTo(output)
                        output.flush()
                    }
                }
                return CompressionOutput(
                    tempFile = tempOutFile,
                    originalBytes = originalBytes,
                    compressedBytes = tempOutFile.length(),
                    keptOriginal = true
                )
            }

            return CompressionOutput(
                tempFile = tempOutFile,
                originalBytes = originalBytes,
                compressedBytes = compressedBytes,
                keptOriginal = false
            )
        } catch (e: Exception) {
            tempOutFile.delete()
            throw e
        } finally {
            try {
                renderer?.close()
            } catch (_: Exception) {}
            try {
                pfd.close()
            } catch (_: Exception) {}
        }
    }
}
