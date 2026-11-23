package com.drtahir.studentkit.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drtahir.studentkit.data.ClinicalScoresEngine
import com.drtahir.studentkit.viewmodel.StudentKitViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClinicalScoresScreen(viewModel: StudentKitViewModel) {
    var activeModule by remember { mutableIntStateOf(0) } // 0=ABG, 1=GCS, 2=NEWS2/qSOFA, 3=APGAR/Peds

    // ABG inputs
    var phStr by remember { mutableStateOf("7.24") }
    var paco2Str by remember { mutableStateOf("26") }
    var hco3Str by remember { mutableStateOf("11") }
    var naStr by remember { mutableStateOf("140") }
    var clStr by remember { mutableStateOf("102") }
    var albStr by remember { mutableStateOf("4.0") }

    // GCS state
    var gcsEye by remember { mutableIntStateOf(4) }
    var gcsVerbal by remember { mutableIntStateOf(5) }
    var gcsMotor by remember { mutableIntStateOf(6) }

    // NEWS2 & qSOFA state
    var rrStr by remember { mutableStateOf("22") }
    var spo2Str by remember { mutableStateOf("94") }
    var suppO2 by remember { mutableStateOf(false) }
    var sbpStr by remember { mutableStateOf("96") }
    var hrStr by remember { mutableStateOf("114") }
    var tempStr by remember { mutableStateOf("38.4") }
    var isAlert by remember { mutableStateOf(true) }

    // APGAR & Pediatric
    var apgarAppearance by remember { mutableIntStateOf(2) }
    var apgarPulse by remember { mutableIntStateOf(2) }
    var apgarGrimace by remember { mutableIntStateOf(2) }
    var apgarActivity by remember { mutableIntStateOf(2) }
    var apgarResp by remember { mutableIntStateOf(2) }
    var childAgeStr by remember { mutableStateOf("4") }

    val modules = listOf("ABG & Anion Gap", "GCS Scale", "NEWS2 & qSOFA", "APGAR & Peds")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            modules.forEachIndexed { idx, label ->
                FilterChip(
                    selected = activeModule == idx,
                    onClick = { activeModule = idx },
                    label = { Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
            }
        }

        when (activeModule) {
            // ---------------- 0. ABG ACID-BASE & ANION GAP INTERPRETER ----------------
            0 -> {
                Text("Arterial Blood Gas (ABG) & Electrolytes", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = phStr,
                        onValueChange = { phStr = it },
                        label = { Text("pH (7.35-7.45)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = paco2Str,
                        onValueChange = { paco2Str = it },
                        label = { Text("PaCO2 (35-45)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = hco3Str,
                        onValueChange = { hco3Str = it },
                        label = { Text("HCO3- (22-26)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = naStr,
                        onValueChange = { naStr = it },
                        label = { Text("Na+ (mEq/L)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = clStr,
                        onValueChange = { clStr = it },
                        label = { Text("Cl- (mEq/L)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = albStr,
                        onValueChange = { albStr = it },
                        label = { Text("Albumin (g/dL)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                val abgRes = ClinicalScoresEngine.analyzeAbg(
                    ph = phStr.toDoubleOrNull() ?: 7.40,
                    paco2 = paco2Str.toDoubleOrNull() ?: 40.0,
                    hco3 = hco3Str.toDoubleOrNull() ?: 24.0,
                    sodium = naStr.toDoubleOrNull() ?: 140.0,
                    chloride = clStr.toDoubleOrNull() ?: 104.0,
                    albumin = albStr.toDoubleOrNull() ?: 4.0
                )
                val badgeColor = when (abgRes.severity) {
                    ClinicalScoresEngine.SeverityLevel.CRITICAL -> Color(0xFFDC2626)
                    ClinicalScoresEngine.SeverityLevel.HIGH -> Color(0xFFEA580C)
                    ClinicalScoresEngine.SeverityLevel.MODERATE -> Color(0xFFD97706)
                    ClinicalScoresEngine.SeverityLevel.NORMAL -> Color(0xFF059669)
                }

                Card(
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.5.dp, badgeColor),
                    colors = CardDefaults.cardColors(containerColor = badgeColor.copy(alpha = 0.08f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(abgRes.primaryDisorder, fontWeight = FontWeight.ExtraBold, fontSize = 17.sp, color = badgeColor)
                        Text("Compensation: ${abgRes.compensationStatus}", fontSize = 12.sp)
                        HorizontalDivider()
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(
                                String.format(Locale.US, "Raw Anion Gap: %.1f mEq/L", abgRes.anionGap),
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                            Text(
                                String.format(Locale.US, "Albumin-Corrected: %.1f", abgRes.correctedAnionGap),
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = badgeColor
                            )
                        }
                        Text(abgRes.anionGapInterpretation, fontSize = 12.sp)
                        Text(abgRes.deltaRatioNote, fontSize = 11.sp, color = Color.Gray)
                    }
                }
            }

            // ---------------- 1. GLASGOW COMA SCALE ----------------
            1 -> {
                val eyeOptions = listOf(4 to "4 Spontaneous", 3 to "3 To Sound", 2 to "2 To Pressure", 1 to "1 None")
                val verbalOptions = listOf(5 to "5 Oriented", 4 to "4 Confused", 3 to "3 Words", 2 to "2 Sounds", 1 to "1 None")
                val motorOptions = listOf(
                    6 to "6 Obeys Commands", 5 to "5 Localizing", 4 to "4 Normal Flexion",
                    3 to "3 Abnormal Flexion", 2 to "2 Extension", 1 to "1 None"
                )

                Text("Eye Opening (E)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                FlowChipRow(eyeOptions, gcsEye) { gcsEye = it }
                Text("Verbal Response (V)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                FlowChipRow(verbalOptions, gcsVerbal) { gcsVerbal = it }
                Text("Motor Response (M)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                FlowChipRow(motorOptions, gcsMotor) { gcsMotor = it }

                val gcsRes = ClinicalScoresEngine.evaluateGcs(gcsEye, gcsVerbal, gcsMotor)
                val gcsColor = when (gcsRes.severity) {
                    ClinicalScoresEngine.SeverityLevel.CRITICAL -> Color(0xFFDC2626)
                    ClinicalScoresEngine.SeverityLevel.HIGH -> Color(0xFFEA580C)
                    ClinicalScoresEngine.SeverityLevel.MODERATE -> Color(0xFFD97706)
                    ClinicalScoresEngine.SeverityLevel.NORMAL -> Color(0xFF059669)
                }

                Card(
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.5.dp, gcsColor),
                    colors = CardDefaults.cardColors(containerColor = gcsColor.copy(alpha = 0.08f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            "GCS Score: ${gcsRes.totalScore}/15  (E$gcsEye V$gcsVerbal M$gcsMotor)",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = gcsColor
                        )
                        Text(gcsRes.classification, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(gcsRes.clinicalGuidance, fontSize = 12.sp)
                    }
                }
            }

            // ---------------- 2. NEWS2 & qSOFA SEPSIS TRIAGE ----------------
            2 -> {
                Text("Patient Vital Signs (NEWS2 & qSOFA)", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = rrStr, onValueChange = { rrStr = it }, label = { Text("RR /min") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = spo2Str, onValueChange = { spo2Str = it }, label = { Text("SpO2 %") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = sbpStr, onValueChange = { sbpStr = it }, label = { Text("Sys BP") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f), singleLine = true
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = hrStr, onValueChange = { hrStr = it }, label = { Text("Heart Rate") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = tempStr, onValueChange = { tempStr = it }, label = { Text("Temp °C") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f), singleLine = true
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("On Supplemental Oxygen?", fontSize = 13.sp)
                    Switch(checked = suppO2, onCheckedChange = { suppO2 = it })
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Patient Alert (vs Voice/Pain/Unresponsive)?", fontSize = 13.sp)
                    Switch(checked = isAlert, onCheckedChange = { isAlert = it })
                }

                val rr = rrStr.toIntOrNull() ?: 16
                val sbp = sbpStr.toIntOrNull() ?: 120
                val qsofa = (if (rr >= 22) 1 else 0) + (if (sbp <= 100) 1 else 0) + (if (!isAlert) 1 else 0)
                val news2Res = ClinicalScoresEngine.evaluateNews2(
                    respRate = rr,
                    spo2 = spo2Str.toIntOrNull() ?: 98,
                    onSupplementalO2 = suppO2,
                    systolicBp = sbp,
                    heartRate = hrStr.toIntOrNull() ?: 80,
                    tempC = tempStr.toDoubleOrNull() ?: 37.0,
                    isAlert = isAlert
                )
                val riskColor = when (news2Res.severity) {
                    ClinicalScoresEngine.SeverityLevel.CRITICAL -> Color(0xFFDC2626)
                    ClinicalScoresEngine.SeverityLevel.HIGH -> Color(0xFFEA580C)
                    ClinicalScoresEngine.SeverityLevel.MODERATE -> Color(0xFFD97706)
                    ClinicalScoresEngine.SeverityLevel.NORMAL -> Color(0xFF059669)
                }

                Card(
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.5.dp, riskColor),
                    colors = CardDefaults.cardColors(containerColor = riskColor.copy(alpha = 0.08f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("NEWS2 Score: ${news2Res.score}", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = riskColor)
                        Text(news2Res.riskCategory, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text(news2Res.responsePlan, fontSize = 12.sp)
                        HorizontalDivider()
                        Text(
                            text = "qSOFA Sepsis Screen: $qsofa / 3 " +
                                if (qsofa >= 2) "(HIGH RISK OF SEPSIS — Initiate Sepsis 6 Bundle)" else "(Low qSOFA Risk)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = if (qsofa >= 2) Color(0xFFDC2626) else Color(0xFF059669)
                        )
                    }
                }
            }

            // ---------------- 3. APGAR & PEDIATRIC RESUSCITATION ----------------
            3 -> {
                Text("Newborn APGAR Score", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                ApgarRow("Appearance", listOf("0 Blue/Pale", "1 Acrocyanosis", "2 Pink"), apgarAppearance) { apgarAppearance = it }
                ApgarRow("Pulse", listOf("0 Absent", "1 <100 bpm", "2 >=100 bpm"), apgarPulse) { apgarPulse = it }
                ApgarRow("Grimace", listOf("0 None", "1 Grimace", "2 Cry/Pull"), apgarGrimace) { apgarGrimace = it }
                ApgarRow("Activity", listOf("0 Limp", "1 Some Flex", "2 Active"), apgarActivity) { apgarActivity = it }
                ApgarRow("Respiration", listOf("0 Absent", "1 Weak/Slow", "2 Strong Cry"), apgarResp) { apgarResp = it }

                val apgarTotal = apgarAppearance + apgarPulse + apgarGrimace + apgarActivity + apgarResp
                val apgarColor = when {
                    apgarTotal <= 3 -> Color(0xFFDC2626)
                    apgarTotal <= 6 -> Color(0xFFD97706)
                    else -> Color(0xFF059669)
                }
                Card(
                    shape = RoundedCornerShape(14.dp),
                    border = BorderStroke(1.dp, apgarColor),
                    colors = CardDefaults.cardColors(containerColor = apgarColor.copy(alpha = 0.09f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("APGAR Score: $apgarTotal / 10", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = apgarColor)
                        Text(
                            when {
                                apgarTotal >= 7 -> "Reassuring newborn status (Routine care)"
                                apgarTotal >= 4 -> "Moderately depressed (Stimulate, suction, CPAP / Bag-mask as needed)"
                                else -> "Severely depressed — Immediate neonatal resuscitation (NRP)!"
                            },
                            fontSize = 12.sp
                        )
                    }
                }

                HorizontalDivider()
                Text("Pediatric Emergency Estimator (APLS / PALS)", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                OutlinedTextField(
                    value = childAgeStr,
                    onValueChange = { childAgeStr = it },
                    label = { Text("Child Age (Years, e.g. 0.5 for 6 mo, 4)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                val peds = ClinicalScoresEngine.estimatePediatricResuscitation(childAgeStr.toDoubleOrNull() ?: 4.0)
                Card(shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(String.format(Locale.US, "Estimated Weight: %.1f kg", peds.estimatedWeightKg), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(String.format(Locale.US, "Uncuffed ETT: %.1f mm  •  Cuffed ETT: %.1f mm", peds.uncuffedEttMm, peds.cuffedEttMm), fontSize = 12.sp)
                        Text("Isotonic Fluid Bolus (20 mL/kg): ${peds.fluidBolusMl} mL", fontSize = 12.sp)
                        Text(String.format(Locale.US, "Epinephrine IV/IO (0.01 mg/kg): %.2f mg (%.1f mL of 1:10,000)", peds.epiIvDoseMg, peds.epiIvMlOf1In10000), fontSize = 12.sp)
                        Text("Defibrillation (4 J/kg): ${peds.defibFirstJ} Joules", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun FlowChipRow(options: List<Pair<Int, String>>, selectedValue: Int, onSelect: (Int) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        options.forEach { (value, label) ->
            FilterChip(
                selected = selectedValue == value,
                onClick = { onSelect(value) },
                label = { Text(label, fontSize = 11.sp) }
            )
        }
    }
}

@Composable
private fun ApgarRow(title: String, labels: List<String>, selected: Int, onSelect: (Int) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(title, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            labels.forEachIndexed { idx, lbl ->
                FilterChip(
                    selected = selected == idx,
                    onClick = { onSelect(idx) },
                    label = { Text(lbl, fontSize = 11.sp) }
                )
            }
        }
    }
}
