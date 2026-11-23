package com.drtahir.studentkit.ui.screens

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.LocationManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.drtahir.studentkit.data.IslamicPrayerEngine
import com.drtahir.studentkit.viewmodel.Screen
import com.drtahir.studentkit.viewmodel.StudentKitViewModel
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.abs

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IslamicDailyScreen(viewModel: StudentKitViewModel) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val prefs = remember { context.getSharedPreferences("islamic_daily_prefs", Context.MODE_PRIVATE) }

    var selectedTab by remember { mutableIntStateOf(0) } // 0 = Qibla, 1 = Salah Times, 2 = Tasbih

    // Location & City state
    var selectedCityIndex by remember {
        mutableIntStateOf(prefs.getInt("city_idx", 0).coerceIn(0, IslamicPrayerEngine.presetCities.lastIndex))
    }
    var customLat by remember { mutableStateOf<Double?>(null) }
    var customLng by remember { mutableStateOf<Double?>(null) }
    var locationLabel by remember { mutableStateOf(IslamicPrayerEngine.presetCities[selectedCityIndex].name) }

    val activeLat = customLat ?: IslamicPrayerEngine.presetCities[selectedCityIndex].latitude
    val activeLng = customLng ?: IslamicPrayerEngine.presetCities[selectedCityIndex].longitude
    val activeTz = if (customLat != null) {
        IslamicPrayerEngine.getDeviceTimeZoneOffsetHours()
    } else {
        IslamicPrayerEngine.presetCities[selectedCityIndex].timeZoneHours
    }

    var calcMethod by remember { mutableStateOf(IslamicPrayerEngine.CalculationMethod.KARACHI) }
    var asrJuristic by remember { mutableStateOf(IslamicPrayerEngine.AsrJuristic.HANAFI) }

    // Tasbih persistent state
    var tasbihCount by remember { mutableIntStateOf(prefs.getInt("tasbih_count", 0)) }
    var tasbihTarget by remember { mutableIntStateOf(prefs.getInt("tasbih_target", 33)) }
    var tasbihRounds by remember { mutableIntStateOf(prefs.getInt("tasbih_rounds", 0)) }
    val zikrPresets = listOf(
        "سُبْحَانَ اللّٰهِ" to "SubhanAllah (Glory be to Allah)",
        "اَلْحَمْدُ لِلّٰهِ" to "Alhamdulillah (Praise be to Allah)",
        "اَللّٰهُ أَكْبَرُ" to "Allahu Akbar (Allah is the Greatest)",
        "أَسْتَغْفِرُ اللّٰهَ" to "Astaghfirullah (I seek forgiveness)",
        "لَا إِلٰهَ إِلَّا اللّٰهُ" to "La ilaha illAllah",
        "اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ" to "Durood Shareef"
    )
    var selectedZikrIdx by remember { mutableIntStateOf(prefs.getInt("zikr_idx", 0).coerceIn(0, zikrPresets.lastIndex)) }

    // Hardware Compass Sensor state
    var azimuthDegrees by remember { mutableFloatStateOf(0f) }
    var hasCompassSensor by remember { mutableStateOf(true) }

    DisposableEffect(context) {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val rotSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        val accelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val magSensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

        val gravity = FloatArray(3)
        val geomagnetic = FloatArray(3)
        val rotationMatrix = FloatArray(9)
        val orientation = FloatArray(3)
        var hasG = false
        var hasM = false

        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                when (event.sensor.type) {
                    Sensor.TYPE_ROTATION_VECTOR -> {
                        SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                        SensorManager.getOrientation(rotationMatrix, orientation)
                        val deg = ((Math.toDegrees(orientation[0].toDouble()) + 360.0) % 360.0).toFloat()
                        azimuthDegrees = azimuthDegrees + 0.25f * (((deg - azimuthDegrees + 540f) % 360f) - 180f)
                    }
                    Sensor.TYPE_ACCELEROMETER -> {
                        System.arraycopy(event.values, 0, gravity, 0, 3)
                        hasG = true
                    }
                    Sensor.TYPE_MAGNETIC_FIELD -> {
                        System.arraycopy(event.values, 0, geomagnetic, 0, 3)
                        hasM = true
                    }
                }
                if (rotSensor == null && hasG && hasM) {
                    if (SensorManager.getRotationMatrix(rotationMatrix, null, gravity, geomagnetic)) {
                        SensorManager.getOrientation(rotationMatrix, orientation)
                        val deg = ((Math.toDegrees(orientation[0].toDouble()) + 360.0) % 360.0).toFloat()
                        azimuthDegrees = azimuthDegrees + 0.25f * (((deg - azimuthDegrees + 540f) % 360f) - 180f)
                    }
                }
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }

        if (rotSensor != null) {
            sensorManager.registerListener(listener, rotSensor, SensorManager.SENSOR_DELAY_UI)
        } else if (accelSensor != null && magSensor != null) {
            sensorManager.registerListener(listener, accelSensor, SensorManager.SENSOR_DELAY_UI)
            sensorManager.registerListener(listener, magSensor, SensorManager.SENSOR_DELAY_UI)
        } else {
            hasCompassSensor = false
        }

        onDispose {
            sensorManager.unregisterListener(listener)
        }
    }

    val gpsPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        val granted = grants[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            grants[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            try {
                val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
                val loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                    ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                if (loc != null) {
                    customLat = loc.latitude
                    customLng = loc.longitude
                    locationLabel = String.format(Locale.US, "GPS (%.3f°, %.3f°)", loc.latitude, loc.longitude)
                }
            } catch (_: SecurityException) {}
        }
    }

    fun requestGpsCoordinates() {
        val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (fine || coarse) {
            try {
                val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
                val loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                    ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                if (loc != null) {
                    customLat = loc.latitude
                    customLng = loc.longitude
                    locationLabel = String.format(Locale.US, "GPS (%.3f°, %.3f°)", loc.latitude, loc.longitude)
                }
            } catch (_: SecurityException) {}
        } else {
            gpsPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        }
    }

    val qiblaBearing = remember(activeLat, activeLng) {
        IslamicPrayerEngine.calculateQiblaBearing(activeLat, activeLng)
    }
    val distanceKm = remember(activeLat, activeLng) {
        IslamicPrayerEngine.calculateDistanceToKaabaKm(activeLat, activeLng)
    }

    val nowCal = remember { Calendar.getInstance() }
    val schedule = remember(activeLat, activeLng, activeTz, calcMethod, asrJuristic) {
        IslamicPrayerEngine.computePrayerTimes(
            year = nowCal.get(Calendar.YEAR),
            month = nowCal.get(Calendar.MONTH) + 1,
            day = nowCal.get(Calendar.DAY_OF_MONTH),
            latitude = activeLat,
            longitude = activeLng,
            timeZoneHours = activeTz,
            method = calcMethod,
            juristic = asrJuristic
        )
    }
    val nextPrayer = remember(schedule) { IslamicPrayerEngine.findNextPrayer(schedule) }

    Scaffold(
        contentWindowInsets = WindowInsets(0.dp),
        topBar = {
            TopAppBar(
                windowInsets = WindowInsets(0.dp),
                title = {
                    Column {
                        Text(
                            text = "Islamic Daily Companion",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldDark
                        )
                        Text(
                            text = "Qibla Compass • Prayer Times • Digital Tasbih",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { viewModel.navigateBack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = EmeraldDark)
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.navigateTo(Screen.Dashboard) }) {
                        Icon(Icons.Default.Home, contentDescription = "Home", tint = EmeraldDark)
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(windowInsets = WindowInsets(0.dp), tonalElevation = 4.dp) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Explore, contentDescription = "Qibla") },
                    label = { Text("Qibla", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.AccessTime, contentDescription = "Prayer Times") },
                    label = { Text("Salah", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.TouchApp, contentDescription = "Tasbih") },
                    label = { Text("Tasbih", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { viewModel.navigateTo(Screen.IslamicHub) },
                    icon = { Icon(Icons.Default.MenuBook, contentDescription = "Library") },
                    label = { Text("Library", fontSize = 10.sp) }
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // City / GPS Location Picker Banner
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = EmeraldDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("ACTIVE LOCATION", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = IslamicGold, letterSpacing = 1.sp)
                            Text(locationLabel, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                        FilledTonalButton(
                            onClick = { requestGpsCoordinates() },
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Use GPS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        IslamicPrayerEngine.presetCities.forEachIndexed { idx, city ->
                            val isSelected = customLat == null && selectedCityIndex == idx
                            FilterChip(
                                selected = isSelected,
                                onClick = {
                                    customLat = null
                                    customLng = null
                                    selectedCityIndex = idx
                                    locationLabel = city.name
                                    prefs.edit().putInt("city_idx", idx).apply()
                                },
                                label = { Text(city.name.substringBefore(","), fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = IslamicGold,
                                    selectedLabelColor = EmeraldDark,
                                    labelColor = Color.White.copy(alpha = 0.85f)
                                )
                            )
                        }
                    }
                }
            }

            when (selectedTab) {
                // ---------------- TAB 0: QIBLA COMPASS ----------------
                0 -> {
                    val needleRelativeAngle = ((qiblaBearing.toFloat() - azimuthDegrees) + 360f) % 360f
                    val animatedNorthRotation by animateFloatAsState(
                        targetValue = -azimuthDegrees,
                        animationSpec = tween(durationMillis = 120),
                        label = "north"
                    )
                    val animatedQiblaRotation by animateFloatAsState(
                        targetValue = needleRelativeAngle,
                        animationSpec = tween(durationMillis = 120),
                        label = "qibla"
                    )
                    val deltaFromQibla = minOf(needleRelativeAngle, 360f - needleRelativeAngle)
                    val isFacingQibla = deltaFromQibla <= 6f

                    LaunchedEffect(isFacingQibla) {
                        if (isFacingQibla && hasCompassSensor) {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        }
                    }

                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.5.dp, if (isFacingQibla) Color(0xFF10B981) else IslamicGold.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (isFacingQibla) Color(0xFF10B981).copy(alpha = 0.15f) else EmeraldLight.copy(alpha = 0.1f)
                            ) {
                                Text(
                                    text = if (!hasCompassSensor) "Compass sensor unavailable — Bearing ${qiblaBearing.toInt()}° from True North"
                                    else if (isFacingQibla) "FACING QIBLA ALIGNED"
                                    else "Rotate Phone Toward Kaaba Marker",
                                    color = if (isFacingQibla) Color(0xFF059669) else EmeraldDark,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                                )
                            }

                            Box(
                                modifier = Modifier.size(250.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Canvas(modifier = Modifier.fillMaxSize()) {
                                    val radius = size.minDimension / 2f
                                    val center = Offset(size.width / 2f, size.height / 2f)

                                    // Outer compass ring
                                    drawCircle(
                                        brush = Brush.radialGradient(
                                            colors = listOf(Color(0xFF0F5132).copy(alpha = 0.08f), Color(0xFF0F5132).copy(alpha = 0.22f))
                                        ),
                                        radius = radius
                                    )
                                    drawCircle(
                                        color = if (isFacingQibla) Color(0xFF10B981) else IslamicGold,
                                        radius = radius - 6.dp.toPx(),
                                        style = Stroke(width = 3.dp.toPx())
                                    )

                                    // Dial tick marks rotating with device North
                                    rotate(animatedNorthRotation, pivot = center) {
                                        for (deg in 0 until 360 step 15) {
                                            val isCardinal = deg % 90 == 0
                                            val lineLen = if (isCardinal) 14.dp.toPx() else 7.dp.toPx()
                                            val strokeW = if (isCardinal) 3.dp.toPx() else 1.5.dp.toPx()
                                            rotate(deg.toFloat(), pivot = center) {
                                                drawLine(
                                                    color = if (deg == 0) Color(0xFFDC2626) else Color(0xFF64748B),
                                                    start = Offset(center.x, center.y - radius + 10.dp.toPx()),
                                                    end = Offset(center.x, center.y - radius + 10.dp.toPx() + lineLen),
                                                    strokeWidth = strokeW,
                                                    cap = StrokeCap.Round
                                                )
                                            }
                                        }
                                    }

                                    // Qibla Kaaba pointer needle
                                    rotate(animatedQiblaRotation, pivot = center) {
                                        drawLine(
                                            color = if (isFacingQibla) Color(0xFF10B981) else EmeraldDark,
                                            start = center,
                                            end = Offset(center.x, center.y - radius + 34.dp.toPx()),
                                            strokeWidth = 6.dp.toPx(),
                                            cap = StrokeCap.Round
                                        )
                                        // Gold Kaaba diamond tip
                                        drawCircle(
                                            color = IslamicGold,
                                            radius = 12.dp.toPx(),
                                            center = Offset(center.x, center.y - radius + 34.dp.toPx())
                                        )
                                    }

                                    // Center pivot
                                    drawCircle(color = EmeraldDark, radius = 9.dp.toPx(), center = center)
                                    drawCircle(color = IslamicGold, radius = 4.dp.toPx(), center = center)
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceEvenly
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Qibla Angle", fontSize = 11.sp, color = Color.Gray)
                                    Text(
                                        String.format(Locale.US, "%.1f°", qiblaBearing),
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 18.sp,
                                        color = EmeraldDark
                                    )
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Distance to Kaaba", fontSize = 11.sp, color = Color.Gray)
                                    Text(
                                        "${distanceKm.toInt()} km",
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 18.sp,
                                        color = EmeraldDark
                                    )
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Heading", fontSize = 11.sp, color = Color.Gray)
                                    Text(
                                        "${azimuthDegrees.toInt()}°",
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 18.sp,
                                        color = EmeraldDark
                                    )
                                }
                            }

                            Text(
                                text = "Keep phone flat away from magnetic cases or figure-8 calibrate if needle drifts.",
                                fontSize = 11.sp,
                                color = Color.Gray,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                // ---------------- TAB 1: PRAYER TIMES (SALAH & SEHRI/IFTAR) ----------------
                1 -> {
                    Card(
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("NEXT PRAYER", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldDark)
                                Text(nextPrayer.first, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = EmeraldDark)
                                Text(nextPrayer.second, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text(
                                text = SimpleDateFormat("EEE, dd MMM", Locale.getDefault()).format(Date()),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = EmeraldDark
                            )
                        }
                    }

                    // Calculation Method & Asr School
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        IslamicPrayerEngine.CalculationMethod.values().forEach { m ->
                            FilterChip(
                                selected = calcMethod == m,
                                onClick = { calcMethod = m },
                                label = { Text(m.displayName, fontSize = 11.sp) }
                            )
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IslamicPrayerEngine.AsrJuristic.values().forEach { j ->
                            FilterChip(
                                selected = asrJuristic == j,
                                onClick = { asrJuristic = j },
                                label = { Text(j.label, fontSize = 11.sp) }
                            )
                        }
                    }

                    val timings = listOf(
                        Triple("Sehri Ends (Suhoor)", IslamicPrayerEngine.formatDecimalHour(schedule.sehriEnds), Icons.Default.NightsStay),
                        Triple("Fajr (Dawn)", IslamicPrayerEngine.formatDecimalHour(schedule.fajr), Icons.Default.WbTwilight),
                        Triple("Sunrise (Ishraq)", IslamicPrayerEngine.formatDecimalHour(schedule.sunrise), Icons.Default.WbSunny),
                        Triple("Dhuhr (Noon)", IslamicPrayerEngine.formatDecimalHour(schedule.dhuhr), Icons.Default.LightMode),
                        Triple("Asr (${if (asrJuristic == IslamicPrayerEngine.AsrJuristic.HANAFI) "Hanafi" else "Shafi"})", IslamicPrayerEngine.formatDecimalHour(schedule.asr), Icons.Default.WbSunny),
                        Triple("Maghrib (Iftar)", IslamicPrayerEngine.formatDecimalHour(schedule.maghrib), Icons.Default.Brightness4),
                        Triple("Isha (Night)", IslamicPrayerEngine.formatDecimalHour(schedule.isha), Icons.Default.Bedtime),
                        Triple("Tahajjud (Last 3rd Night)", IslamicPrayerEngine.formatDecimalHour(schedule.tahajjudLastThird), Icons.Default.AutoAwesome)
                    )

                    timings.forEach { (label, timeStr, icon) ->
                        val highlight = label.startsWith(nextPrayer.first.substringBefore(" "))
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (highlight) EmeraldDark.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface
                            ),
                            border = if (highlight) BorderStroke(1.5.dp, EmeraldDark) else BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(icon, contentDescription = null, tint = EmeraldDark, modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(label, fontWeight = if (highlight) FontWeight.Bold else FontWeight.Medium, fontSize = 14.sp)
                                }
                                Text(
                                    text = timeStr,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 15.sp,
                                    color = EmeraldDark
                                )
                            }
                        }
                    }
                }

                // ---------------- TAB 2: DIGITAL TASBIH COUNTER ----------------
                2 -> {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        zikrPresets.forEachIndexed { idx, (_, latin) ->
                            FilterChip(
                                selected = selectedZikrIdx == idx,
                                onClick = {
                                    selectedZikrIdx = idx
                                    prefs.edit().putInt("zikr_idx", idx).apply()
                                },
                                label = { Text(latin.substringBefore(" ("), fontSize = 11.sp) }
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(33, 99, 100, 1000).forEach { target ->
                            FilterChip(
                                selected = tasbihTarget == target,
                                onClick = {
                                    tasbihTarget = target
                                    prefs.edit().putInt("tasbih_target", target).apply()
                                },
                                label = { Text("Target $target", fontSize = 11.sp) }
                            )
                        }
                    }

                    Card(
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = EmeraldDark),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                val nextVal = tasbihCount + 1
                                if (nextVal >= tasbihTarget) {
                                    tasbihCount = 0
                                    tasbihRounds += 1
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                } else {
                                    tasbihCount = nextVal
                                }
                                prefs.edit()
                                    .putInt("tasbih_count", tasbihCount)
                                    .putInt("tasbih_rounds", tasbihRounds)
                                    .apply()
                            }
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(28.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Text(
                                text = zikrPresets[selectedZikrIdx].first,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold,
                                color = IslamicGold,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = zikrPresets[selectedZikrIdx].second,
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.85f),
                                textAlign = TextAlign.Center
                            )

                            Box(
                                modifier = Modifier
                                    .size(165.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.1f))
                                    .border(3.dp, IslamicGold, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "$tasbihCount",
                                        fontSize = 48.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = "/ $tasbihTarget",
                                        fontSize = 14.sp,
                                        color = IslamicGold,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }

                            Text(
                                text = "Tap anywhere on the card to count • Completed Rounds: $tasbihRounds",
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.8f),
                                textAlign = TextAlign.Center
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                OutlinedButton(
                                    onClick = {
                                        tasbihCount = 0
                                        prefs.edit().putInt("tasbih_count", 0).apply()
                                    },
                                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.4f))
                                ) {
                                    Text("Reset Count", color = Color.White, fontSize = 12.sp)
                                }
                                OutlinedButton(
                                    onClick = {
                                        tasbihCount = 0
                                        tasbihRounds = 0
                                        prefs.edit().putInt("tasbih_count", 0).putInt("tasbih_rounds", 0).apply()
                                    },
                                    border = BorderStroke(1.dp, IslamicGold.copy(alpha = 0.6f))
                                ) {
                                    Text("Reset All", color = IslamicGold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
