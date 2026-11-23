package com.drtahir.studentkit.ui.screens

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.drtahir.studentkit.data.PdfSignRedactEngine
import com.drtahir.studentkit.viewmodel.StudentKitViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun PdfSignRedactScreen(viewModel: StudentKitViewModel) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var modeTab by remember { mutableIntStateOf(0) } // 0 = Interactive Sign & Redact, 1 = Word/Text -> PDF

    // Mode 0 state
    var selectedPdf by remember { mutableStateOf<ComprehensivePdfFile?>(null) }
    var currentPageIdx by remember { mutableIntStateOf(0) }
    var pageBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var stampTool by remember { mutableIntStateOf(0) } // 0=Signature, 1=Text/Date, 2=Redact Blackout
    var customTextStamp by remember { mutableStateOf("Dr. Tahir Khan") }
    var drawnSignatureStrokes by remember { mutableStateOf<List<List<Pair<Float, Float>>>>(emptyList()) }
    var showSignaturePad by remember { mutableStateOf(false) }
    var annotations by remember { mutableStateOf<List<PdfSignRedactEngine.PdfOverlayAnnotation>>(emptyList()) }

    // Mode 1 (Word/Text -> PDF) state
    var docTitle by remember { mutableStateOf("Official Document") }
    var docBody by remember { mutableStateOf("# Heading Example\n\nWrite, paste or import any Word (.docx) or TXT file to export as a crisp paginated A4 PDF.") }

    var isBusy by remember { mutableStateOf(false) }
    var statusText by remember { mutableStateOf("") }
    var exportedPdfUri by remember { mutableStateOf<Uri?>(null) }

    val pdfPicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            val item = parseComprehensivePdfFile(context, uri)
            if (item != null) {
                selectedPdf = item
                currentPageIdx = 0
                annotations = emptyList()
                exportedPdfUri = null
            } else {
                Toast.makeText(context, "Could not open PDF.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    val docxOrTxtPicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            scope.launch {
                val parsed = parseComprehensivePdfFileName(context, uri)
                docTitle = parsed.substringBeforeLast(".")
                val extracted = PdfSignRedactEngine.extractReadableTextFromDocument(context, uri, parsed)
                if (extracted.isNotBlank()) {
                    docBody = extracted
                    Toast.makeText(context, "Loaded content from $parsed", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "No readable text found in document.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    LaunchedEffect(selectedPdf, currentPageIdx) {
        val file = selectedPdf
        pageBitmap = if (file != null) {
            withContext(Dispatchers.IO) { renderComprehensivePdfPage(context, file.uri, currentPageIdx, maxDim = 900) }
        } else null
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = modeTab == 0,
                onClick = { modeTab = 0; exportedPdfUri = null },
                label = { Text("Sign & Redact PDF", fontSize = 12.sp) }
            )
            FilterChip(
                selected = modeTab == 1,
                onClick = { modeTab = 1; exportedPdfUri = null },
                label = { Text("Word / Text -> PDF", fontSize = 12.sp) }
            )
        }

        if (modeTab == 0) {
            if (selectedPdf == null) {
                Card(
                    onClick = { pdfPicker.launch(arrayOf("application/pdf")) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth().height(180.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.Draw, contentDescription = null, modifier = Modifier.size(44.dp), tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Pick PDF to Fill, Sign or Redact", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("Tap anywhere on a page to place signatures, dates or blackout bars", fontSize = 11.sp, color = Color.Gray)
                    }
                }
            } else {
                val file = selectedPdf!!
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("${file.name} (${currentPageIdx + 1}/${file.pageCount})", fontWeight = FontWeight.Bold, fontSize = 13.sp, modifier = Modifier.weight(1f))
                    Row {
                        IconButton(onClick = { if (currentPageIdx > 0) currentPageIdx-- }, enabled = currentPageIdx > 0) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = "Prev")
                        }
                        IconButton(onClick = { if (currentPageIdx < file.pageCount - 1) currentPageIdx++ }, enabled = currentPageIdx < file.pageCount - 1) {
                            Icon(Icons.Default.ChevronRight, contentDescription = "Next")
                        }
                    }
                }

                // Tool selection
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(selected = stampTool == 0, onClick = {
                        stampTool = 0
                        if (drawnSignatureStrokes.isEmpty()) showSignaturePad = true
                    }, label = { Text("Sign", fontSize = 11.sp) })
                    FilterChip(selected = stampTool == 1, onClick = { stampTool = 1 }, label = { Text("Text Stamp", fontSize = 11.sp) })
                    FilterChip(selected = stampTool == 2, onClick = { stampTool = 2 }, label = { Text("Redact Blackout", fontSize = 11.sp) })
                }

                if (stampTool == 0) {
                    OutlinedButton(onClick = { showSignaturePad = true }, shape = RoundedCornerShape(10.dp)) {
                        Icon(Icons.Default.Gesture, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (drawnSignatureStrokes.isEmpty()) "Draw Signature Ink" else "Redraw Signature (${drawnSignatureStrokes.size} strokes)", fontSize = 12.sp)
                    }
                } else if (stampTool == 1) {
                    OutlinedTextField(
                        value = customTextStamp,
                        onValueChange = { customTextStamp = it },
                        label = { Text("Stamp Text / Date") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Interactive Page Stage
                pageBitmap?.let { bmp ->
                    var boxSize by remember { mutableStateOf(IntSize(1, 1)) }
                    val aspect = bmp.width.toFloat() / bmp.height.toFloat().coerceAtLeast(1f)
                    val pageAnns = annotations.filter { it.pageIndex == currentPageIdx }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(aspect)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(10.dp))
                            .onSizeChanged { boxSize = it }
                            .pointerInput(stampTool, currentPageIdx, customTextStamp, drawnSignatureStrokes) {
                                detectTapGestures { offset ->
                                    val xN = (offset.x / boxSize.width.coerceAtLeast(1)).coerceIn(0.05f, 0.95f)
                                    val yN = (offset.y / boxSize.height.coerceAtLeast(1)).coerceIn(0.05f, 0.95f)
                                    val newAnn = when (stampTool) {
                                        0 -> {
                                            if (drawnSignatureStrokes.isEmpty()) {
                                                showSignaturePad = true
                                                null
                                            } else {
                                                PdfSignRedactEngine.PdfOverlayAnnotation.SignatureStrokeStamp(
                                                    pageIndex = currentPageIdx, xNorm = xN, yNorm = yN, strokes = drawnSignatureStrokes
                                                )
                                            }
                                        }
                                        1 -> PdfSignRedactEngine.PdfOverlayAnnotation.TextStamp(
                                            pageIndex = currentPageIdx, xNorm = xN, yNorm = yN, text = customTextStamp.ifBlank { "APPROVED" }
                                        )
                                        else -> PdfSignRedactEngine.PdfOverlayAnnotation.RedactionBox(
                                            pageIndex = currentPageIdx, xNorm = xN, yNorm = yN
                                        )
                                    }
                                    if (newAnn != null) annotations = annotations + newAnn
                                }
                            }
                    ) {
                        Image(bitmap = bmp.asImageBitmap(), contentDescription = "PDF Page", modifier = Modifier.fillMaxSize())
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            pageAnns.forEach { ann ->
                                when (ann) {
                                    is PdfSignRedactEngine.PdfOverlayAnnotation.RedactionBox -> {
                                        val w = ann.widthNorm * size.width
                                        val h = ann.heightNorm * size.height
                                        drawRect(
                                            color = Color.Black,
                                            topLeft = Offset(ann.xNorm * size.width - w / 2f, ann.yNorm * size.height - h / 2f),
                                            size = Size(w, h)
                                        )
                                    }
                                    is PdfSignRedactEngine.PdfOverlayAnnotation.TextStamp -> {
                                        drawCircle(
                                            color = Color(0xFF1E3A8A).copy(alpha = 0.25f),
                                            radius = 12.dp.toPx(),
                                            center = Offset(ann.xNorm * size.width, ann.yNorm * size.height)
                                        )
                                    }
                                    is PdfSignRedactEngine.PdfOverlayAnnotation.SignatureStrokeStamp -> {
                                        val left = (ann.xNorm - ann.widthNorm / 2f) * size.width
                                        val top = (ann.yNorm - ann.heightNorm / 2f) * size.height
                                        val bw = ann.widthNorm * size.width
                                        val bh = ann.heightNorm * size.height
                                        ann.strokes.forEach { st ->
                                            if (st.size >= 2) {
                                                val p = Path()
                                                p.moveTo(left + st[0].first * bw, top + st[0].second * bh)
                                                for (i in 1 until st.size) p.lineTo(left + st[i].first * bw, top + st[i].second * bh)
                                                drawPath(p, color = Color(0xFF0F172A), style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(
                            onClick = { if (annotations.isNotEmpty()) annotations = annotations.dropLast(1) },
                            enabled = annotations.isNotEmpty(),
                            modifier = Modifier.weight(1f)
                        ) { Text("Undo Stamp (${annotations.size})", fontSize = 12.sp) }

                        Button(
                            onClick = {
                                isBusy = true
                                statusText = "Burning signatures & redactions..."
                                scope.launch {
                                    val out = PdfSignRedactEngine.exportSignedAndRedactedPdf(context, file.uri, file.name, annotations) { _, s ->
                                        statusText = s
                                    }
                                    isBusy = false
                                    exportedPdfUri = out
                                    if (out != null) Toast.makeText(context, "Flattened PDF saved to Downloads!", Toast.LENGTH_SHORT).show()
                                }
                            },
                            enabled = !isBusy && annotations.isNotEmpty(),
                            modifier = Modifier.weight(1f)
                        ) { Text("Save Flattened PDF", fontSize = 12.sp) }
                    }
                }
            }
        } else {
            // Mode 1: Word (.docx) / Text / Markdown -> PDF
            OutlinedButton(
                onClick = {
                    docxOrTxtPicker.launch(
                        arrayOf(
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "text/plain",
                            "text/markdown"
                        )
                    )
                },
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Import .docx / .txt File (Optional)", fontSize = 12.sp)
            }

            OutlinedTextField(
                value = docTitle,
                onValueChange = { docTitle = it },
                label = { Text("PDF Header Title") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = docBody,
                onValueChange = { docBody = it },
                label = { Text("Document Content (Use # for Headings)") },
                minLines = 7,
                modifier = Modifier.fillMaxWidth()
            )

            Button(
                onClick = {
                    isBusy = true
                    statusText = "Rendering A4 PDF..."
                    scope.launch {
                        val uri = PdfSignRedactEngine.convertTextOrDocxToPdf(context, docTitle, docBody)
                        isBusy = false
                        exportedPdfUri = uri
                        if (uri != null) Toast.makeText(context, "PDF saved to Downloads!", Toast.LENGTH_SHORT).show()
                    }
                },
                enabled = !isBusy && docBody.isNotBlank(),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.PictureAsPdf, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Convert to A4 PDF")
            }
        }

        if (isBusy) {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            Text(statusText, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
        }

        exportedPdfUri?.let { uri ->
            Card(
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.5.dp, Color(0xFF10B981)),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF10B981).copy(alpha = 0.1f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(14.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val i = Intent(Intent.ACTION_VIEW).apply {
                                setDataAndType(uri, "application/pdf")
                                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                            }
                            try { context.startActivity(i) } catch (_: Exception) {}
                        },
                        modifier = Modifier.weight(1f)
                    ) { Text("Open PDF") }

                    OutlinedButton(
                        onClick = {
                            val i = Intent(Intent.ACTION_SEND).apply {
                                type = "application/pdf"
                                putExtra(Intent.EXTRA_STREAM, uri)
                                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                            }
                            context.startActivity(Intent.createChooser(i, "Share PDF"))
                        },
                        modifier = Modifier.weight(1f)
                    ) { Text("Share") }
                }
            }
        }
    }

    if (showSignaturePad) {
        InlineSignatureDrawDialog(
            onDismiss = { showSignaturePad = false },
            onSaveStrokes = { strokes ->
                drawnSignatureStrokes = strokes
                showSignaturePad = false
            }
        )
    }
}

private fun parseComprehensivePdfFileName(context: android.content.Context, uri: Uri): String {
    var name = "Document.docx"
    context.contentResolver.query(uri, null, null, null, null)?.use { c ->
        val idx = c.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
        if (c.moveToFirst() && idx != -1) name = c.getString(idx) ?: name
    }
    return name
}

@Composable
private fun InlineSignatureDrawDialog(
    onDismiss: () -> Unit,
    onSaveStrokes: (List<List<Pair<Float, Float>>>) -> Unit
) {
    var strokes by remember { mutableStateOf<List<List<Pair<Float, Float>>>>(emptyList()) }
    var currentStroke by remember { mutableStateOf<List<Pair<Float, Float>>>(emptyList()) }
    var padSize by remember { mutableStateOf(IntSize(1, 1)) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(shape = RoundedCornerShape(20.dp), color = MaterialTheme.colorScheme.surface) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Draw Handwritten Signature", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(170.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White)
                        .border(1.dp, Color.LightGray, RoundedCornerShape(12.dp))
                        .onSizeChanged { padSize = it }
                        .pointerInput(Unit) {
                            detectDragGestures(
                                onDragStart = { start ->
                                    currentStroke = listOf(
                                        (start.x / padSize.width.coerceAtLeast(1)).coerceIn(0f, 1f) to
                                            (start.y / padSize.height.coerceAtLeast(1)).coerceIn(0f, 1f)
                                    )
                                },
                                onDrag = { change, _ ->
                                    change.consume()
                                    val pt = (change.position.x / padSize.width.coerceAtLeast(1)).coerceIn(0f, 1f) to
                                        (change.position.y / padSize.height.coerceAtLeast(1)).coerceIn(0f, 1f)
                                    currentStroke = currentStroke + pt
                                },
                                onDragEnd = {
                                    if (currentStroke.size >= 2) strokes = strokes + listOf(currentStroke)
                                    currentStroke = emptyList()
                                }
                            )
                        }
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        (strokes + listOf(currentStroke)).forEach { st ->
                            if (st.size >= 2) {
                                val p = Path()
                                p.moveTo(st[0].first * size.width, st[0].second * size.height)
                                for (i in 1 until st.size) p.lineTo(st[i].first * size.width, st[i].second * size.height)
                                drawPath(p, color = Color(0xFF0F172A), style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                            }
                        }
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { strokes = emptyList() }, modifier = Modifier.weight(1f)) { Text("Clear") }
                    Button(
                        onClick = { onSaveStrokes(strokes) },
                        enabled = strokes.isNotEmpty(),
                        modifier = Modifier.weight(1f)
                    ) { Text("Use Signature") }
                }
            }
        }
    }
}
