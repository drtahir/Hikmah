package com.drtahir.studentkit.data

import android.content.ContentValues
import android.content.Context
import android.graphics.SurfaceTexture
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.media.MediaMuxer
import android.net.Uri
import android.opengl.EGL14
import android.opengl.EGLConfig
import android.opengl.EGLContext
import android.opengl.EGLDisplay
import android.opengl.EGLExt
import android.opengl.EGLSurface
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.view.Surface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.util.Locale

/**
 * 100% Offline Hardware-Accelerated Video Compressor, Trimmer & Audio Extractor.
 * Uses Android MediaExtractor, MediaMuxer & MediaCodec/EGL14 without third-party native bloat.
 */
object VideoAudioProcessor {

    enum class CompressionPreset(
        val label: String,
        val maxEdgePx: Int,
        val videoBitrateBps: Int,
        val subtitle: String
    ) {
        WHATSAPP_720P("720p WhatsApp HD", 1280, 1_500_000, "Sharp 720p HD with ~50-70% smaller size"),
        BALANCED_480P("480p Fast Share", 854, 850_000, "Ideal balance for lectures & quick WhatsApp upload"),
        SMALL_360P("360p Ultra Compact", 640, 420_000, "Smallest size for slow mobile data")
    }

    data class VideoInfo(
        val uri: Uri,
        val name: String,
        val sizeBytes: Long,
        val sizeFormatted: String,
        val durationMs: Long,
        val width: Int,
        val height: Int,
        val rotationDegrees: Int,
        val hasAudio: Boolean
    )

    data class MediaProcessResult(
        val outputUri: Uri,
        val outputName: String,
        val originalBytes: Long,
        val outputBytes: Long,
        val mimeType: String,
        val summary: String
    )

    suspend fun inspectVideo(context: Context, uri: Uri): VideoInfo? = withContext(Dispatchers.IO) {
        try {
            var name = "Video.mp4"
            var sizeBytes = 0L
            context.contentResolver.query(uri, null, null, null, null)?.use { c ->
                val nIdx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sIdx = c.getColumnIndex(OpenableColumns.SIZE)
                if (c.moveToFirst()) {
                    if (nIdx != -1) name = c.getString(nIdx) ?: name
                    if (sIdx != -1) sizeBytes = c.getLong(sIdx)
                }
            }

            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(context, uri)
            val durMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L
            val w = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 1280
            val h = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 720
            val rot = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull() ?: 0
            val hasAudioStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_HAS_AUDIO)
            retriever.release()

            VideoInfo(
                uri = uri,
                name = name,
                sizeBytes = sizeBytes,
                sizeFormatted = formatBytes(sizeBytes),
                durationMs = durMs,
                width = w,
                height = h,
                rotationDegrees = rot,
                hasAudio = hasAudioStr.equals("yes", ignoreCase = true)
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Lossless packet-level trim between [startMs, endMs] using MediaExtractor + MediaMuxer.
     */
    suspend fun trimVideo(
        context: Context,
        info: VideoInfo,
        startMs: Long,
        endMs: Long,
        onProgress: (Float, String) -> Unit
    ): MediaProcessResult? = withContext(Dispatchers.IO) {
        val tempOut = File(context.cacheDir, "trim_${System.currentTimeMillis()}.mp4")
        val extractor = MediaExtractor()
        var muxer: MediaMuxer? = null
        try {
            onProgress(0.08f, "Reading MP4 container tracks...")
            extractor.setDataSource(context, info.uri, null)

            muxer = MediaMuxer(tempOut.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            if (info.rotationDegrees != 0) {
                muxer.setOrientationHint(info.rotationDegrees)
            }

            val trackIndexMap = mutableMapOf<Int, Int>()
            for (i in 0 until extractor.trackCount) {
                val fmt = extractor.getTrackFormat(i)
                val mime = fmt.getString(MediaFormat.KEY_MIME) ?: continue
                if (mime.startsWith("video/") || mime.startsWith("audio/")) {
                    val dstIdx = muxer.addTrack(fmt)
                    trackIndexMap[i] = dstIdx
                    extractor.selectTrack(i)
                }
            }

            if (trackIndexMap.isEmpty()) return@withContext null

            muxer.start()
            val startUs = (startMs.coerceAtLeast(0L)) * 1000L
            val endUs = (endMs.coerceAtMost(info.durationMs)).coerceAtLeast(startMs + 500L) * 1000L
            extractor.seekTo(startUs, MediaExtractor.SEEK_TO_PREVIOUS_SYNC)

            val buffer = ByteBuffer.allocateDirect(1024 * 1024)
            val bufferInfo = MediaCodec.BufferInfo()
            val spanUs = (endUs - startUs).coerceAtLeast(1000L)

            while (true) {
                val sampleSize = extractor.readSampleData(buffer, 0)
                if (sampleSize < 0) break
                val ptsUs = extractor.sampleTime
                if (ptsUs > endUs) break

                val srcTrack = extractor.sampleTrackIndex
                val dstTrack = trackIndexMap[srcTrack]
                if (dstTrack != null && ptsUs >= startUs - 500_000L) {
                    bufferInfo.offset = 0
                    bufferInfo.size = sampleSize
                    bufferInfo.presentationTimeUs = (ptsUs - startUs).coerceAtLeast(0L)
                    bufferInfo.flags = if ((extractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC) != 0) {
                        MediaCodec.BUFFER_FLAG_KEY_FRAME
                    } else 0
                    muxer.writeSampleData(dstTrack, buffer, bufferInfo)
                }

                val pct = 0.1f + 0.8f * ((ptsUs - startUs).toFloat() / spanUs.toFloat()).coerceIn(0f, 1f)
                onProgress(pct, "Trimming video clip...")
                extractor.advance()
            }

            muxer.stop()
            muxer.release()
            muxer = null
            extractor.release()

            onProgress(0.95f, "Saving trimmed clip to Movies...")
            val cleanBase = info.name.substringBeforeLast(".").replace(Regex("[^a-zA-Z0-9._-]"), "_")
            val outName = "${cleanBase}_trimmed_${System.currentTimeMillis()}.mp4"
            val savedUri = saveFileToMediaStore(context, tempOut, outName, "video/mp4", isAudio = false)
                ?: return@withContext null
            val outBytes = tempOut.length()
            onProgress(1f, "Trimmed MP4 saved!")
            MediaProcessResult(
                outputUri = savedUri,
                outputName = outName,
                originalBytes = info.sizeBytes,
                outputBytes = outBytes,
                mimeType = "video/mp4",
                summary = "Trimmed ${formatDuration(endMs - startMs)} clip (${formatBytes(outBytes)})"
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try { muxer?.release() } catch (_: Exception) {}
            try { extractor.release() } catch (_: Exception) {}
            tempOut.delete()
        }
    }

    /**
     * Extracts pure AAC/M4A audio stream from a video without re-encoding loss.
     */
    suspend fun extractAudioFromVideo(
        context: Context,
        info: VideoInfo,
        onProgress: (Float, String) -> Unit
    ): MediaProcessResult? = withContext(Dispatchers.IO) {
        val tempOut = File(context.cacheDir, "audio_${System.currentTimeMillis()}.m4a")
        val extractor = MediaExtractor()
        var muxer: MediaMuxer? = null
        try {
            onProgress(0.1f, "Scanning audio tracks...")
            extractor.setDataSource(context, info.uri, null)
            var audioTrack = -1
            var audioFormat: MediaFormat? = null
            for (i in 0 until extractor.trackCount) {
                val fmt = extractor.getTrackFormat(i)
                val mime = fmt.getString(MediaFormat.KEY_MIME) ?: ""
                if (mime.startsWith("audio/")) {
                    audioTrack = i
                    audioFormat = fmt
                    break
                }
            }
            if (audioTrack == -1 || audioFormat == null) return@withContext null

            extractor.selectTrack(audioTrack)
            muxer = MediaMuxer(tempOut.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            val dstTrack = muxer.addTrack(audioFormat)
            muxer.start()

            val buffer = ByteBuffer.allocateDirect(512 * 1024)
            val bufferInfo = MediaCodec.BufferInfo()
            val totalUs = (info.durationMs * 1000L).coerceAtLeast(1000L)

            while (true) {
                val size = extractor.readSampleData(buffer, 0)
                if (size < 0) break
                bufferInfo.offset = 0
                bufferInfo.size = size
                bufferInfo.presentationTimeUs = extractor.sampleTime.coerceAtLeast(0L)
                bufferInfo.flags = if ((extractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC) != 0) {
                    MediaCodec.BUFFER_FLAG_KEY_FRAME
                } else 0
                muxer.writeSampleData(dstTrack, buffer, bufferInfo)
                val pct = 0.15f + 0.78f * (extractor.sampleTime.toFloat() / totalUs.toFloat()).coerceIn(0f, 1f)
                onProgress(pct, "Extracting crystal-clear audio...")
                extractor.advance()
            }

            muxer.stop()
            muxer.release()
            muxer = null
            extractor.release()

            onProgress(0.95f, "Saving audio track to Music...")
            val cleanBase = info.name.substringBeforeLast(".").replace(Regex("[^a-zA-Z0-9._-]"), "_")
            val outName = "${cleanBase}_audio_${System.currentTimeMillis()}.m4a"
            val savedUri = saveFileToMediaStore(context, tempOut, outName, "audio/mp4", isAudio = true)
                ?: return@withContext null
            val outBytes = tempOut.length()
            onProgress(1f, "Audio extracted cleanly!")
            MediaProcessResult(
                outputUri = savedUri,
                outputName = outName,
                originalBytes = info.sizeBytes,
                outputBytes = outBytes,
                mimeType = "audio/mp4",
                summary = "Extracted audio track (${formatBytes(outBytes)})"
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try { muxer?.release() } catch (_: Exception) {}
            try { extractor.release() } catch (_: Exception) {}
            tempOut.delete()
        }
    }

    /**
     * Hardware-accelerated H.264 video downscaler + bitrate compressor with audio passthrough.
     */
    suspend fun compressVideo(
        context: Context,
        info: VideoInfo,
        preset: CompressionPreset,
        onProgress: (Float, String) -> Unit
    ): MediaProcessResult? = withContext(Dispatchers.IO) {
        val tempOut = File(context.cacheDir, "comp_${System.currentTimeMillis()}.mp4")
        val videoExtractor = MediaExtractor()
        val audioExtractor = MediaExtractor()
        var encoder: MediaCodec? = null
        var decoder: MediaCodec? = null
        var muxer: MediaMuxer? = null
        var eglState: EglVideoRenderer? = null

        try {
            onProgress(0.05f, "Analyzing source video codec...")
            videoExtractor.setDataSource(context, info.uri, null)
            audioExtractor.setDataSource(context, info.uri, null)

            var videoTrackIdx = -1
            var srcVideoFmt: MediaFormat? = null
            var audioTrackIdx = -1
            var srcAudioFmt: MediaFormat? = null

            for (i in 0 until videoExtractor.trackCount) {
                val fmt = videoExtractor.getTrackFormat(i)
                val mime = fmt.getString(MediaFormat.KEY_MIME) ?: ""
                if (videoTrackIdx == -1 && mime.startsWith("video/")) {
                    videoTrackIdx = i
                    srcVideoFmt = fmt
                } else if (audioTrackIdx == -1 && mime.startsWith("audio/")) {
                    audioTrackIdx = i
                    srcAudioFmt = fmt
                }
            }

            if (videoTrackIdx == -1 || srcVideoFmt == null) return@withContext null

            val maxDim = maxOf(info.width, info.height).coerceAtLeast(1)
            val scale = (preset.maxEdgePx.toFloat() / maxDim.toFloat()).coerceAtMost(1.0f)
            // Keep dimensions even multiples of 16 for universal MediaCodec hardware support
            var outW = ((info.width * scale).toInt() / 16) * 16
            var outH = ((info.height * scale).toInt() / 16) * 16
            outW = outW.coerceAtLeast(256)
            outH = outH.coerceAtLeast(256)

            val encFmt = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, outW, outH).apply {
                setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
                setInteger(MediaFormat.KEY_BIT_RATE, preset.videoBitrateBps)
                setInteger(MediaFormat.KEY_FRAME_RATE, 30)
                setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 2)
            }

            encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
            encoder.configure(encFmt, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            val encoderInputSurface = encoder.createInputSurface()
            encoder.start()

            eglState = EglVideoRenderer(encoderInputSurface)
            val decoderSurface = Surface(eglState.surfaceTexture)

            val srcMime = srcVideoFmt.getString(MediaFormat.KEY_MIME) ?: MediaFormat.MIMETYPE_VIDEO_AVC
            decoder = MediaCodec.createDecoderByType(srcMime)
            decoder.configure(srcVideoFmt, decoderSurface, null, 0)
            decoder.start()

            videoExtractor.selectTrack(videoTrackIdx)
            if (audioTrackIdx != -1) audioExtractor.selectTrack(audioTrackIdx)

            muxer = MediaMuxer(tempOut.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            if (info.rotationDegrees != 0) {
                muxer.setOrientationHint(info.rotationDegrees)
            }

            var muxVideoTrack = -1
            var muxAudioTrack = -1
            var muxerStarted = false

            val pendingAudioSamples = mutableListOf<Pair<ByteArray, MediaCodec.BufferInfo>>()
            var extractorDone = false
            var decoderDone = false
            var encoderDone = false
            val decInfo = MediaCodec.BufferInfo()
            val encInfo = MediaCodec.BufferInfo()
            val totalUs = (info.durationMs * 1000L).coerceAtLeast(1000L)

            while (!encoderDone) {
                if (!extractorDone) {
                    val inIdx = decoder.dequeueInputBuffer(10_000L)
                    if (inIdx >= 0) {
                        val buf = decoder.getInputBuffer(inIdx)!!
                        val sampleSize = videoExtractor.readSampleData(buf, 0)
                        if (sampleSize < 0) {
                            decoder.queueInputBuffer(inIdx, 0, 0, 0L, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                            extractorDone = true
                        } else {
                            decoder.queueInputBuffer(inIdx, 0, sampleSize, videoExtractor.sampleTime, 0)
                            videoExtractor.advance()
                        }
                    }
                }

                var decoderOutputReady = !decoderDone
                while (decoderOutputReady) {
                    val outIdx = decoder.dequeueOutputBuffer(decInfo, 10_000L)
                    when {
                        outIdx == MediaCodec.INFO_TRY_AGAIN_LATER -> decoderOutputReady = false
                        outIdx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {}
                        outIdx >= 0 -> {
                            val doRender = decInfo.size > 0
                            decoder.releaseOutputBuffer(outIdx, doRender)
                            if (doRender) {
                                eglState.awaitNewImage()
                                eglState.drawImage()
                                eglState.setPresentationTime(decInfo.presentationTimeUs * 1000L)
                                eglState.swapBuffers()
                                val pct = 0.1f + 0.8f * (decInfo.presentationTimeUs.toFloat() / totalUs.toFloat()).coerceIn(0f, 1f)
                                onProgress(pct, "Compressing H.264 (${outW}x$outH)...")
                            }
                            if ((decInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                                encoder.signalEndOfInputStream()
                                decoderDone = true
                                decoderOutputReady = false
                            }
                        }
                    }
                }

                var encoderOutputReady = true
                while (encoderOutputReady) {
                    val encIdx = encoder.dequeueOutputBuffer(encInfo, 10_000L)
                    when {
                        encIdx == MediaCodec.INFO_TRY_AGAIN_LATER -> encoderOutputReady = false
                        encIdx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                            val outFmt = encoder.outputFormat
                            muxVideoTrack = muxer.addTrack(outFmt)
                            if (audioTrackIdx != -1 && srcAudioFmt != null) {
                                muxAudioTrack = muxer.addTrack(srcAudioFmt)
                            }
                            muxer.start()
                            muxerStarted = true
                        }
                        encIdx >= 0 -> {
                            val encodedBuf = encoder.getOutputBuffer(encIdx)!!
                            if ((encInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0) {
                                encInfo.size = 0
                            }
                            if (encInfo.size > 0 && muxerStarted) {
                                encodedBuf.position(encInfo.offset)
                                encodedBuf.limit(encInfo.offset + encInfo.size)
                                muxer.writeSampleData(muxVideoTrack, encodedBuf, encInfo)
                            }
                            encoder.releaseOutputBuffer(encIdx, false)
                            if ((encInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                                encoderDone = true
                                encoderOutputReady = false
                            }
                        }
                    }
                }
            }

            if (muxerStarted && muxAudioTrack != -1) {
                onProgress(0.92f, "Muxing original audio track...")
                val aBuf = ByteBuffer.allocateDirect(256 * 1024)
                val aInfo = MediaCodec.BufferInfo()
                while (true) {
                    val size = audioExtractor.readSampleData(aBuf, 0)
                    if (size < 0) break
                    aInfo.offset = 0
                    aInfo.size = size
                    aInfo.presentationTimeUs = audioExtractor.sampleTime.coerceAtLeast(0L)
                    aInfo.flags = if ((audioExtractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC) != 0) {
                        MediaCodec.BUFFER_FLAG_KEY_FRAME
                    } else 0
                    muxer.writeSampleData(muxAudioTrack, aBuf, aInfo)
                    audioExtractor.advance()
                }
            }

            pendingAudioSamples.clear()
            muxer.stop()
            muxer.release()
            muxer = null

            onProgress(0.96f, "Saving compressed video to Movies...")
            val cleanBase = info.name.substringBeforeLast(".").replace(Regex("[^a-zA-Z0-9._-]"), "_")
            val outName = "${cleanBase}_${preset.maxEdgePx}p_${System.currentTimeMillis()}.mp4"
            val savedUri = saveFileToMediaStore(context, tempOut, outName, "video/mp4", isAudio = false)
                ?: return@withContext null
            val outBytes = tempOut.length()
            val savedPct = if (info.sizeBytes > 0 && outBytes < info.sizeBytes) {
                ((info.sizeBytes - outBytes) * 100L / info.sizeBytes).toInt()
            } else 0

            onProgress(1f, "Video compression complete!")
            MediaProcessResult(
                outputUri = savedUri,
                outputName = outName,
                originalBytes = info.sizeBytes,
                outputBytes = outBytes,
                mimeType = "video/mp4",
                summary = "${formatBytes(info.sizeBytes)} -> ${formatBytes(outBytes)} ($savedPct% smaller, ${outW}x$outH)"
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try { decoder?.stop() } catch (_: Exception) {}
            try { decoder?.release() } catch (_: Exception) {}
            try { encoder?.stop() } catch (_: Exception) {}
            try { encoder?.release() } catch (_: Exception) {}
            try { eglState?.release() } catch (_: Exception) {}
            try { muxer?.release() } catch (_: Exception) {}
            try { videoExtractor.release() } catch (_: Exception) {}
            try { audioExtractor.release() } catch (_: Exception) {}
            tempOut.delete()
        }
    }

    private fun saveFileToMediaStore(
        context: Context,
        sourceFile: File,
        fileName: String,
        mimeType: String,
        isAudio: Boolean
    ): Uri? {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val rel = if (isAudio) "${Environment.DIRECTORY_MUSIC}/StudentKit_Audio"
                else "${Environment.DIRECTORY_MOVIES}/StudentKit_Video"
                put(MediaStore.MediaColumns.RELATIVE_PATH, rel)
            }
        }
        val collection = if (isAudio) {
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        } else {
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI
        }
        val uri = resolver.insert(collection, values) ?: return null
        resolver.openOutputStream(uri)?.use { out ->
            FileInputStream(sourceFile).use { input ->
                input.copyTo(out, 65536)
            }
        }
        return uri
    }

    fun formatBytes(bytes: Long): String {
        if (bytes <= 0L) return "0 KB"
        val kb = bytes / 1024.0
        val mb = kb / 1024.0
        return if (mb >= 1.0) String.format(Locale.US, "%.2f MB", mb)
        else String.format(Locale.US, "%.1f KB", kb)
    }

    fun formatDuration(ms: Long): String {
        val totalSec = (ms / 1000L).coerceAtLeast(0L)
        val mins = totalSec / 60L
        val secs = totalSec % 60L
        return String.format(Locale.US, "%02d:%02d", mins, secs)
    }

    /**
     * Minimal EGL14 + OpenGL ES 2.0 SurfaceTexture pass-through renderer linking
     * MediaCodec Decoder Surface -> MediaCodec Encoder Surface cleanly.
     */
    private class EglVideoRenderer(encoderInputSurface: Surface) : SurfaceTexture.OnFrameAvailableListener {
        private var eglDisplay: EGLDisplay = EGL14.EGL_NO_DISPLAY
        private var eglContext: EGLContext = EGL14.EGL_NO_CONTEXT
        private var eglSurface: EGLSurface = EGL14.EGL_NO_SURFACE
        private var textureId = 0
        val surfaceTexture: SurfaceTexture

        private var program = 0
        private var uStMatrixHandle = 0
        private var aPosHandle = 0
        private var aTexHandle = 0
        private val stMatrix = FloatArray(16)
        private val frameSync = Object()
        @Volatile private var frameAvailable = false

        private val quadData = floatArrayOf(
            -1f, -1f, 0f, 0f,
            1f, -1f, 1f, 0f,
            -1f, 1f, 0f, 1f,
            1f, 1f, 1f, 1f
        )
        private val quadBuffer: FloatBuffer = ByteBuffer
            .allocateDirect(quadData.size * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer()
            .apply { put(quadData); position(0) }

        init {
            eglDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
            val version = IntArray(2)
            EGL14.eglInitialize(eglDisplay, version, 0, version, 1)

            val attribList = intArrayOf(
                EGL14.EGL_RED_SIZE, 8,
                EGL14.EGL_GREEN_SIZE, 8,
                EGL14.EGL_BLUE_SIZE, 8,
                EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
                0x3142, 1, // EGL_RECORDABLE_ANDROID
                EGL14.EGL_NONE
            )
            val configs = arrayOfNulls<EGLConfig>(1)
            val numConfigs = IntArray(1)
            EGL14.eglChooseConfig(eglDisplay, attribList, 0, configs, 0, 1, numConfigs, 0)
            val ctxAttribs = intArrayOf(EGL14.EGL_CONTEXT_CLIENT_VERSION, 2, EGL14.EGL_NONE)
            eglContext = EGL14.eglCreateContext(eglDisplay, configs[0], EGL14.EGL_NO_CONTEXT, ctxAttribs, 0)
            val surfAttribs = intArrayOf(EGL14.EGL_NONE)
            eglSurface = EGL14.eglCreateWindowSurface(eglDisplay, configs[0], encoderInputSurface, surfAttribs, 0)
            EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)

            val textures = IntArray(1)
            GLES20.glGenTextures(1, textures, 0)
            textureId = textures[0]
            GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)
            GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR.toFloat())
            GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())

            surfaceTexture = SurfaceTexture(textureId)
            surfaceTexture.setOnFrameAvailableListener(this)

            val vShader = compileShader(
                GLES20.GL_VERTEX_SHADER,
                "uniform mat4 uSTMatrix;\nattribute vec4 aPosition;\nattribute vec4 aTexCoord;\nvarying vec2 vTex;\nvoid main() {\n  gl_Position = aPosition;\n  vTex = (uSTMatrix * aTexCoord).xy;\n}"
            )
            val fShader = compileShader(
                GLES20.GL_FRAGMENT_SHADER,
                "#extension GL_OES_EGL_image_external : require\nprecision mediump float;\nvarying vec2 vTex;\nuniform samplerExternalOES sTexture;\nvoid main() {\n  gl_FragColor = texture2D(sTexture, vTex);\n}"
            )
            program = GLES20.glCreateProgram()
            GLES20.glAttachShader(program, vShader)
            GLES20.glAttachShader(program, fShader)
            GLES20.glLinkProgram(program)
            aPosHandle = GLES20.glGetAttribLocation(program, "aPosition")
            aTexHandle = GLES20.glGetAttribLocation(program, "aTexCoord")
            uStMatrixHandle = GLES20.glGetUniformLocation(program, "uSTMatrix")
        }

        private fun compileShader(type: Int, src: String): Int {
            val s = GLES20.glCreateShader(type)
            GLES20.glShaderSource(s, src)
            GLES20.glCompileShader(s)
            return s
        }

        override fun onFrameAvailable(st: SurfaceTexture?) {
            synchronized(frameSync) {
                frameAvailable = true
                frameSync.notifyAll()
            }
        }

        fun awaitNewImage() {
            synchronized(frameSync) {
                if (!frameAvailable) {
                    frameSync.wait(1500L)
                }
                frameAvailable = false
            }
            surfaceTexture.updateTexImage()
            surfaceTexture.getTransformMatrix(stMatrix)
        }

        fun drawImage() {
            GLES20.glUseProgram(program)
            GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
            GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)

            quadBuffer.position(0)
            GLES20.glVertexAttribPointer(aPosHandle, 2, GLES20.GL_FLOAT, false, 16, quadBuffer)
            GLES20.glEnableVertexAttribArray(aPosHandle)

            quadBuffer.position(2)
            GLES20.glVertexAttribPointer(aTexHandle, 2, GLES20.GL_FLOAT, false, 16, quadBuffer)
            GLES20.glEnableVertexAttribArray(aTexHandle)

            GLES20.glUniformMatrix4fv(uStMatrixHandle, 1, false, stMatrix, 0)
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        }

        fun setPresentationTime(nsecs: Long) {
            EGLExt.eglPresentationTimeANDROID(eglDisplay, eglSurface, nsecs)
        }

        fun swapBuffers() {
            EGL14.eglSwapBuffers(eglDisplay, eglSurface)
        }

        fun release() {
            if (eglDisplay != EGL14.EGL_NO_DISPLAY) {
                EGL14.eglDestroySurface(eglDisplay, eglSurface)
                EGL14.eglDestroyContext(eglDisplay, eglContext)
                EGL14.eglReleaseThread()
                EGL14.eglTerminate(eglDisplay)
            }
            surfaceTexture.release()
            eglDisplay = EGL14.EGL_NO_DISPLAY
            eglContext = EGL14.EGL_NO_CONTEXT
            eglSurface = EGL14.EGL_NO_SURFACE
        }
    }
}
