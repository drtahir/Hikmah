package com.drtahir.studentkit.ui.screens

import android.content.Intent
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drtahir.studentkit.data.VideoAudioProcessor
import com.drtahir.studentkit.viewmodel.StudentKitViewModel
import kotlinx.coroutines.launch

@Composable
fun VideoAudioStudioScreen(viewModel: StudentKitViewModel) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var activeToolTab by remember { mutableIntStateOf(0) } // 0=Compress, 1=Trim, 2=Extract Audio
    var selectedVideo by remember { mutableStateOf<VideoAudioProcessor.VideoInfo?>(null) }

    var compressionPreset by remember { mutableStateOf(VideoAudioProcessor.CompressionPreset.BALANCED_480P) }
    var trimStartMs by remember { mutableFloatStateOf(0f) }
    var trimEndMs by remember { mutableFloatStateOf(10_000f) }

    var isProcessing by remember { mutableStateOf(false) }
    var progress by remember { mutableFloatStateOf(0f) }
    var statusText by remember { mutableStateOf("") }
    var lastResult by remember { mutableStateOf<VideoAudioProcessor.MediaProcessResult?>(null) }

    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            scope.launch {
                val info = VideoAudioProcessor.inspectVideo(context, uri)
                if (info != null) {
                    selectedVideo = info
                    trimStartMs = 0f
                    trimEndMs = info.durationMs.toFloat().coerceAtLeast(1000f)
                    lastResult = null
                } else {
                    Toast.makeText(context, "Unable to read selected video file.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Mode Selector Pills
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("Compress Video", "Trim Video Clip", "Video -> Audio (M4A)").forEachIndexed { idx, lbl ->
                FilterChip(
                    selected = activeToolTab == idx,
                    onClick = { activeToolTab = idx; lastResult = null },
                    label = { Text(lbl, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
            }
        }

        // Video Picker Card
        Card(
            onClick = { videoPicker.launch(arrayOf("video/*")) },
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.VideoLibrary, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(34.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = selectedVideo?.name ?: "Tap to Pick Any Video",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        maxLines = 1
                    )
                    Text(
                        text = if (selectedVideo != null) {
                            "${selectedVideo!!.width}x${selectedVideo!!.height} • ${VideoAudioProcessor.formatDuration(selectedVideo!!.durationMs)} • ${selectedVideo!!.sizeFormatted}"
                        } else {
                            "Supports MP4, MKV, 3GP, MOV from gallery or downloads"
                        },
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }
                OutlinedButton(onClick = { videoPicker.launch(arrayOf("video/*")) }, shape = RoundedCornerShape(10.dp)) {
                    Text("Browse", fontSize = 11.sp)
                }
            }
        }

        selectedVideo?.let { info ->
            when (activeToolTab) {
                // 0: VIDEO COMPRESSOR
                0 -> {
                    Text("Select Compression Preset:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    VideoAudioProcessor.CompressionPreset.values().forEach { preset ->
                        Card(
                            onClick = { compressionPreset = preset },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (compressionPreset == preset) MaterialTheme.colorScheme.primaryContainer
                                else MaterialTheme.colorScheme.surface
                            ),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                RadioButton(selected = compressionPreset == preset, onClick = { compressionPreset = preset })
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text(preset.label, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text(preset.subtitle, fontSize = 11.sp, color = Color.Gray)
                                }
                            }
                        }
                    }
                }

                // 1: VIDEO TRIMMER
                1 -> {
                    val dur = info.durationMs.toFloat().coerceAtLeast(1000f)
                    Text(
                        text = "Trim Window: ${VideoAudioProcessor.formatDuration(trimStartMs.toLong())} -> ${VideoAudioProcessor.formatDuration(trimEndMs.toLong())}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Text("Start Time", fontSize = 11.sp, color = Color.Gray)
                    Slider(
                        value = trimStartMs,
                        onValueChange = { trimStartMs = it.coerceAtMost(trimEndMs - 500f) },
                        valueRange = 0f..dur
                    )
                    Text("End Time", fontSize = 11.sp, color = Color.Gray)
                    Slider(
                        value = trimEndMs,
                        onValueChange = { trimEndMs = it.coerceAtLeast(trimStartMs + 500f) },
                        valueRange = 0f..dur
                    )
                }

                // 2: AUDIO EXTRACTOR
                2 -> {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Lossless Audio Extraction (.m4a)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(
                                text = if (info.hasAudio) "Audio track detected. Saves directly to Music/StudentKit_Audio with zero quality loss."
                                else "Warning: Selected video may not contain an audio stream.",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }
            }

            if (isProcessing) {
                LinearProgressIndicator(progress = { progress }, modifier = Modifier.fillMaxWidth().height(6.dp))
                Text(statusText, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
            }

            Button(
                onClick = {
                    isProcessing = true
                    lastResult = null
                    progress = 0.05f
                    statusText = "Starting..."
                    scope.launch {
                        val res = when (activeToolTab) {
                            0 -> VideoAudioProcessor.compressVideo(context, info, compressionPreset) { p, s ->
                                progress = p; statusText = s
                            }
                            1 -> VideoAudioProcessor.trimVideo(context, info, trimStartMs.toLong(), trimEndMs.toLong()) { p, s ->
                                progress = p; statusText = s
                            }
                            else -> VideoAudioProcessor.extractAudioFromVideo(context, info) { p, s ->
                                progress = p; statusText = s
                            }
                        }
                        isProcessing = false
                        lastResult = res
                        if (res == null) {
                            Toast.makeText(context, "Processing failed for this media format.", Toast.LENGTH_SHORT).show()
                        }
                    }
                },
                enabled = !isProcessing,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = when (activeToolTab) {
                        0 -> Icons.Default.Compress
                        1 -> Icons.Default.ContentCut
                        else -> Icons.Default.MusicNote
                    },
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    when (activeToolTab) {
                        0 -> "Compress Video (${compressionPreset.maxEdgePx}p)"
                        1 -> "Save Trimmed Video"
                        else -> "Extract Audio (.m4a)"
                    }
                )
            }

            lastResult?.let { res ->
                Card(
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.5.dp, Color(0xFF10B981)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF10B981).copy(alpha = 0.09f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Saved: ${res.outputName}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text(res.summary, fontSize = 12.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = {
                                    val i = Intent(Intent.ACTION_VIEW).apply {
                                        setDataAndType(res.outputUri, res.mimeType)
                                        flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                                    }
                                    try { context.startActivity(i) } catch (_: Exception) {}
                                },
                                modifier = Modifier.weight(1f)
                            ) { Text("Open", fontSize = 12.sp) }

                            OutlinedButton(
                                onClick = {
                                    val i = Intent(Intent.ACTION_SEND).apply {
                                        type = res.mimeType
                                        putExtra(Intent.EXTRA_STREAM, res.outputUri)
                                        flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                                    }
                                    context.startActivity(Intent.createChooser(i, "Share Media"))
                                },
                                modifier = Modifier.weight(1f)
                            ) { Text("Share", fontSize = 12.sp) }
                        }
                    }
                }
            }
        }
    }
}
