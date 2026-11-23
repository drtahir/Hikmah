package com.drtahir.studentkit.data

import java.util.Locale
import kotlin.math.abs

/**
 * Bedside Clinical Scoring & Critical Care Diagnostic Engine
 * Includes ABG Acid-Base + Anion Gap Solver, Glasgow Coma Scale (GCS), NEWS2, qSOFA, APGAR & Pediatric Emergency Calculator.
 */
object ClinicalScoresEngine {

    enum class SeverityLevel(val label: String) {
        NORMAL("Normal / Low Risk"),
        MODERATE("Moderate / Monitor Closely"),
        HIGH("High Risk / Urgent Review"),
        CRITICAL("Critical / Emergency Action")
    }

    data class AbgAnalysisResult(
        val primaryDisorder: String,
        val compensationStatus: String,
        val anionGap: Double,
        val correctedAnionGap: Double,
        val anionGapInterpretation: String,
        val deltaRatioNote: String,
        val severity: SeverityLevel
    )

    fun analyzeAbg(
        ph: Double,
        paco2: Double,
        hco3: Double,
        sodium: Double = 140.0,
        chloride: Double = 104.0,
        albumin: Double = 4.0
    ): AbgAnalysisResult {
        val rawAg = sodium - (chloride + hco3)
        // Figge formula: Corrected AG = AG + 2.5 * (4.0 - albumin)
        val correctedAg = rawAg + 2.5 * (4.0 - albumin)

        val isAcidemia = ph < 7.35
        val isAlkalemia = ph > 7.45

        val primary: String
        var compensation = "Within normal reference limits."
        var severity = SeverityLevel.NORMAL

        if (ph in 7.35..7.45 && paco2 in 35.0..45.0 && hco3 in 22.0..26.0) {
            primary = "Normal Acid-Base Balance"
        } else if (isAcidemia || (ph <= 7.40 && (paco2 > 45.0 || hco3 < 22.0))) {
            if (paco2 > 45.0 && hco3 < 22.0) {
                primary = "Mixed Respiratory & Metabolic Acidosis"
                compensation = "Both PaCO2 elevation and low HCO3- drive acidemia."
                severity = SeverityLevel.CRITICAL
            } else if (paco2 > 45.0) {
                primary = "Primary Respiratory Acidosis"
                val acuteHco3 = 24.0 + ((paco2 - 40.0) / 10.0) * 1.0
                val chronicHco3 = 24.0 + ((paco2 - 40.0) / 10.0) * 3.5
                compensation = String.format(
                    Locale.US,
                    "Expected HCO3-: Acute ~%.1f mEq/L, Chronic ~%.1f mEq/L (Actual %.1f)",
                    acuteHco3, chronicHco3, hco3
                )
                severity = if (ph < 7.20) SeverityLevel.CRITICAL else SeverityLevel.HIGH
            } else {
                primary = "Primary Metabolic Acidosis"
                // Winter's Formula: Expected PaCO2 = (1.5 * HCO3-) + 8 +/- 2
                val winterLow = (1.5 * hco3) + 6.0
                val winterHigh = (1.5 * hco3) + 10.0
                compensation = when {
                    paco2 < winterLow -> String.format(
                        Locale.US,
                        "Winter's Expected PaCO2: %.1f–%.1f mmHg. Actual PaCO2 lower -> concomitant Respiratory Alkalosis.",
                        winterLow, winterHigh
                    )
                    paco2 > winterHigh -> String.format(
                        Locale.US,
                        "Winter's Expected PaCO2: %.1f–%.1f mmHg. Actual PaCO2 higher -> concomitant Respiratory Acidosis.",
                        winterLow, winterHigh
                    )
                    else -> String.format(
                        Locale.US,
                        "Appropriate respiratory compensation (Winter's range %.1f–%.1f mmHg).",
                        winterLow, winterHigh
                    )
                }
                severity = if (ph < 7.20 || hco3 < 12.0) SeverityLevel.CRITICAL else SeverityLevel.HIGH
            }
        } else {
            if (paco2 < 35.0 && hco3 > 26.0) {
                primary = "Mixed Respiratory & Metabolic Alkalosis"
                compensation = "Both low PaCO2 and high HCO3- elevate pH."
                severity = SeverityLevel.HIGH
            } else if (paco2 < 35.0) {
                primary = "Primary Respiratory Alkalosis"
                val acuteHco3 = 24.0 - ((40.0 - paco2) / 10.0) * 2.0
                val chronicHco3 = 24.0 - ((40.0 - paco2) / 10.0) * 5.0
                compensation = String.format(
                    Locale.US,
                    "Expected HCO3-: Acute ~%.1f mEq/L, Chronic ~%.1f mEq/L (Actual %.1f)",
                    acuteHco3, chronicHco3, hco3
                )
                severity = if (isAlkalemia && ph > 7.55) SeverityLevel.HIGH else SeverityLevel.MODERATE
            } else {
                primary = "Primary Metabolic Alkalosis"
                val expectedPaco2 = (0.7 * (hco3 - 24.0)) + 40.0
                compensation = String.format(
                    Locale.US,
                    "Expected compensatory PaCO2 ~%.1f mmHg (Actual %.1f mmHg)",
                    expectedPaco2, paco2
                )
                severity = if (ph > 7.55) SeverityLevel.HIGH else SeverityLevel.MODERATE
            }
        }

        val agNote = when {
            correctedAg > 16.0 -> "High Anion Gap Metabolic Acidosis (HAGMA — check MUDPILES: Methanol, Uremia, DKA, Propylene glycol, INH/Iron, Lactic acidosis, Ethylene glycol, Salicylates)."
            correctedAg in 12.1..16.0 -> "Borderline / Mildly Elevated Anion Gap."
            else -> "Normal Anion Gap (8–12 mEq/L). If acidotic, consider Hyperchloremic / NAGMA (GI loss or RTA)."
        }

        val excessAg = correctedAg - 12.0
        val hco3Drop = 24.0 - hco3
        val deltaNote = if (correctedAg > 14.0 && abs(hco3Drop) > 0.5) {
            val ratio = excessAg / hco3Drop
            when {
                ratio < 0.8 -> String.format(Locale.US, "Delta Ratio %.2f (<0.8): Combined High-AG + Normal-AG Metabolic Acidosis", ratio)
                ratio > 2.0 -> String.format(Locale.US, "Delta Ratio %.2f (>2.0): Concurrent Metabolic Alkalosis or pre-existing elevated HCO3-", ratio)
                else -> String.format(Locale.US, "Delta Ratio %.2f (0.8–2.0): Pure High-Anion Gap Metabolic Acidosis", ratio)
            }
        } else {
            "Delta ratio applies primarily when Anion Gap > 14 mEq/L."
        }

        return AbgAnalysisResult(
            primaryDisorder = primary,
            compensationStatus = compensation,
            anionGap = rawAg,
            correctedAnionGap = correctedAg,
            anionGapInterpretation = agNote,
            deltaRatioNote = deltaNote,
            severity = severity
        )
    }

    data class GcsResult(
        val totalScore: Int,
        val classification: String,
        val clinicalGuidance: String,
        val severity: SeverityLevel
    )

    fun evaluateGcs(eye: Int, verbal: Int, motor: Int): GcsResult {
        val total = (eye + verbal + motor).coerceIn(3, 15)
        return when {
            total <= 8 -> GcsResult(
                totalScore = total,
                classification = "Severe Brain Injury / Coma (GCS <= 8)",
                clinicalGuidance = "Protect airway (consider endotracheal intubation), CT Brain STAT, neurosurgical consult.",
                severity = SeverityLevel.CRITICAL
            )
            total <= 12 -> GcsResult(
                totalScore = total,
                classification = "Moderate Neurological Impairment (GCS 9–12)",
                clinicalGuidance = "Close neuro-obs q15–30min, urgent CT head, monitor pupillary reactivity & vitals.",
                severity = SeverityLevel.HIGH
            )
            total <= 14 -> GcsResult(
                totalScore = total,
                classification = "Mild Impairment / Confusion (GCS 13–14)",
                clinicalGuidance = "Rule out hypoglycemia, hypoxia, sepsis, or concussion; serial GCS monitoring.",
                severity = SeverityLevel.MODERATE
            )
            else -> GcsResult(
                totalScore = total,
                classification = "Fully Alert & Oriented (GCS 15/15)",
                clinicalGuidance = "Normal baseline Glasgow Coma score.",
                severity = SeverityLevel.NORMAL
            )
        }
    }

    data class News2Result(
        val score: Int,
        val riskCategory: String,
        val responsePlan: String,
        val severity: SeverityLevel
    )

    fun evaluateNews2(
        respRate: Int,
        spo2: Int,
        onSupplementalO2: Boolean,
        systolicBp: Int,
        heartRate: Int,
        tempC: Double,
        isAlert: Boolean
    ): News2Result {
        var score = 0
        var hasExtremeSingleParam = false

        val rrPts = when {
            respRate <= 8 || respRate >= 25 -> 3
            respRate in 21..24 -> 2
            respRate in 9..11 -> 1
            else -> 0
        }
        val spo2Pts = when {
            spo2 <= 91 -> 3
            spo2 in 92..93 -> 2
            spo2 in 94..95 -> 1
            else -> 0
        }
        val o2Pts = if (onSupplementalO2) 2 else 0
        val bpPts = when {
            systolicBp <= 90 || systolicBp >= 220 -> 3
            systolicBp in 91..100 -> 2
            systolicBp in 101..110 -> 1
            else -> 0
        }
        val hrPts = when {
            heartRate <= 40 || heartRate >= 131 -> 3
            heartRate in 111..130 -> 2
            heartRate in 41..50 || heartRate in 91..110 -> 1
            else -> 0
        }
        val tempPts = when {
            tempC <= 35.0 -> 3
            tempC >= 39.1 -> 2
            tempC in 35.1..36.0 || tempC in 38.1..39.0 -> 1
            else -> 0
        }
        val avpuPts = if (isAlert) 0 else 3

        listOf(rrPts, spo2Pts, bpPts, hrPts, tempPts, avpuPts).forEach {
            if (it == 3) hasExtremeSingleParam = true
            score += it
        }
        score += o2Pts

        return when {
            score >= 7 -> News2Result(
                score = score,
                riskCategory = "HIGH CLINICAL RISK (NEWS2 >= 7)",
                responsePlan = "Emergency assessment by critical care / registrar immediately; continuous monitoring.",
                severity = SeverityLevel.CRITICAL
            )
            score in 5..6 -> News2Result(
                score = score,
                riskCategory = "MEDIUM CLINICAL RISK (NEWS2 5–6)",
                responsePlan = "Urgent medical review within 30 minutes; check sepsis bundle (qSOFA / Lactate) & escalate obs.",
                severity = SeverityLevel.HIGH
            )
            hasExtremeSingleParam -> News2Result(
                score = score,
                riskCategory = "LOW-MEDIUM (Red Single Score = 3)",
                responsePlan = "Urgent ward-based doctor review for isolated extreme physiological parameter.",
                severity = SeverityLevel.MODERATE
            )
            score in 1..4 -> News2Result(
                score = score,
                riskCategory = "LOW CLINICAL RISK (NEWS2 1–4)",
                responsePlan = "Registered nurse review; minimum 4–6 hourly observations.",
                severity = SeverityLevel.NORMAL
            )
            else -> News2Result(
                score = 0,
                riskCategory = "BASELINE STABLE (NEWS2 0)",
                responsePlan = "Routine ward monitoring per protocol.",
                severity = SeverityLevel.NORMAL
            )
        }
    }

    data class PediatricEmergencyEstimate(
        val estimatedWeightKg: Double,
        val uncuffedEttMm: Double,
        val cuffedEttMm: Double,
        val fluidBolusMl: Int,
        val epiIvDoseMg: Double,
        val epiIvMlOf1In10000: Double,
        val defibFirstJ: Int
    )

    fun estimatePediatricResuscitation(ageYears: Double): PediatricEmergencyEstimate {
        // APLS Weight formula: <1yr ~ (age*12 * 0.5)+4 ; 1-5yr ~ 2*(age+4) ; 6-12yr ~ 3*age+7
        val wt = when {
            ageYears < 1.0 -> (ageYears * 12.0 * 0.5 + 4.0).coerceAtLeast(3.5)
            ageYears <= 5.0 -> 2.0 * (ageYears + 4.0)
            else -> 3.0 * ageYears + 7.0
        }
        val uncuffed = (ageYears / 4.0) + 4.0
        val cuffed = (ageYears / 4.0) + 3.5
        val bolus = (wt * 20.0).toInt()
        val epiMg = wt * 0.01 // 0.01 mg/kg IV/IO
        val epiMl = epiMg * 10.0 // 1:10,000 = 0.1 mg/mL
        val joules = (wt * 4.0).toInt().coerceAtLeast(10) // 4 J/kg standard AHA PALS

        return PediatricEmergencyEstimate(
            estimatedWeightKg = wt,
            uncuffedEttMm = uncuffed,
            cuffedEttMm = cuffed,
            fluidBolusMl = bolus,
            epiIvDoseMg = epiMg,
            epiIvMlOf1In10000 = epiMl,
            defibFirstJ = joules
        )
    }
}
