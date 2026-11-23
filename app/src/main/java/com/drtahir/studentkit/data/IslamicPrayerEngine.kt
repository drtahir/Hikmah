package com.drtahir.studentkit.data

import java.util.Calendar
import java.util.Locale
import java.util.TimeZone
import kotlin.math.*

/**
 * Pure Offline Astronomical Prayer Times & Great-Circle Qibla Bearing Engine.
 * Supports University of Islamic Sciences Karachi, Muslim World League, ISNA & Umm al-Qura.
 */
object IslamicPrayerEngine {

    const val KAABA_LAT = 21.4225
    const val KAABA_LNG = 39.8262

    enum class CalculationMethod(
        val displayName: String,
        val fajrAngle: Double,
        val ishaAngle: Double,
        val ishaMinutesAfterMaghrib: Double? = null
    ) {
        KARACHI("Karachi (Hanafi / Pakistan)", 18.0, 18.0),
        MWL("Muslim World League", 18.0, 17.0),
        ISNA("ISNA (North America)", 15.0, 15.0),
        UMM_AL_QURA("Umm al-Qura (Makkah)", 18.5, 0.0, 90.0),
        EGYPT("Egyptian General Authority", 19.5, 17.5)
    }

    enum class AsrJuristic(val label: String, val shadowFactor: Int) {
        HANAFI("Hanafi (2x Shadow)", 2),
        SHAFI("Standard / Shafi'i (1x Shadow)", 1)
    }

    data class CityPreset(
        val name: String,
        val latitude: Double,
        val longitude: Double,
        val timeZoneHours: Double
    )

    val presetCities = listOf(
        CityPreset("Buner (Pacha Kalay), PK", 34.4922, 72.4789, 5.0),
        CityPreset("Peshawar, PK", 34.0151, 71.5249, 5.0),
        CityPreset("Swat (Mingora), PK", 34.7717, 72.3602, 5.0),
        CityPreset("Mardan, PK", 34.1986, 72.0404, 5.0),
        CityPreset("Islamabad / Rawalpindi, PK", 33.6844, 73.0479, 5.0),
        CityPreset("Lahore, PK", 31.5204, 74.3587, 5.0),
        CityPreset("Karachi, PK", 24.8607, 67.0011, 5.0),
        CityPreset("Quetta, PK", 30.1798, 66.9750, 5.0),
        CityPreset("Makkah, SA", 21.4225, 39.8262, 3.0),
        CityPreset("Madinah, SA", 24.4672, 39.6112, 3.0),
        CityPreset("London, UK", 51.5072, -0.1276, 0.0)
    )

    data class DailyPrayerSchedule(
        val fajr: Double,
        val sunrise: Double,
        val dhuhr: Double,
        val asr: Double,
        val maghrib: Double,
        val isha: Double,
        val sehriEnds: Double,
        val tahajjudLastThird: Double
    )

    /**
     * Great-Circle initial forward azimuth bearing (degrees clockwise from True North 0..360)
     * from user coordinates to the Holy Kaaba in Makkah.
     */
    fun calculateQiblaBearing(latitude: Double, longitude: Double): Double {
        val phi1 = Math.toRadians(latitude)
        val phi2 = Math.toRadians(KAABA_LAT)
        val dLambda = Math.toRadians(KAABA_LNG - longitude)

        val y = sin(dLambda) * cos(phi2)
        val x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(dLambda)
        val bearing = Math.toDegrees(atan2(y, x))
        return (bearing + 360.0) % 360.0
    }

    /**
     * Distance to the Holy Kaaba in kilometers via Haversine formula.
     */
    fun calculateDistanceToKaabaKm(latitude: Double, longitude: Double): Double {
        val r = 6371.0
        val dLat = Math.toRadians(KAABA_LAT - latitude)
        val dLng = Math.toRadians(KAABA_LNG - longitude)
        val a = sin(dLat / 2).pow(2) +
            cos(Math.toRadians(latitude)) * cos(Math.toRadians(KAABA_LAT)) * sin(dLng / 2).pow(2)
        return 2 * r * atan2(sqrt(a), sqrt(1 - a))
    }

    /**
     * Computes daily prayer times in decimal hours (local clock time).
     */
    fun computePrayerTimes(
        year: Int,
        month: Int, // 1..12
        day: Int,
        latitude: Double,
        longitude: Double,
        timeZoneHours: Double,
        method: CalculationMethod = CalculationMethod.KARACHI,
        juristic: AsrJuristic = AsrJuristic.HANAFI
    ): DailyPrayerSchedule {
        val jd = julianDate(year, month, day) - longitude / (15.0 * 24.0)

        val (decl, eqTime) = sunPosition(jd)
        val dhuhrNoon = fixHour(12.0 + timeZoneHours - longitude / 15.0 - eqTime)

        val sunRiseOffset = hourAngleOffset(latitude, decl, 0.833)
        val sunrise = dhuhrNoon - sunRiseOffset
        val maghrib = dhuhrNoon + sunRiseOffset

        val fajrOffset = hourAngleOffset(latitude, decl, method.fajrAngle)
        val fajr = dhuhrNoon - fajrOffset

        val asrAlt = Math.toDegrees(
            atan(1.0 / (juristic.shadowFactor + tan(Math.toRadians(abs(latitude - decl)))))
        )
        val asrOffset = sunAltitudeHourOffset(latitude, decl, asrAlt)
        val asr = dhuhrNoon + asrOffset

        val isha = if (method.ishaMinutesAfterMaghrib != null) {
            maghrib + (method.ishaMinutesAfterMaghrib / 60.0)
        } else {
            val ishaOffset = hourAngleOffset(latitude, decl, method.ishaAngle)
            dhuhrNoon + ishaOffset
        }

        val dhuhr = dhuhrNoon + (2.0 / 60.0) // standard 2-minute precautionary zawal margin
        val sehriEnds = fajr - (5.0 / 60.0)
        val nightDuration = ((fajr + 24.0) - maghrib)
        val tahajjudLastThird = fixHour(maghrib + nightDuration * (2.0 / 3.0))

        return DailyPrayerSchedule(
            fajr = fixHour(fajr),
            sunrise = fixHour(sunrise),
            dhuhr = fixHour(dhuhr),
            asr = fixHour(asr),
            maghrib = fixHour(maghrib),
            isha = fixHour(isha),
            sehriEnds = fixHour(sehriEnds),
            tahajjudLastThird = tahajjudLastThird
        )
    }

    fun formatDecimalHour(decimalHour: Double): String {
        val totalMinutes = (fixHour(decimalHour) * 60.0).roundToInt() % (24 * 60)
        val h24 = (totalMinutes / 60) % 24
        val m = totalMinutes % 60
        val amPm = if (h24 >= 12) "PM" else "AM"
        val h12 = when {
            h24 == 0 -> 12
            h24 > 12 -> h24 - 12
            else -> h24
        }
        return String.format(Locale.US, "%02d:%02d %s", h12, m, amPm)
    }

    fun getDeviceTimeZoneOffsetHours(): Double {
        return TimeZone.getDefault().getOffset(System.currentTimeMillis()) / 3_600_000.0
    }

    fun findNextPrayer(schedule: DailyPrayerSchedule, now: Calendar = Calendar.getInstance()): Pair<String, String> {
        val currentDec = now.get(Calendar.HOUR_OF_DAY) + now.get(Calendar.MINUTE) / 60.0 + now.get(Calendar.SECOND) / 3600.0
        val slots = listOf(
            "Fajr" to schedule.fajr,
            "Sunrise" to schedule.sunrise,
            "Dhuhr" to schedule.dhuhr,
            "Asr" to schedule.asr,
            "Maghrib" to schedule.maghrib,
            "Isha" to schedule.isha
        )
        val next = slots.firstOrNull { it.second > currentDec }
        val (name, diffHours) = if (next != null) {
            next.first to (next.second - currentDec)
        } else {
            "Fajr (Tomorrow)" to ((schedule.fajr + 24.0) - currentDec)
        }
        val totalMins = (diffHours * 60).roundToInt().coerceAtLeast(0)
        val hrs = totalMins / 60
        val mins = totalMins % 60
        val rem = if (hrs > 0) "${hrs}h ${mins}m remaining" else "${mins}m remaining"
        return name to rem
    }

    private fun julianDate(year: Int, month: Int, day: Int): Double {
        var y = year
        var m = month
        if (m <= 2) {
            y -= 1
            m += 12
        }
        val a = floor(y / 100.0)
        val b = 2 - a + floor(a / 4.0)
        return floor(365.25 * (y + 4716)) + floor(30.6001 * (m + 1)) + day + b - 1524.5
    }

    private fun sunPosition(jd: Double): Pair<Double, Double> {
        val d = jd - 2451545.0
        val g = fixAngle(357.529 + 0.98560028 * d)
        val q = fixAngle(280.459 + 0.98564736 * d)
        val l = fixAngle(q + 1.915 * sin(Math.toRadians(g)) + 0.020 * sin(Math.toRadians(2 * g)))

        val e = 23.439 - 0.00000036 * d
        val ra = Math.toDegrees(
            atan2(cos(Math.toRadians(e)) * sin(Math.toRadians(l)), cos(Math.toRadians(l)))
        ) / 15.0
        val decl = Math.toDegrees(asin(sin(Math.toRadians(e)) * sin(Math.toRadians(l))))
        val eqTime = q / 15.0 - fixHour(ra)
        return decl to eqTime
    }

    private fun hourAngleOffset(latitude: Double, decl: Double, depressionAngle: Double): Double {
        return sunAltitudeHourOffset(latitude, decl, -depressionAngle)
    }

    private fun sunAltitudeHourOffset(latitude: Double, decl: Double, altitudeDeg: Double): Double {
        val numerator = sin(Math.toRadians(altitudeDeg)) -
            sin(Math.toRadians(latitude)) * sin(Math.toRadians(decl))
        val denominator = cos(Math.toRadians(latitude)) * cos(Math.toRadians(decl))
        val cosH = (numerator / denominator).coerceIn(-1.0, 1.0)
        return Math.toDegrees(acos(cosH)) / 15.0
    }

    private fun fixAngle(a: Double): Double {
        var res = a - 360.0 * floor(a / 360.0)
        if (res < 0) res += 360.0
        return res
    }

    private fun fixHour(h: Double): Double {
        var res = h - 24.0 * floor(h / 24.0)
        if (res < 0) res += 24.0
        return res
    }
}
