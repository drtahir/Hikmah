package com.drtahir.studentkit.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Environment
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshots.SnapshotStateMap
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.FileProvider
import com.drtahir.studentkit.data.*
import com.drtahir.studentkit.viewmodel.Screen
import com.drtahir.studentkit.viewmodel.StudentKitViewModel
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

data class HeldPosBill(
    val id: String,
    val label: String,
    val clientId: String?,
    val cartItems: Map<String, Int>,
    val discountPercent: Double,
    val taxPercent: Double,
    val documentType: String,
    val heldAt: String
)

/**
 * Enterprise OmniPOS Suite & Fullscreen Invoice / Print Preview Studio
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvoiceGeneratorScreen(viewModel: StudentKitViewModel) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current

    val allProducts by viewModel.allPosProducts.collectAsState(initial = emptyList())
    val allClients by viewModel.allPosClients.collectAsState(initial = emptyList())
    val allOrders by viewModel.allPosOrders.collectAsState(initial = emptyList())
    val allKhataTx by viewModel.allPosKhataTransactions.collectAsState(initial = emptyList())
    val allPurchaseOrders by viewModel.allPosPurchaseOrders.collectAsState(initial = emptyList())
    val allPosExpenses by viewModel.allPosExpenses.collectAsState(initial = emptyList())
    val allCashDrawers by viewModel.allPosCashDrawers.collectAsState(initial = emptyList())
    val allEmployees by viewModel.allPosEmployees.collectAsState(initial = emptyList())
    val activeCashierName by viewModel.activeCashierName.collectAsState()
    val activeCashierRole by viewModel.activeCashierRole.collectAsState()

    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf(
        "POS",
        "Invoices",
        "Stock",
        "Reports",
        "Staff",
        "Setup"
    )

    // Active Cart State for Terminal
    val savedProfile = remember { getSavedBusinessProfile(context) }
    val activeCart = remember { mutableStateMapOf<String, Int>() } // productId -> quantity
    var selectedClientId by remember { mutableStateOf<String?>(null) }
    var terminalDiscountPercent by remember { mutableDoubleStateOf(0.0) }
    var terminalTaxPercent by remember { mutableDoubleStateOf(savedProfile.defaultTaxPercent) }
    var terminalPaymentMethod by remember { mutableStateOf("Cash") }
    var terminalDocType by remember { mutableStateOf("Invoice") }
    var isWholesaleMode by remember { mutableStateOf(false) }
    var terminalOrderMode by remember { mutableStateOf("Counter") }
    var terminalTableOrRef by remember { mutableStateOf("") }
    var redeemLoyaltyChecked by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }

    // Held / Parked Bills State
    val parkedBills = remember { mutableStateListOf<HeldPosBill>() }
    var showHeldBillsDialog by remember { mutableStateOf(false) }

    // Checkout Payment & Change Calculator Modal
    var showCheckoutPaymentDialog by remember { mutableStateOf(false) }

    // Fullscreen Invoice Preview Modal State
    var activePreviewOrder by remember { mutableStateOf<PosOrder?>(null) }
    var activePreviewItems by remember { mutableStateOf<List<PosOrderItem>>(emptyList()) }
    var activePreviewClient by remember { mutableStateOf<PosClient?>(null) }
    var showFullscreenInvoiceModal by remember { mutableStateOf(false) }

    // Product Add / Edit Dialog State
    var showAddProductDialog by remember { mutableStateOf(false) }
    var editingProduct by remember { mutableStateOf<PosProduct?>(null) }
    var prefillBarcodeForAdd by remember { mutableStateOf("") }
    var unknownScannedCodePrompt by remember { mutableStateOf<String?>(null) }

    // Return & Refund Dialog State
    var returnTargetOrder by remember { mutableStateOf<PosOrder?>(null) }
    var returnTargetItems by remember { mutableStateOf<List<PosOrderItem>>(emptyList()) }

    // Custom Invoice Builder Dialog
    var showCustomInvoiceDialog by remember { mutableStateOf(false) }

    // Pack B Dialog States: Register/PIN, Customers/Suppliers Khata, PO/GRN, Store Expenses
    var showRegisterAndPinDialog by remember { mutableStateOf(false) }
    var showClientEditorDialog by remember { mutableStateOf(false) }
    var clientEditorType by remember { mutableStateOf("Customer") }
    var editingClient by remember { mutableStateOf<PosClient?>(null) }
    var settleTargetClient by remember { mutableStateOf<PosClient?>(null) }
    var historyTargetClient by remember { mutableStateOf<PosClient?>(null) }
    var showPurchaseOrderDialog by remember { mutableStateOf(false) }
    var showAddExpenseDialog by remember { mutableStateOf(false) }

    // GMS Barcode Scanner Client
    val gmsScannerClient = remember {
        try {
            val options = GmsBarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_ALL_FORMATS)
                .enableAutoZoom()
                .build()
            GmsBarcodeScanning.getClient(context, options)
        } catch (_: Exception) {
            null
        }
    }

    fun launchBarcodeScanner(onScanned: (String) -> Unit) {
        if (gmsScannerClient == null) {
            Toast.makeText(context, "Camera barcode scanner unavailable on this device. Type SKU/barcode to search.", Toast.LENGTH_LONG).show()
            return
        }
        gmsScannerClient.startScan()
            .addOnSuccessListener { barcode ->
                val raw = barcode.rawValue?.trim()
                if (!raw.isNullOrBlank()) {
                    onScanned(raw)
                } else {
                    Toast.makeText(context, "Empty barcode detected", Toast.LENGTH_SHORT).show()
                }
            }
            .addOnFailureListener { e ->
                Toast.makeText(context, "Scan cancelled or failed: ${e.localizedMessage ?: "Retry"}", Toast.LENGTH_SHORT).show()
            }
    }

    fun tryAddProductToCart(prodId: String): Boolean {
        val prod = allProducts.firstOrNull { it.id == prodId }
        val currentQty = activeCart[prodId] ?: 0
        if (prod != null && terminalDocType != "Estimate") {
            if (prod.stock <= 0) {
                Toast.makeText(context, "${prod.name} is OUT OF STOCK!", Toast.LENGTH_SHORT).show()
                return false
            }
            if (currentQty >= prod.stock) {
                Toast.makeText(context, "Max stock reached (${prod.stock} ${prod.unit} available)", Toast.LENGTH_SHORT).show()
                return false
            }
        }
        activeCart[prodId] = currentQty + 1
        return true
    }

    fun handleBarcodeMatchOrPrompt(code: String) {
        val cleanCode = code.trim()
        val matched = allProducts.firstOrNull {
            it.barcode.equals(cleanCode, ignoreCase = true) ||
                it.sku.equals(cleanCode, ignoreCase = true) ||
                it.id.equals(cleanCode, ignoreCase = true)
        }
        if (matched != null) {
            if (tryAddProductToCart(matched.id)) {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                Toast.makeText(context, "Scanned: ${matched.name} (Qty: ${activeCart[matched.id] ?: 1})", Toast.LENGTH_SHORT).show()
            }
            searchQuery = ""
        } else {
            unknownScannedCodePrompt = cleanCode
        }
    }

    // Seed default sample inventory if empty on first launch
    LaunchedEffect(allProducts.isEmpty()) {
        if (allProducts.isEmpty()) {
            val sampleItems = listOf(
                PosProduct("prod_01", "Panadol Extra 500mg (Box of 20)", "Pharmacy", 180.0, 150, "Box", costPrice = 135.0, sku = "PHM-001", barcode = "8964001230011", minStockAlert = 20, batchNumber = "B-2611A", expiryDate = "2027-08-15", wholesalePrice = 155.0),
                PosProduct("prod_02", "Surgical Face Mask (50 pcs)", "Medical", 350.0, 80, "Box", costPrice = 220.0, sku = "MED-002", barcode = "8964001230028", minStockAlert = 15, batchNumber = "M-9910", expiryDate = "2028-02-01", wholesalePrice = 290.0),
                PosProduct("prod_03", "Digital BP Monitor", "Equipment", 4200.0, 25, "Unit", costPrice = 2950.0, sku = "EQP-003", barcode = "8964001230035", minStockAlert = 5, wholesalePrice = 3700.0),
                PosProduct("prod_04", "Hand Sanitizer 500ml 75% Alcohol", "Hygiene", 290.0, 95, "Bottle", costPrice = 185.0, sku = "HYG-004", barcode = "8964001230042", minStockAlert = 15, batchNumber = "H-402", expiryDate = "2026-12-25", wholesalePrice = 240.0),
                PosProduct("prod_05", "Multivitamin & Zinc Syrup 120ml", "Pharmacy", 240.0, 110, "Bottle", costPrice = 165.0, sku = "PHM-005", barcode = "8964001230059", minStockAlert = 20, batchNumber = "V-118", expiryDate = "2026-12-10", wholesalePrice = 205.0),
                PosProduct("prod_06", "A4 Printing Paper Ream (500 Sheets)", "Stationery", 1250.0, 40, "Ream", costPrice = 980.0, sku = "STN-006", barcode = "8964001230066", minStockAlert = 8, wholesalePrice = 1120.0),
                PosProduct("prod_07", "Stainless Steel Stethoscope", "Equipment", 2800.0, 15, "Unit", costPrice = 1950.0, sku = "EQP-007", barcode = "8964001230073", minStockAlert = 5, wholesalePrice = 2450.0),
                PosProduct("prod_08", "Infrared Non-Contact Thermometer", "Equipment", 1950.0, 30, "Unit", costPrice = 1380.0, sku = "EQP-008", barcode = "8964001230080", minStockAlert = 6, wholesalePrice = 1720.0)
            )
            sampleItems.forEach { viewModel.insertPosProduct(it) }

            if (allClients.isEmpty()) {
                val sampleClients = listOf(
                    PosClient("client_01", "Dr. Tahir Medical Complex", "0300-1234567", "info@tahirclinic.pk", "Buner, KP, Pakistan", "Customer"),
                    PosClient("client_02", "Al-Khidmat Pharmacy & Diagnostic", "0345-9876543", "alkhidmat@buner.org", "Main Bazar, Daggar, Buner", "Customer"),
                    PosClient("client_03", "Khyber Surgical Supplies Ltd", "091-5840001", "orders@khybersurgical.com", "Industrial Estate, Hayatabad, Peshawar", "Supplier")
                )
                sampleClients.forEach { viewModel.insertPosClient(it) }
            }
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0.dp),
        topBar = {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 6.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        IconButton(
                            onClick = { viewModel.navigateBack() },
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                        Box(
                            modifier = Modifier
                                .size(30.dp)
                                .clip(RoundedCornerShape(7.dp))
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.PointOfSale,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        val openDrawer = allCashDrawers.firstOrNull { it.status == "OPEN" }
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { showRegisterAndPinDialog = true }
                                .padding(horizontal = 4.dp, vertical = 2.dp)
                        ) {
                            Text(
                                "OmniPOS Suite",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                "${activeCashierName.substringBefore(" ")} • ${if (openDrawer != null) "Drawer OPEN" else "Drawer Closed"}",
                                fontSize = 10.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                color = if (openDrawer != null) Color(0xFF2E7D32) else Color(0xFFE65100)
                            )
                        }
                    }

                    // Compact Quick Actions + Register/PIN + Home shortcut
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val hasOpenDrawer = allCashDrawers.any { it.status == "OPEN" }
                        IconButton(
                            onClick = { showRegisterAndPinDialog = true },
                            modifier = Modifier.size(34.dp)
                        ) {
                            Icon(
                                if (hasOpenDrawer) Icons.Default.LockOpen else Icons.Default.Lock,
                                contentDescription = "Cash Drawer & PIN Switch",
                                tint = if (hasOpenDrawer) Color(0xFF2E7D32) else Color(0xFFE65100),
                                modifier = Modifier.size(19.dp)
                            )
                        }
                        IconButton(
                            onClick = {
                                editingProduct = null
                                prefillBarcodeForAdd = ""
                                showAddProductDialog = true
                            },
                            modifier = Modifier.size(34.dp)
                        ) {
                            Icon(Icons.Default.AddBox, contentDescription = "Add Product", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(19.dp))
                        }
                        IconButton(
                            onClick = { showCustomInvoiceDialog = true },
                            modifier = Modifier.size(34.dp)
                        ) {
                            Icon(Icons.Default.PostAdd, contentDescription = "Custom Invoice", tint = Color(0xFF00897B), modifier = Modifier.size(19.dp))
                        }
                        IconButton(
                            onClick = { viewModel.navigateTo(Screen.Dashboard) },
                            modifier = Modifier.size(34.dp)
                        ) {
                            Icon(Icons.Default.Home, contentDescription = "Home", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(19.dp))
                        }
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                windowInsets = WindowInsets(0.dp),
                tonalElevation = 4.dp
            ) {
                val navIcons = listOf(
                    Icons.Default.PointOfSale,
                    Icons.Default.ReceiptLong,
                    Icons.Default.Inventory2,
                    Icons.Default.Assessment,
                    Icons.Default.Groups,
                    Icons.Default.Settings
                )
                tabs.forEachIndexed { index, label ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = {
                            Icon(
                                imageVector = navIcons[index],
                                contentDescription = label,
                                modifier = Modifier.size(20.dp)
                            )
                        },
                        label = {
                            Text(
                                text = label,
                                fontSize = 10.5.sp,
                                maxLines = 1,
                                softWrap = false,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    )
                }
            }
        }
    ) { posPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(posPadding)
        ) {
            when (selectedTab) {
                0 -> {
                    // POS TERMINAL & BILLING
                    PosTerminalSection(
                        allProducts = allProducts,
                        allClients = allClients,
                        activeCart = activeCart,
                        parkedCount = parkedBills.size,
                        searchQuery = searchQuery,
                        onSearchQueryChange = { searchQuery = it },
                        onScanBarcodeClick = {
                            launchBarcodeScanner { code -> handleBarcodeMatchOrPrompt(code) }
                        },
                        onSearchBarcodeSubmit = { code ->
                            if (code.isNotBlank()) handleBarcodeMatchOrPrompt(code)
                        },
                        selectedCategory = selectedCategory,
                        onSelectCategory = { selectedCategory = it },
                        selectedClientId = selectedClientId,
                        onSelectClient = {
                            selectedClientId = it
                            redeemLoyaltyChecked = false
                        },
                        onQuickAddCustomer = {
                            editingClient = null
                            clientEditorType = "Customer"
                            showClientEditorDialog = true
                        },
                        redeemLoyaltyChecked = redeemLoyaltyChecked,
                        onRedeemLoyaltyChange = { redeemLoyaltyChecked = it },
                        isWholesaleMode = isWholesaleMode,
                        onToggleWholesale = { isWholesaleMode = !isWholesaleMode },
                        orderMode = terminalOrderMode,
                        onOrderModeChange = { terminalOrderMode = it },
                        tableOrRef = terminalTableOrRef,
                        onTableOrRefChange = { terminalTableOrRef = it },
                        discountPercent = terminalDiscountPercent,
                        onDiscountChange = { terminalDiscountPercent = it },
                        taxPercent = terminalTaxPercent,
                        onTaxChange = { terminalTaxPercent = it },
                        paymentMethod = terminalPaymentMethod,
                        onPaymentMethodChange = { terminalPaymentMethod = it },
                        documentType = terminalDocType,
                        onDocumentTypeChange = { terminalDocType = it },
                        onAddToCart = { prodId -> tryAddProductToCart(prodId) },
                        onRemoveFromCart = { prodId ->
                            val current = activeCart[prodId] ?: 0
                            if (current <= 1) activeCart.remove(prodId) else activeCart[prodId] = current - 1
                        },
                        onClearCart = {
                            activeCart.clear()
                            redeemLoyaltyChecked = false
                            terminalTableOrRef = ""
                        },
                        onHoldCurrentBill = {
                            if (activeCart.isNotEmpty()) {
                                val clientLabel = allClients.firstOrNull { it.id == selectedClientId }?.name ?: "Walk-in Customer"
                                val nowStr = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
                                val held = HeldPosBill(
                                    id = "HOLD-${parkedBills.size + 1}-${System.currentTimeMillis() % 1000}",
                                    label = clientLabel,
                                    clientId = selectedClientId,
                                    cartItems = activeCart.toMap(),
                                    discountPercent = terminalDiscountPercent,
                                    taxPercent = terminalTaxPercent,
                                    documentType = terminalDocType,
                                    heldAt = nowStr
                                )
                                parkedBills.add(0, held)
                                activeCart.clear()
                                selectedClientId = null
                                terminalDiscountPercent = 0.0
                                redeemLoyaltyChecked = false
                                terminalTableOrRef = ""
                                Toast.makeText(context, "Bill parked for $clientLabel", Toast.LENGTH_SHORT).show()
                            }
                        },
                        onOpenParkedBills = { showHeldBillsDialog = true },
                        onCheckout = {
                            if (activeCart.isEmpty()) {
                                Toast.makeText(context, "Cart is empty. Add products to bill.", Toast.LENGTH_SHORT).show()
                                return@PosTerminalSection
                            }
                            showCheckoutPaymentDialog = true
                        }
                    )
                }

                1 -> {
                    // INVOICES, CUSTOMERS KHATA & STORE EXPENSES LEDGER
                    PosInvoicesLedgerSection(
                        allOrders = allOrders,
                        allClients = allClients,
                        allKhataTx = allKhataTx,
                        allPosExpenses = allPosExpenses,
                        viewModel = viewModel,
                        onOpenFullscreenInvoice = { order, items, client ->
                            activePreviewOrder = order
                            activePreviewItems = items
                            activePreviewClient = client
                            showFullscreenInvoiceModal = true
                        },
                        onOpenReturnDialog = { order, items ->
                            returnTargetOrder = order
                            returnTargetItems = items
                        },
                        onCreateCustomInvoice = { showCustomInvoiceDialog = true },
                        onAddClient = { type ->
                            editingClient = null
                            clientEditorType = type
                            showClientEditorDialog = true
                        },
                        onEditClient = { c ->
                            editingClient = c
                            clientEditorType = c.type
                            showClientEditorDialog = true
                        },
                        onSettleKhata = { c -> settleTargetClient = c },
                        onViewClientHistory = { c -> historyTargetClient = c },
                        onAddExpense = { showAddExpenseDialog = true },
                        onDeleteExpense = { id -> viewModel.deletePosExpenseById(id) }
                    )
                }

                2 -> {
                    // PRODUCTS, INVENTORY & SUPPLIERS / GRN STOCK-IN
                    PosInventorySection(
                        allProducts = allProducts,
                        allSuppliers = allClients.filter { it.type.equals("Supplier", true) },
                        allPurchaseOrders = allPurchaseOrders,
                        onAddProduct = {
                            prefillBarcodeForAdd = ""
                            editingProduct = null
                            showAddProductDialog = true
                        },
                        onEditProduct = { prod ->
                            editingProduct = prod
                            prefillBarcodeForAdd = ""
                            showAddProductDialog = true
                        },
                        onQuickRestock = { prodId, qty ->
                            viewModel.incrementPosProductStock(prodId, qty)
                            Toast.makeText(context, "+$qty units added to stock", Toast.LENGTH_SHORT).show()
                        },
                        onDeleteProduct = { viewModel.deletePosProductById(it) },
                        onAddSupplier = {
                            editingClient = null
                            clientEditorType = "Supplier"
                            showClientEditorDialog = true
                        },
                        onOpenReceiveGrn = { showPurchaseOrderDialog = true },
                        onPaySupplier = { sup -> settleTargetClient = sup },
                        onViewSupplierHistory = { sup -> historyTargetClient = sup },
                        onPrintBarcodeTags = { productsToTag ->
                            val liveProfile = getSavedBusinessProfile(context)
                            BluetoothThermalPrinterHelper.printBarcodePriceTagsPdf(
                                context = context,
                                businessName = liveProfile.businessName,
                                currency = liveProfile.currency.ifBlank { "Rs" },
                                products = productsToTag
                            )
                        }
                    )
                }

                3 -> {
                    // EMBEDDED 1-CLICK FINANCIAL REPORTS
                    OmniPosFinancialReportsScreen(viewModel = viewModel)
                }

                4 -> {
                    // EMBEDDED STAFF & SHIFT MANAGEMENT
                    OmniPosEmployeesTab(viewModel = viewModel)
                }

                5 -> {
                    // ENTERPRISE SUITE SETTINGS & OFFICIAL LOGO STUDIO
                    PosEnterpriseSettingsSection(context = context, viewModel = viewModel)
                }
            }
        }
    }

    // FULLSCREEN INVOICE PREVIEW & PRINT STUDIO MODAL (User's #1 Request)
    if (showFullscreenInvoiceModal && activePreviewOrder != null) {
        val order = activePreviewOrder!!
        FullscreenInvoicePreviewModal(
            context = context,
            order = order,
            items = activePreviewItems,
            client = activePreviewClient,
            onDismiss = { showFullscreenInvoiceModal = false }
        )
    }

    // CHECKOUT PAYMENT & SPLIT TENDER DIALOG
    if (showCheckoutPaymentDialog && activeCart.isNotEmpty()) {
        val currentProfile = remember { getSavedBusinessProfile(context) }
        val checkoutItems = activeCart.map { (prodId, qty) ->
            val prod = allProducts.firstOrNull { it.id == prodId }
                ?: PosProduct(prodId, "Item $prodId", "General", 0.0, 100, "Unit")
            val effPrice = if (isWholesaleMode) {
                if (prod.wholesalePrice > 0.0) prod.wholesalePrice else prod.price * 0.85
            } else {
                prod.price
            }
            PosOrderItem(
                id = UUID.randomUUID().toString(),
                orderId = "",
                productId = prod.id,
                name = if (isWholesaleMode) "${prod.name} [W/S]" else prod.name,
                quantity = qty,
                price = effPrice,
                costPrice = prod.costPrice
            )
        }
        val selectedClientObj = allClients.firstOrNull { it.id == selectedClientId }
        val subtotal = checkoutItems.sumOf { it.price * it.quantity }
        val baseDiscountAmt = subtotal * (terminalDiscountPercent / 100.0)
        val afterBaseDisc = (subtotal - baseDiscountAmt).coerceAtLeast(0.0)
        val taxAmt = afterBaseDisc * (terminalTaxPercent / 100.0)
        val rawTotal = (afterBaseDisc + taxAmt).coerceAtLeast(0.0)
        val ptsAvailable = selectedClientObj?.loyaltyPoints ?: 0
        val pointsToRedeem = if (redeemLoyaltyChecked && selectedClientObj != null && ptsAvailable >= 10) {
            minOf(ptsAvailable, (rawTotal / 2.0).toInt())
        } else 0
        val loyaltyDiscountAmt = pointsToRedeem.toDouble()
        val grandTotal = (rawTotal - loyaltyDiscountAmt).coerceAtLeast(0.0)

        PosCheckoutPaymentDialog(
            docType = terminalDocType,
            initialMethod = terminalPaymentMethod,
            clientName = selectedClientObj?.name ?: "Walking Customer / Cash",
            subtotal = subtotal,
            discountAmt = baseDiscountAmt + loyaltyDiscountAmt,
            taxAmt = taxAmt,
            grandTotal = grandTotal,
            onDismiss = { showCheckoutPaymentDialog = false },
            onConfirmPayment = { finalDocType, method, breakdown, paidAmt, changeDue, dueAmt, status ->
                val orderId = if (finalDocType == "Estimate") {
                    "EST-${System.currentTimeMillis() % 1000000}"
                } else {
                    "INV-${System.currentTimeMillis() % 1000000}"
                }
                val dateStr = SimpleDateFormat("dd-MMM-yyyy hh:mm a", Locale.getDefault()).format(Date())
                val finalizedItems = checkoutItems.map { it.copy(orderId = orderId) }
                val ptsPer100 = currentProfile.loyaltyPointsPer100.coerceAtLeast(0)
                val earnedPts = if (finalDocType != "Estimate" && selectedClientObj != null) {
                    ((grandTotal / 100.0) * ptsPer100).toInt().coerceAtLeast(0)
                } else 0
                val newOrder = PosOrder(
                    id = orderId,
                    date = dateStr,
                    clientId = selectedClientId,
                    subtotal = subtotal,
                    tax = taxAmt,
                    discount = baseDiscountAmt + loyaltyDiscountAmt,
                    total = grandTotal,
                    documentType = finalDocType,
                    paymentMethod = method,
                    paymentBreakdown = breakdown,
                    paidAmount = paidAmt,
                    changeDue = changeDue,
                    dueAmount = dueAmt,
                    status = status,
                    cashierName = activeCashierName,
                    loyaltyEarned = earnedPts,
                    orderMode = terminalOrderMode,
                    tableOrRef = terminalTableOrRef.trim()
                )
                viewModel.completePosCheckout(newOrder, finalizedItems, redeemedPoints = pointsToRedeem)

                showCheckoutPaymentDialog = false
                terminalPaymentMethod = method
                terminalDocType = finalDocType
                activePreviewOrder = newOrder
                activePreviewItems = finalizedItems
                activePreviewClient = selectedClientObj
                showFullscreenInvoiceModal = true
                activeCart.clear()
                redeemLoyaltyChecked = false
                terminalTableOrRef = ""
                Toast.makeText(context, "$orderId ($status) Saved & Stock Updated!", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // HELD / PARKED BILLS MODAL
    if (showHeldBillsDialog) {
        AlertDialog(
            onDismissRequest = { showHeldBillsDialog = false },
            title = { Text("Parked / Held Bills (${parkedBills.size})", fontWeight = FontWeight.Bold) },
            text = {
                if (parkedBills.isEmpty()) {
                    Text("No held bills right now. Tap Hold in the cart to pause a customer's bill.", fontSize = 13.sp, color = Color.Gray)
                } else {
                    Column(
                        modifier = Modifier.fillMaxWidth().heightIn(max = 360.dp).verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        parkedBills.forEach { bill ->
                            val itemCount = bill.cartItems.values.sum()
                            val estTotal = bill.cartItems.entries.sumOf { (pid, q) ->
                                (allProducts.firstOrNull { it.id == pid }?.price ?: 0.0) * q
                            }
                            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp)) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(bill.label, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text("$itemCount item(s) • Rs ${estTotal.toInt()} • ${bill.heldAt}", fontSize = 11.sp, color = Color.Gray)
                                    }
                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        FilledTonalButton(
                                            onClick = {
                                                activeCart.clear()
                                                activeCart.putAll(bill.cartItems)
                                                selectedClientId = bill.clientId
                                                terminalDiscountPercent = bill.discountPercent
                                                terminalTaxPercent = bill.taxPercent
                                                terminalDocType = bill.documentType
                                                parkedBills.remove(bill)
                                                showHeldBillsDialog = false
                                                Toast.makeText(context, "Resumed bill for ${bill.label}", Toast.LENGTH_SHORT).show()
                                            },
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                        ) {
                                            Text("Resume", fontSize = 11.sp)
                                        }
                                        IconButton(onClick = { parkedBills.remove(bill) }, modifier = Modifier.size(30.dp)) {
                                            Icon(Icons.Default.Delete, null, tint = Color.Red, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showHeldBillsDialog = false }) { Text("Close") }
            }
        )
    }

    // UNKNOWN SCANNED BARCODE PROMPT
    if (unknownScannedCodePrompt != null) {
        val code = unknownScannedCodePrompt!!
        AlertDialog(
            onDismissRequest = { unknownScannedCodePrompt = null },
            title = { Text("Barcode Not In Catalog", fontWeight = FontWeight.Bold) },
            text = { Text("No product matches barcode/SKU \"$code\". Would you like to add it to Inventory now?") },
            confirmButton = {
                Button(onClick = {
                    unknownScannedCodePrompt = null
                    editingProduct = null
                    prefillBarcodeForAdd = code
                    showAddProductDialog = true
                }) {
                    Text("Add Product")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    unknownScannedCodePrompt = null
                    searchQuery = code
                }) { Text("Search Manually") }
            }
        )
    }

    // RETURN / PARTIAL REFUND DIALOG
    if (returnTargetOrder != null) {
        PosReturnRefundDialog(
            order = returnTargetOrder!!,
            items = returnTargetItems,
            onDismiss = {
                returnTargetOrder = null
                returnTargetItems = emptyList()
            },
            onConfirmReturn = { qtyMap, restock, refundMethod ->
                val target = returnTargetOrder!!
                val itemsSnapshot = returnTargetItems
                returnTargetOrder = null
                returnTargetItems = emptyList()
                viewModel.processPosReturn(
                    originalOrder = target,
                    originalItems = itemsSnapshot,
                    returnQtyMap = qtyMap,
                    restockItems = restock,
                    refundMethod = refundMethod
                ) { creditOrder, creditItems ->
                    activePreviewOrder = creditOrder
                    activePreviewItems = creditItems
                    activePreviewClient = allClients.firstOrNull { it.id == creditOrder.clientId }
                    showFullscreenInvoiceModal = true
                    Toast.makeText(context, "Credit Note ${creditOrder.id} issued!", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }

    // Add / Edit Product Modal
    if (showAddProductDialog) {
        PosProductEditorDialog(
            existingProduct = editingProduct,
            initialBarcode = prefillBarcodeForAdd,
            onScanBarcode = { onScanned -> launchBarcodeScanner(onScanned) },
            onDismiss = {
                showAddProductDialog = false
                editingProduct = null
                prefillBarcodeForAdd = ""
            },
            onConfirm = { product ->
                viewModel.insertPosProduct(product)
                val wasEdit = editingProduct != null
                showAddProductDialog = false
                editingProduct = null
                prefillBarcodeForAdd = ""
                Toast.makeText(context, if (wasEdit) "Product updated" else "Product added to catalog", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // Custom Invoice Builder Dialog
    if (showCustomInvoiceDialog) {
        CustomInvoiceBuilderDialog(
            allClients = allClients,
            onDismiss = { showCustomInvoiceDialog = false },
            onCreateOrder = { newOrder, newItems ->
                viewModel.completePosCheckout(newOrder.copy(cashierName = activeCashierName), newItems)
                showCustomInvoiceDialog = false
                activePreviewOrder = newOrder.copy(cashierName = activeCashierName)
                activePreviewItems = newItems
                activePreviewClient = allClients.firstOrNull { it.id == newOrder.clientId }
                showFullscreenInvoiceModal = true
                Toast.makeText(context, "Custom Invoice Generated!", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // CASH DRAWER & CASHIER PIN SWITCH DIALOG
    if (showRegisterAndPinDialog) {
        PosRegisterAndPinDialog(
            activeCashierName = activeCashierName,
            activeCashierRole = activeCashierRole,
            employees = allEmployees,
            drawers = allCashDrawers,
            orders = allOrders,
            posExpenses = allPosExpenses,
            onDismiss = { showRegisterAndPinDialog = false },
            onSwitchCashierPin = { pin, cb ->
                viewModel.switchCashierByPin(pin, cb)
            },
            onOpenDrawer = { floatAmt, note ->
                viewModel.openCashDrawerSession(floatAmt, activeCashierName, note)
                Toast.makeText(context, "Cash Drawer Opened with Rs ${floatAmt.toInt()} Float!", Toast.LENGTH_SHORT).show()
            },
            onCloseDrawer = { session, expected, counted, note ->
                viewModel.closeCashDrawerSession(session, expected, counted, note)
                Toast.makeText(context, "Register Closed & Reconciled!", Toast.LENGTH_SHORT).show()
            },
            onQuickCashMovement = { isCashIn, amount, note ->
                val dateStr = SimpleDateFormat("dd-MMM-yyyy hh:mm a", Locale.getDefault()).format(Date())
                viewModel.insertPosExpense(
                    PosExpense(
                        id = "CSH-${System.currentTimeMillis() % 1000000}",
                        date = dateStr,
                        category = if (isCashIn) "Cash In Top-up" else "Petty Cash Out",
                        amount = amount,
                        paymentSource = "Cash Drawer",
                        note = note
                    )
                )
                Toast.makeText(context, if (isCashIn) "Cash Top-up Added" else "Petty Cash Paid Out", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // ADD / EDIT CUSTOMER OR SUPPLIER DIALOG
    if (showClientEditorDialog) {
        PosClientEditorDialog(
            existingClient = editingClient,
            defaultType = clientEditorType,
            onDismiss = {
                showClientEditorDialog = false
                editingClient = null
            },
            onSave = { client ->
                viewModel.insertPosClient(client)
                if (client.type.equals("Customer", true) && editingClient == null) {
                    selectedClientId = client.id
                }
                showClientEditorDialog = false
                editingClient = null
                Toast.makeText(context, "${client.type} ${client.name} saved!", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // KHATA / SUPPLIER PAYMENT SETTLEMENT DIALOG
    if (settleTargetClient != null) {
        val target = settleTargetClient!!
        PosKhataSettleDialog(
            client = target,
            onDismiss = { settleTargetClient = null },
            onConfirmSettle = { amount, method, note ->
                viewModel.settlePosKhataPayment(target, amount, method, note)
                settleTargetClient = null
                Toast.makeText(context, "Recorded Rs ${amount.toInt()} settlement for ${target.name}", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // KHATA STATEMENT HISTORY DIALOG
    if (historyTargetClient != null) {
        val target = historyTargetClient!!
        PosKhataHistoryDialog(
            context = context,
            client = target,
            transactions = allKhataTx.filter { it.clientId == target.id },
            onDismiss = { historyTargetClient = null }
        )
    }

    // SUPPLIER PURCHASE ORDER / GRN STOCK-IN DIALOG
    if (showPurchaseOrderDialog) {
        PosPurchaseOrderGrnDialog(
            suppliers = allClients.filter { it.type.equals("Supplier", true) },
            products = allProducts,
            onDismiss = { showPurchaseOrderDialog = false },
            onReceiveGrn = { po, stockUpdates ->
                viewModel.receivePurchaseOrderGrn(po, stockUpdates)
                showPurchaseOrderDialog = false
                Toast.makeText(context, "GRN ${po.id} Received! Inventory Stock & Costs Updated.", Toast.LENGTH_SHORT).show()
            }
        )
    }

    // LOG STORE EXPENSE DIALOG
    if (showAddExpenseDialog) {
        PosExpenseEditorDialog(
            onDismiss = { showAddExpenseDialog = false },
            onSave = { exp ->
                viewModel.insertPosExpense(exp)
                showAddExpenseDialog = false
                Toast.makeText(context, "Expense (${exp.category}) recorded", Toast.LENGTH_SHORT).show()
            }
        )
    }
}

// -------------------------------------------------------------
// FULLSCREEN INVOICE & PRINT PREVIEW MODAL (FIT TO SCREEN)
// -------------------------------------------------------------
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FullscreenInvoicePreviewModal(
    context: Context,
    order: PosOrder,
    items: List<PosOrderItem>,
    client: PosClient?,
    onDismiss: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var selectedFormatMode by remember { mutableStateOf("A4 Standard") } // "A4 Standard", "80mm Thermal", "58mm Slip"
    var viewMode by remember { mutableStateOf("Visual Bill") } // "Visual Bill", "Monospace Print"
    var zoomFactor by remember { mutableFloatStateOf(10f) }
    var isDarkPaper by remember { mutableStateOf(false) }

    // Business profile & Logo preferences
    val profile = remember { getSavedBusinessProfile(context) }
    val logoBitmap = remember { BluetoothThermalPrinterHelper.getSavedLogoBitmap(context) }

    val businessName = profile.businessName
    val businessAddress = "${profile.address}, ${profile.cityCountry}"
    val businessPhone = profile.phone
    val businessNtn = profile.ntnNumber

    val paymentSummaryLabel = remember(order) {
        buildString {
            append(order.paymentMethod.ifBlank { "Cash" })
            if (order.paymentBreakdown.isNotBlank()) append(" (${order.paymentBreakdown})")
            if (order.changeDue > 0.0) append(" | Change: Rs ${String.format("%.2f", order.changeDue)}")
            if (order.dueAmount > 0.0) append(" | Balance Due: Rs ${String.format("%.2f", order.dueAmount)}")
        }
    }

    val a4Text = remember(order, items, client, profile, paymentSummaryLabel) {
        BluetoothThermalPrinterHelper.buildA4InvoiceText(
            businessName = businessName,
            tagline = profile.tagline.ifBlank { "Healthcare & Enterprise Solutions" },
            address = businessAddress,
            phone = businessPhone,
            orderId = order.id,
            dateStr = order.date,
            clientName = client?.name ?: "Walking Customer / Cash",
            items = items,
            subtotal = order.subtotal,
            discount = order.discount,
            tax = order.tax,
            total = order.total,
            paymentMethod = paymentSummaryLabel,
            footerNote = "Official computerized sales invoice. Status: ${order.status}"
        )
    }

    val thermalText = remember(order, items, client, profile, selectedFormatMode, paymentSummaryLabel) {
        BluetoothThermalPrinterHelper.buildThermalReceiptText(
            businessName = businessName,
            tagline = profile.tagline.ifBlank { "Healthcare & Enterprise Solutions" },
            address = businessAddress,
            phone = businessPhone,
            orderId = order.id,
            dateStr = order.date,
            clientName = client?.name ?: "Walking Customer / Cash",
            items = items,
            subtotal = order.subtotal,
            discount = order.discount,
            tax = order.tax,
            total = order.total,
            paymentMethod = paymentSummaryLabel,
            footerNote = "Thank you for your visit! (${order.status})",
            is80mm = selectedFormatMode == "80mm Thermal"
        )
    }

    // Helper to generate the active high-resolution bitmap for gallery saving and sharing
    fun getActiveBillBitmap(): Bitmap {
        return if (selectedFormatMode == "A4 Standard") {
            BluetoothThermalPrinterHelper.renderA4InvoiceBitmap(
                businessName = businessName,
                tagline = profile.tagline.ifBlank { "Healthcare & Enterprise Solutions" },
                address = businessAddress,
                phone = businessPhone,
                ntn = businessNtn,
                orderId = order.id,
                dateStr = order.date,
                clientName = client?.name ?: "Walking Customer / Cash",
                clientPhone = client?.phone ?: "",
                clientAddress = client?.address ?: "",
                items = items,
                subtotal = order.subtotal,
                discount = order.discount,
                tax = order.tax,
                total = order.total,
                paymentMethod = paymentSummaryLabel,
                footerNote = "Official computerized sales invoice. Status: ${order.status}",
                logoBitmap = logoBitmap,
                showLogo = profile.showLogoOnInvoice
            )
        } else {
            BluetoothThermalPrinterHelper.renderThermalReceiptBitmap(
                businessName = businessName,
                tagline = profile.tagline.ifBlank { "Healthcare & Enterprise Solutions" },
                address = businessAddress,
                phone = businessPhone,
                orderId = order.id,
                dateStr = order.date,
                clientName = client?.name ?: "Walking Customer / Cash",
                items = items,
                subtotal = order.subtotal,
                discount = order.discount,
                tax = order.tax,
                total = order.total,
                paymentMethod = paymentSummaryLabel,
                footerNote = "Thank you for your visit! (${order.status})",
                logoBitmap = logoBitmap,
                showLogo = profile.showLogoOnThermal,
                is80mm = selectedFormatMode == "80mm Thermal"
            )
        }
    }

    val invoiceSummary = remember(order, items, client, businessName, paymentSummaryLabel) {
        "🧾 *Official ${order.documentType} - ${businessName.ifBlank { "OmniPOS Enterprise" }}*\n" +
        "📄 Doc #: ${order.id} (${order.status})\n" +
        "📅 Date: ${order.date}\n" +
        "👤 Customer: ${client?.name ?: "Walking Customer / Cash"}\n" +
        "📦 Items: ${items.size} item(s)\n" +
        "💵 Total: Rs ${String.format("%.2f", order.total)}\n" +
        "💳 Payment: $paymentSummaryLabel\n\n" +
        "Thank you for your business!"
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            decorFitsSystemWindows = false
        )
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = if (isDarkPaper) Color(0xFF0F172A) else Color(0xFFE2E8F0)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top App Bar with Controls
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.surface,
                    shadowElevation = 6.dp
                ) {
                    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f).padding(end = 8.dp)
                            ) {
                                IconButton(onClick = onDismiss) {
                                    Icon(Icons.Default.ArrowBack, contentDescription = "Close Preview")
                                }
                                Spacer(modifier = Modifier.width(4.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            "Invoice ${order.id}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(
                                            color = MaterialTheme.colorScheme.primaryContainer,
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                order.documentType,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.primary,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                    Text(
                                        "Rs ${String.format("%.2f", order.total)} • ${order.date}",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            // View Mode Toggle, Zoom & Paper Tone Controls
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                IconButton(
                                    onClick = { viewMode = if (viewMode == "Visual Bill") "Monospace Print" else "Visual Bill" },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        if (viewMode == "Visual Bill") Icons.Default.Code else Icons.Default.ViewAgenda,
                                        contentDescription = "Toggle Sheet/Code View",
                                        modifier = Modifier.size(18.dp),
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                }
                                IconButton(
                                    onClick = { zoomFactor = (zoomFactor - 1f).coerceAtLeast(6.5f) },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Default.ZoomOut, contentDescription = "Zoom Out", modifier = Modifier.size(18.dp))
                                }
                                Text("${zoomFactor.toInt()}pt", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                IconButton(
                                    onClick = { zoomFactor = (zoomFactor + 1f).coerceAtMost(18f) },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Default.ZoomIn, contentDescription = "Zoom In", modifier = Modifier.size(18.dp))
                                }
                                IconButton(
                                    onClick = { isDarkPaper = !isDarkPaper },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        if (isDarkPaper) Icons.Default.LightMode else Icons.Default.DarkMode,
                                        contentDescription = "Toggle Paper Tone",
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }

                        // Format Preset Chips (A4 vs Thermal)
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            listOf("A4 Standard", "80mm Thermal", "58mm Slip").forEach { fmt ->
                                val isSelected = selectedFormatMode == fmt
                                FilterChip(
                                    selected = isSelected,
                                    onClick = { selectedFormatMode = fmt },
                                    label = {
                                        Text(
                                            when (fmt) {
                                                "A4 Standard" -> "📄 A4 Standard"
                                                "80mm Thermal" -> "🧾 80mm Thermal"
                                                else -> "🧾 58mm Slip"
                                            },
                                            fontSize = 11.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                        )
                                    },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }
                }

                // SCROLLABLE DOCUMENT VIEWPORT
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    contentAlignment = Alignment.TopCenter
                ) {
                    if (selectedFormatMode == "A4 Standard") {
                        // -------------------------------------------------------------
                        // A4 STANDARD INVOICE VIEWPORT
                        // -------------------------------------------------------------
                        Card(
                            modifier = Modifier
                                .fillMaxSize()
                                .shadow(6.dp, RoundedCornerShape(8.dp)),
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isDarkPaper) Color(0xFF1E293B) else Color.White
                            ),
                            border = BorderStroke(1.dp, if (isDarkPaper) Color(0xFF334155) else Color(0xFFCBD5E1))
                        ) {
                            if (viewMode == "Monospace Print") {
                                // Raw printable ASCII layout
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .verticalScroll(rememberScrollState())
                                        .horizontalScroll(rememberScrollState())
                                        .padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    if (profile.showLogoOnInvoice && logoBitmap != null) {
                                        Image(
                                            bitmap = logoBitmap.asImageBitmap(),
                                            contentDescription = "Logo",
                                            modifier = Modifier.height(50.dp).padding(bottom = 10.dp),
                                            contentScale = ContentScale.Fit
                                        )
                                    }
                                    Text(
                                        text = a4Text,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = zoomFactor.sp,
                                        color = if (isDarkPaper) Color(0xFFF1F5F9) else Color(0xFF0F172A),
                                        lineHeight = (zoomFactor * 1.35f).sp
                                    )
                                }
                            } else {
                                // Authentic A4 Tax Invoice Page Layout
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .verticalScroll(rememberScrollState())
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    // Top Accent Bar
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp)
                                            .background(Color(0xFF0F766E), RoundedCornerShape(2.dp))
                                    )

                                    // Invoice Header Section
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.Top
                                    ) {
                                        // Left: Business Branding
                                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                            if (profile.showLogoOnInvoice && logoBitmap != null) {
                                                Image(
                                                    bitmap = logoBitmap.asImageBitmap(),
                                                    contentDescription = "Logo",
                                                    modifier = Modifier.size(54.dp).clip(RoundedCornerShape(6.dp)),
                                                    contentScale = ContentScale.Fit
                                                )
                                                Spacer(modifier = Modifier.width(10.dp))
                                            }
                                            Column {
                                                Text(
                                                    businessName.ifBlank { "OmniPOS Enterprise" },
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 17.sp,
                                                    color = if (isDarkPaper) Color.White else Color(0xFF0F172A)
                                                )
                                                if (profile.tagline.isNotBlank()) {
                                                    Text(profile.tagline, fontSize = 11.sp, color = Color.Gray)
                                                }
                                                Text(businessAddress, fontSize = 11.sp, color = Color.Gray)
                                                Text("Tel: $businessPhone" + if (businessNtn.isNotBlank()) " | NTN: $businessNtn" else "", fontSize = 11.sp, color = Color.Gray)
                                            }
                                        }

                                        // Right: Tax Invoice Title & Metadata
                                        Column(horizontalAlignment = Alignment.End) {
                                            Surface(
                                                color = Color(0xFF0F766E),
                                                shape = RoundedCornerShape(4.dp)
                                            ) {
                                                Text(
                                                    "TAX INVOICE",
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 13.sp,
                                                    color = Color.White,
                                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                                )
                                            }
                                            Spacer(Modifier.height(4.dp))
                                            Text("Invoice #: ${order.id}", fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = if (isDarkPaper) Color.White else Color(0xFF0F172A))
                                            Text("Date: ${order.date}", fontSize = 11.sp, color = Color.Gray)
                                            Text(
                                                "Status: ${order.status.uppercase()} (${order.paymentMethod})",
                                                fontSize = 11.sp,
                                                color = if (order.dueAmount > 0.0 || order.total < 0) Color(0xFFC62828) else Color(0xFF16A34A),
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }

                                    HorizontalDivider(color = if (isDarkPaper) Color(0xFF334155) else Color(0xFFE2E8F0))

                                    // Billed To & Issuance Cards
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Surface(
                                            modifier = Modifier.weight(1f),
                                            color = if (isDarkPaper) Color(0xFF0F172A) else Color(0xFFF8FAFC),
                                            shape = RoundedCornerShape(6.dp),
                                            border = BorderStroke(1.dp, if (isDarkPaper) Color(0xFF334155) else Color(0xFFE2E8F0))
                                        ) {
                                            Column(modifier = Modifier.padding(10.dp)) {
                                                Text("BILLED TO / CUSTOMER", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                                                Spacer(Modifier.height(3.dp))
                                                Text(client?.name ?: "Walking Customer / Cash", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = if (isDarkPaper) Color.White else Color(0xFF0F172A))
                                                if (!client?.phone.isNullOrBlank()) Text("Phone: ${client?.phone}", fontSize = 11.sp, color = Color.Gray)
                                                if (!client?.address.isNullOrBlank()) Text("Address: ${client?.address}", fontSize = 11.sp, color = Color.Gray)
                                            }
                                        }

                                        Surface(
                                            modifier = Modifier.weight(1f),
                                            color = if (isDarkPaper) Color(0xFF0F172A) else Color(0xFFF8FAFC),
                                            shape = RoundedCornerShape(6.dp),
                                            border = BorderStroke(1.dp, if (isDarkPaper) Color(0xFF334155) else Color(0xFFE2E8F0))
                                        ) {
                                            Column(modifier = Modifier.padding(10.dp)) {
                                                Text("ISSUANCE & REGISTER", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                                                Spacer(Modifier.height(3.dp))
                                                Text("POS Register • ${order.orderMode}" + (if (order.tableOrRef.isNotBlank()) " (${order.tableOrRef})" else ""), fontWeight = FontWeight.Medium, fontSize = 12.sp, color = if (isDarkPaper) Color.White else Color(0xFF0F172A))
                                                Text("Cashier: ${order.cashierName.ifBlank { "Administrator" }}", fontSize = 11.sp, color = Color.Gray)
                                                Text("Payment: $paymentSummaryLabel", fontSize = 11.sp, color = Color.Gray)
                                                if (order.loyaltyEarned > 0) {
                                                    Text("Loyalty Earned: +${order.loyaltyEarned} pts", fontSize = 10.5.sp, color = Color(0xFF00897B), fontWeight = FontWeight.SemiBold)
                                                }
                                            }
                                        }
                                    }

                                    // Items Table
                                    Surface(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(6.dp),
                                        border = BorderStroke(1.dp, if (isDarkPaper) Color(0xFF334155) else Color(0xFFCBD5E1))
                                    ) {
                                        Column {
                                            // Table Header
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .background(if (isDarkPaper) Color(0xFF0F172A) else Color(0xFF0F172A))
                                                    .padding(horizontal = 8.dp, vertical = 6.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text("S#", modifier = Modifier.width(30.dp), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                Text("ITEM DESCRIPTION", modifier = Modifier.weight(1f), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                Text("QTY", modifier = Modifier.width(45.dp), textAlign = TextAlign.Center, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                Text("RATE", modifier = Modifier.width(65.dp), textAlign = TextAlign.End, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                                Text("TOTAL (RS)", modifier = Modifier.width(80.dp), textAlign = TextAlign.End, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }

                                            // Table Rows
                                            items.forEachIndexed { idx, item ->
                                                val isEven = idx % 2 == 0
                                                Row(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .background(
                                                            if (isDarkPaper) {
                                                                if (isEven) Color(0xFF1E293B) else Color(0xFF172033)
                                                            } else {
                                                                if (isEven) Color.White else Color(0xFFF8FAFC)
                                                            }
                                                        )
                                                        .padding(horizontal = 8.dp, vertical = 7.dp),
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    Text("${idx + 1}", modifier = Modifier.width(30.dp), fontSize = 11.sp, color = if (isDarkPaper) Color.White else Color(0xFF0F172A))
                                                    Text(item.name, modifier = Modifier.weight(1f), fontSize = 11.sp, fontWeight = FontWeight.Medium, color = if (isDarkPaper) Color.White else Color(0xFF0F172A))
                                                    Text("${item.quantity}", modifier = Modifier.width(45.dp), textAlign = TextAlign.Center, fontSize = 11.sp, color = if (isDarkPaper) Color.White else Color(0xFF0F172A))
                                                    Text(String.format("%.2f", item.price), modifier = Modifier.width(65.dp), textAlign = TextAlign.End, fontSize = 11.sp, color = Color.Gray)
                                                    Text(String.format("%.2f", item.price * item.quantity), modifier = Modifier.width(80.dp), textAlign = TextAlign.End, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = if (isDarkPaper) Color.White else Color(0xFF0F172A))
                                                }
                                                if (idx < items.lastIndex) {
                                                    HorizontalDivider(color = if (isDarkPaper) Color(0xFF334155) else Color(0xFFE2E8F0), thickness = 0.5.dp)
                                                }
                                            }
                                        }
                                    }

                                    // Totals & Terms
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.Top
                                    ) {
                                        // Left: Terms & Conditions
                                        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                                            Text("TERMS & CONDITIONS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                                            Spacer(Modifier.height(2.dp))
                                            Text("• Computer generated tax invoice. No signature required.", fontSize = 10.sp, color = Color.Gray)
                                            Text("• Goods received in proper sealed condition.", fontSize = 10.sp, color = Color.Gray)
                                            Text("• Warranty claims require original bill presentation.", fontSize = 10.sp, color = Color.Gray)
                                        }

                                        // Right: Totals Card
                                        Surface(
                                            modifier = Modifier.width(180.dp),
                                            color = if (isDarkPaper) Color(0xFF0F172A) else Color(0xFFF8FAFC),
                                            shape = RoundedCornerShape(6.dp),
                                            border = BorderStroke(1.dp, if (isDarkPaper) Color(0xFF334155) else Color(0xFFCBD5E1))
                                        ) {
                                            Column(modifier = Modifier.padding(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                    Text("Subtotal:", fontSize = 11.sp, color = Color.Gray)
                                                    Text(String.format("Rs %.2f", order.subtotal), fontSize = 11.sp, fontWeight = FontWeight.Medium)
                                                }
                                                if (order.discount > 0) {
                                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                        Text("Discount:", fontSize = 11.sp, color = Color(0xFFE11D48))
                                                        Text(String.format("-Rs %.2f", order.discount), fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Color(0xFFE11D48))
                                                    }
                                                }
                                                if (order.tax > 0) {
                                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                        Text("Sales Tax:", fontSize = 11.sp, color = Color.Gray)
                                                        Text(String.format("Rs %.2f", order.tax), fontSize = 11.sp, fontWeight = FontWeight.Medium)
                                                    }
                                                }
                                                HorizontalDivider(color = if (isDarkPaper) Color(0xFF334155) else Color(0xFFCBD5E1))
                                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                    Text("TOTAL:", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F766E))
                                                    Text(String.format("Rs %.2f", order.total), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F766E))
                                                }
                                            }
                                        }
                                    }

                                    Spacer(Modifier.height(10.dp))

                                    // Signatures Section
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Box(modifier = Modifier.width(130.dp).height(1.dp).background(Color.Gray))
                                            Spacer(Modifier.height(4.dp))
                                            Text("Authorized Signatory & Stamp", fontSize = 10.sp, color = Color.Gray)
                                        }
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Box(modifier = Modifier.width(130.dp).height(1.dp).background(Color.Gray))
                                            Spacer(Modifier.height(4.dp))
                                            Text("Customer Receiver Signature", fontSize = 10.sp, color = Color.Gray)
                                        }
                                    }

                                    // Footer text
                                    Text(
                                        "Computerized A4 Tax Invoice • Generated via OmniPOS Enterprise Suite • All Rights Reserved",
                                        fontSize = 9.sp,
                                        color = Color.Gray,
                                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    } else {
                        // -------------------------------------------------------------
                        // THERMAL RECEIPT VIEWPORT (80mm or 58mm POS Roll)
                        // -------------------------------------------------------------
                        val slipMaxWidth = if (selectedFormatMode == "80mm Thermal") 360.dp else 290.dp

                        Card(
                            modifier = Modifier
                                .widthIn(max = slipMaxWidth)
                                .fillMaxHeight()
                                .shadow(8.dp, RoundedCornerShape(6.dp)),
                            shape = RoundedCornerShape(6.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isDarkPaper) Color(0xFF1E293B) else Color.White
                            ),
                            border = BorderStroke(1.dp, if (isDarkPaper) Color(0xFF334155) else Color(0xFFCBD5E1))
                        ) {
                            if (viewMode == "Monospace Print") {
                                // Raw printable monospace receipt text
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .verticalScroll(rememberScrollState())
                                        .padding(12.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    if (profile.showLogoOnThermal && logoBitmap != null) {
                                        Image(
                                            bitmap = logoBitmap.asImageBitmap(),
                                            contentDescription = "Logo",
                                            modifier = Modifier.height(40.dp).padding(bottom = 6.dp),
                                            contentScale = ContentScale.Fit
                                        )
                                    }
                                    Text(
                                        text = thermalText,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = zoomFactor.sp,
                                        color = if (isDarkPaper) Color(0xFFF1F5F9) else Color(0xFF0F172A),
                                        lineHeight = (zoomFactor * 1.3f).sp
                                    )
                                }
                            } else {
                                // Realistic POS Thermal Paper Roll Slip
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .verticalScroll(rememberScrollState())
                                        .padding(14.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    // Top Serrated / Dashed Tear Edge
                                    Text(
                                        "- - - - - - - - - - - - - - - - - - - - - - - - - - - -",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 9.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )

                                    // Centered Logo
                                    if (profile.showLogoOnThermal && logoBitmap != null) {
                                        Image(
                                            bitmap = logoBitmap.asImageBitmap(),
                                            contentDescription = "Thermal Logo",
                                            modifier = Modifier.height(42.dp).padding(bottom = 4.dp),
                                            contentScale = ContentScale.Fit
                                        )
                                    }

                                    // Store Header
                                    Text(
                                        businessName.uppercase().ifBlank { "OMNIPOS ENTERPRISE" },
                                        fontWeight = FontWeight.Bold,
                                        fontSize = if (selectedFormatMode == "80mm Thermal") 15.sp else 13.sp,
                                        fontFamily = FontFamily.Monospace,
                                        textAlign = TextAlign.Center,
                                        color = if (isDarkPaper) Color.White else Color.Black
                                    )
                                    if (profile.tagline.isNotBlank()) {
                                        Text(profile.tagline, fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray, textAlign = TextAlign.Center)
                                    }
                                    if (businessAddress.isNotBlank()) {
                                        Text(businessAddress, fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray, textAlign = TextAlign.Center)
                                    }
                                    if (businessPhone.isNotBlank()) {
                                        Text("Tel: $businessPhone", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray, textAlign = TextAlign.Center)
                                    }

                                    // Divider
                                    Text(
                                        "------------------------------------------------",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 10.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )

                                    // Receipt Meta Information
                                    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            Text("Receipt #:", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                                            Text(order.id, fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                                        }
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            Text("Date & Time:", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                                            Text(order.date, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                        }
                                        if (!client?.name.isNullOrBlank() && client?.name != "Walking Customer / Cash") {
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text("Customer:", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                                                Text(client!!.name, fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Medium)
                                            }
                                        }
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            Text("Payment:", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                                            Text("Cash / Terminal", fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                        }
                                    }

                                    // Divider
                                    Text(
                                        "------------------------------------------------",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 10.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )

                                    // Columns Header
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("ITEM", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                                        Text("QTY", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                                        Text("AMOUNT", fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                                    }

                                    // Divider
                                    Text(
                                        "- - - - - - - - - - - - - - - - - - - - - - - -",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 9.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )

                                    // Line Items
                                    items.forEach { item ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                item.name,
                                                modifier = Modifier.weight(1f).padding(end = 4.dp),
                                                fontSize = 11.sp,
                                                fontFamily = FontFamily.Monospace,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Text(
                                                "${item.quantity}",
                                                modifier = Modifier.width(30.dp),
                                                textAlign = TextAlign.Center,
                                                fontSize = 11.sp,
                                                fontFamily = FontFamily.Monospace
                                            )
                                            Text(
                                                String.format("%.2f", item.price * item.quantity),
                                                modifier = Modifier.width(65.dp),
                                                textAlign = TextAlign.End,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        }
                                    }

                                    // Divider
                                    Text(
                                        "------------------------------------------------",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 10.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )

                                    // Totals breakdown
                                    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            Text("Subtotal:", fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                            Text(String.format("Rs %.2f", order.subtotal), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                        }
                                        if (order.discount > 0) {
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text("Discount:", fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = Color(0xFFE11D48))
                                                Text(String.format("-Rs %.2f", order.discount), fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = Color(0xFFE11D48))
                                            }
                                        }
                                        if (order.tax > 0) {
                                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text("Sales Tax / GST:", fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                                Text(String.format("Rs %.2f", order.tax), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                            }
                                        }
                                    }

                                    // Double Divider
                                    Text(
                                        "================================================",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 10.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )

                                    // Bold Grand Total
                                    Text(
                                        "*** TOTAL: Rs ${String.format("%.2f", order.total)} ***",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = if (isDarkPaper) Color.White else Color.Black,
                                        textAlign = TextAlign.Center
                                    )

                                    // Double Divider
                                    Text(
                                        "================================================",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 10.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )

                                    Spacer(Modifier.height(4.dp))

                                    // Barcode Graphic Simulation
                                    Text(
                                        "||| | ||||| | ||| |||| | |||",
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        letterSpacing = 1.sp,
                                        color = if (isDarkPaper) Color.White else Color.Black
                                    )
                                    Text("*${order.id}*", fontSize = 10.sp, fontFamily = FontFamily.Monospace)

                                    Spacer(Modifier.height(4.dp))
                                    Text("Thank you for your visit!", fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Medium)
                                    Text("*** Powered by OmniPOS ***", fontSize = 9.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)

                                    // Bottom Tear Edge
                                    Text(
                                        "- - - - - - - - - - - - - - - - - - - - - - - - - - - -",
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 9.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Clip
                                    )
                                }
                            }
                        }
                    }
                }

                // -------------------------------------------------------------
                // BOTTOM PRINT, SAVE TO GALLERY & SHARE CONTROLS
                // -------------------------------------------------------------
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.surface,
                    shadowElevation = 10.dp
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // ROW 1: PRINT & SAVE TO GALLERY
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Print Active Bill Format
                            Button(
                                onClick = {
                                    if (selectedFormatMode == "A4 Standard") {
                                        BluetoothThermalPrinterHelper.printA4ViaSystem(
                                            context = context,
                                            jobName = "OmniPOS_Invoice_${order.id}",
                                            documentTitle = "Invoice_${order.id}",
                                            contentText = a4Text,
                                            logoBitmap = logoBitmap,
                                            showLogo = profile.showLogoOnInvoice
                                        )
                                    } else {
                                        val printerAddress = BluetoothThermalPrinterHelper.getSavedPrinterAddress(context)
                                        if (printerAddress.isBlank()) {
                                            Toast.makeText(context, "No Bluetooth thermal printer paired. Spooling to system printer...", Toast.LENGTH_SHORT).show()
                                            BluetoothThermalPrinterHelper.printA4ViaSystem(
                                                context = context,
                                                jobName = "OmniPOS_Thermal_${order.id}",
                                                documentTitle = "ThermalReceipt_${order.id}",
                                                contentText = thermalText,
                                                logoBitmap = logoBitmap,
                                                showLogo = profile.showLogoOnThermal
                                            )
                                        } else {
                                            coroutineScope.launch(Dispatchers.IO) {
                                                val payload = BluetoothThermalPrinterHelper.buildPosReceiptPayload(
                                                    businessName = businessName,
                                                    tagline = profile.tagline.ifBlank { "Healthcare & Enterprise Solutions" },
                                                    address = businessAddress,
                                                    phone = businessPhone,
                                                    orderId = order.id,
                                                    dateStr = order.date,
                                                    items = items,
                                                    subtotal = order.subtotal,
                                                    discount = order.discount,
                                                    tax = order.tax,
                                                    total = order.total,
                                                    paymentMethod = paymentSummaryLabel,
                                                    footerNote = "Cashier: ${order.cashierName} • ${profile.receiptFooter.ifBlank { "Thank you!" }}",
                                                    logoBitmap = logoBitmap,
                                                    showLogo = profile.showLogoOnThermal,
                                                    threshold = profile.thermalDitherThreshold,
                                                    autoOpenDrawer = profile.autoKickDrawer
                                                )
                                                val (success, message) = BluetoothThermalPrinterHelper.printPayload(context, printerAddress, payload)
                                                withContext(Dispatchers.Main) {
                                                    if (success) {
                                                        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
                                                    } else {
                                                        Toast.makeText(context, message, Toast.LENGTH_LONG).show()
                                                        BluetoothThermalPrinterHelper.printA4ViaSystem(
                                                            context = context,
                                                            jobName = "OmniPOS_Thermal_${order.id}",
                                                            documentTitle = "ThermalReceipt_${order.id}",
                                                            contentText = thermalText,
                                                            logoBitmap = logoBitmap,
                                                            showLogo = profile.showLogoOnThermal
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                modifier = Modifier.weight(1.1f),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Print, null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text(
                                    if (selectedFormatMode == "A4 Standard") "Print A4" else "Thermal",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    maxLines = 1
                                )
                            }

                            // Print KOT / Packing Slip
                            OutlinedButton(
                                onClick = {
                                    val printerAddr = BluetoothThermalPrinterHelper.getSavedPrinterAddress(context)
                                    val mode = order.orderMode.ifBlank { "Counter" }
                                    val ref = order.tableOrRef
                                    if (printerAddr.isNotBlank()) {
                                        coroutineScope.launch(Dispatchers.IO) {
                                            val kotBytes = BluetoothThermalPrinterHelper.buildKotPayload(
                                                businessName = businessName,
                                                orderId = order.id,
                                                dateStr = order.date,
                                                orderMode = mode,
                                                tableOrRef = ref,
                                                cashierName = order.cashierName,
                                                items = items
                                            )
                                            val (ok, msg) = BluetoothThermalPrinterHelper.printPayload(context, printerAddr, kotBytes)
                                            withContext(Dispatchers.Main) {
                                                Toast.makeText(context, if (ok) "KOT / Packing Slip Printed!" else msg, Toast.LENGTH_SHORT).show()
                                            }
                                        }
                                    } else {
                                        val kotText = BluetoothThermalPrinterHelper.buildKotText(
                                            businessName = businessName,
                                            orderId = order.id,
                                            dateStr = order.date,
                                            orderMode = mode,
                                            tableOrRef = ref,
                                            cashierName = order.cashierName,
                                            items = items
                                        )
                                        BluetoothThermalPrinterHelper.printA4ViaSystem(
                                            context = context,
                                            jobName = "OmniPOS_KOT_${order.id}",
                                            documentTitle = "KOT_PackingSlip_${order.id}",
                                            contentText = kotText,
                                            logoBitmap = null,
                                            showLogo = false
                                        )
                                    }
                                },
                                modifier = Modifier.weight(0.95f),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Receipt, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("KOT Slip", fontWeight = FontWeight.Bold, fontSize = 11.5.sp, maxLines = 1)
                            }

                            // Save to Gallery
                            FilledTonalButton(
                                onClick = {
                                    coroutineScope.launch(Dispatchers.IO) {
                                        val bitmap = getActiveBillBitmap()
                                        val title = if (selectedFormatMode == "A4 Standard") "Invoice_${order.id}_A4" else "Receipt_${order.id}_Thermal"
                                        val uri = BluetoothThermalPrinterHelper.saveBillBitmapToGallery(context, bitmap, title)
                                        withContext(Dispatchers.Main) {
                                            if (uri != null) {
                                                Toast.makeText(context, "✅ Saved to Gallery! (Pictures/OmniPOS_Invoices)", Toast.LENGTH_LONG).show()
                                            } else {
                                                Toast.makeText(context, "Could not save image to gallery", Toast.LENGTH_SHORT).show()
                                            }
                                        }
                                    }
                                },
                                modifier = Modifier.weight(1.1f),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.PhotoLibrary, null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Save to Gallery", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                            }
                        }

                        // ROW 2: WHATSAPP DIRECT SHARE, GENERAL SHARE, COPY
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Direct WhatsApp Share (with official WhatsApp Green branding)
                            Button(
                                onClick = {
                                    coroutineScope.launch(Dispatchers.IO) {
                                        val bitmap = getActiveBillBitmap()
                                        withContext(Dispatchers.Main) {
                                            BluetoothThermalPrinterHelper.shareBillViaWhatsApp(
                                                context = context,
                                                bitmap = bitmap,
                                                orderId = order.id,
                                                summaryText = invoiceSummary
                                            )
                                        }
                                    }
                                },
                                modifier = Modifier.weight(1.3f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF25D366),
                                    contentColor = Color.White
                                ),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Send, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("WhatsApp", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }

                            // General System Share Sheet
                            OutlinedButton(
                                onClick = {
                                    coroutineScope.launch(Dispatchers.IO) {
                                        val bitmap = getActiveBillBitmap()
                                        withContext(Dispatchers.Main) {
                                            BluetoothThermalPrinterHelper.shareBillGeneral(
                                                context = context,
                                                bitmap = bitmap,
                                                orderId = order.id,
                                                summaryText = invoiceSummary
                                            )
                                        }
                                    }
                                },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Share, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Share", fontSize = 12.sp)
                            }

                            // Copy Invoice Text
                            OutlinedButton(
                                onClick = {
                                    val textToCopy = if (selectedFormatMode == "A4 Standard") a4Text else thermalText
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("Invoice Text", textToCopy))
                                    Toast.makeText(context, "Bill text copied to clipboard!", Toast.LENGTH_SHORT).show()
                                },
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.ContentCopy, null, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// POS TERMINAL TAB
// -------------------------------------------------------------
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PosTerminalSection(
    allProducts: List<PosProduct>,
    allClients: List<PosClient>,
    activeCart: SnapshotStateMap<String, Int>,
    parkedCount: Int,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onScanBarcodeClick: () -> Unit,
    onSearchBarcodeSubmit: (String) -> Unit,
    selectedCategory: String,
    onSelectCategory: (String) -> Unit,
    selectedClientId: String?,
    onSelectClient: (String?) -> Unit,
    onQuickAddCustomer: () -> Unit,
    redeemLoyaltyChecked: Boolean,
    onRedeemLoyaltyChange: (Boolean) -> Unit,
    isWholesaleMode: Boolean,
    onToggleWholesale: () -> Unit,
    orderMode: String,
    onOrderModeChange: (String) -> Unit,
    tableOrRef: String,
    onTableOrRefChange: (String) -> Unit,
    discountPercent: Double,
    onDiscountChange: (Double) -> Unit,
    taxPercent: Double,
    onTaxChange: (Double) -> Unit,
    paymentMethod: String,
    onPaymentMethodChange: (String) -> Unit,
    documentType: String,
    onDocumentTypeChange: (String) -> Unit,
    onAddToCart: (String) -> Unit,
    onRemoveFromCart: (String) -> Unit,
    onClearCart: () -> Unit,
    onHoldCurrentBill: () -> Unit,
    onOpenParkedBills: () -> Unit,
    onCheckout: () -> Unit
) {
    fun effectiveUnitPrice(prod: PosProduct): Double {
        return if (isWholesaleMode) {
            if (prod.wholesalePrice > 0.0) prod.wholesalePrice else prod.price * 0.85
        } else {
            prod.price
        }
    }

    val categories = remember(allProducts) {
        listOf("All") + allProducts.map { it.category }.distinct()
    }

    val filteredProducts = remember(allProducts, searchQuery, selectedCategory) {
        allProducts.filter { prod ->
            val matchCat = selectedCategory == "All" || prod.category.equals(selectedCategory, ignoreCase = true)
            val matchSearch = searchQuery.isBlank() ||
                prod.name.contains(searchQuery, ignoreCase = true) ||
                prod.id.contains(searchQuery, ignoreCase = true) ||
                prod.sku.contains(searchQuery, ignoreCase = true) ||
                prod.barcode.contains(searchQuery, ignoreCase = true)
            matchCat && matchSearch
        }
    }

    val cartItemsList = activeCart.mapNotNull { (prodId, qty) ->
        val prod = allProducts.firstOrNull { it.id == prodId }
            ?: PosProduct(
                id = prodId,
                name = "Item $prodId",
                category = "General",
                price = 0.0,
                stock = 100,
                unit = "Unit"
            )
        prod to qty
    }

    val subtotal = cartItemsList.sumOf { (prod, qty) -> effectiveUnitPrice(prod) * qty }
    val discountAmt = subtotal * (discountPercent / 100.0)
    val taxAmt = (subtotal - discountAmt) * (taxPercent / 100.0)
    val grandTotal = (subtotal - discountAmt) + taxAmt

    Row(modifier = Modifier.fillMaxSize()) {
        // Left Column: Catalog & Items Grid
        Column(
            modifier = Modifier
                .weight(1.1f)
                .fillMaxHeight()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Search & Instant Camera Barcode Scan Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchQueryChange,
                    placeholder = {
                        Text(
                            "Search name, SKU or barcode...",
                            fontSize = 11.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    leadingIcon = { Icon(Icons.Default.Search, null, modifier = Modifier.size(18.dp)) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { onSearchQueryChange("") }) {
                                Icon(Icons.Default.Clear, null, modifier = Modifier.size(16.dp))
                            }
                        }
                    },
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = { onSearchBarcodeSubmit(searchQuery) }),
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                )

                FilledTonalIconButton(
                    onClick = onScanBarcodeClick,
                    modifier = Modifier.size(48.dp),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan Barcode", tint = MaterialTheme.colorScheme.primary)
                }
            }

            // Category Chips
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(categories) { cat ->
                    val isSelected = selectedCategory == cat
                    FilterChip(
                        selected = isSelected,
                        onClick = { onSelectCategory(cat) },
                        label = { Text(cat, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) }
                    )
                }
            }

            // Products Grid
            if (filteredProducts.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Inventory2, null, modifier = Modifier.size(48.dp), tint = Color.Gray)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("No products found in category", color = Color.Gray, fontSize = 13.sp)
                    }
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 140.dp),
                    modifier = Modifier.weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filteredProducts) { prod ->
                        val inCartCount = activeCart[prod.id] ?: 0
                        val isOutOfStock = prod.stock <= 0
                        val isLowStock = !isOutOfStock && prod.stock <= prod.minStockAlert
                        Card(
                            onClick = { onAddToCart(prod.id) },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = when {
                                    isOutOfStock -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.25f)
                                    inCartCount > 0 -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                                    else -> MaterialTheme.colorScheme.surface
                                }
                            ),
                            border = BorderStroke(
                                width = if (inCartCount > 0) 1.5.dp else 1.dp,
                                color = when {
                                    isOutOfStock -> MaterialTheme.colorScheme.error.copy(alpha = 0.5f)
                                    inCartCount > 0 -> MaterialTheme.colorScheme.primary
                                    else -> MaterialTheme.colorScheme.outlineVariant
                                }
                            )
                        ) {
                            Column(
                                modifier = Modifier.padding(10.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        color = MaterialTheme.colorScheme.surfaceVariant,
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            prod.category,
                                            fontSize = 9.sp,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    if (inCartCount > 0) {
                                        Surface(
                                            color = MaterialTheme.colorScheme.primary,
                                            shape = CircleShape
                                        ) {
                                            Text(
                                                "$inCartCount",
                                                color = Color.White,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 10.sp,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                }

                                Text(
                                    prod.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )

                                if (prod.sku.isNotBlank()) {
                                    Text(prod.sku, fontSize = 9.sp, color = Color.Gray, maxLines = 1)
                                }

                                val expStatus = prod.expiryStatusCode()
                                if (expStatus > 0) {
                                    Surface(
                                        color = if (expStatus == 2) Color(0xFFFFEBEE) else Color(0xFFFFF3E0),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            if (expStatus == 2) "EXPIRED" else "EXP SOON",
                                            fontSize = 8.5.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (expStatus == 2) Color(0xFFC62828) else Color(0xFFE65100),
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.weight(1f))

                                val displayPrice = effectiveUnitPrice(prod)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        "Rs ${displayPrice.toInt()}" + (if (isWholesaleMode) " W" else ""),
                                        fontWeight = FontWeight.Bold,
                                        color = if (isWholesaleMode) Color(0xFF00897B) else MaterialTheme.colorScheme.primary,
                                        fontSize = 13.sp
                                    )
                                    Text(
                                        when {
                                            isOutOfStock -> "OUT"
                                            isLowStock -> "Low: ${prod.stock}"
                                            else -> "Qty: ${prod.stock}"
                                        },
                                        fontSize = 10.sp,
                                        fontWeight = if (isOutOfStock || isLowStock) FontWeight.Bold else FontWeight.Normal,
                                        color = when {
                                            isOutOfStock -> Color(0xFFD32F2F)
                                            isLowStock -> Color(0xFFE65100)
                                            else -> Color.Gray
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Right Column: Real-time Live Cart & Billing Summary
        Surface(
            modifier = Modifier
                .weight(0.9f)
                .fillMaxHeight(),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
            shadowElevation = 2.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(10.dp),
                verticalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                // Cart Header + Wholesale Mode Switch + Hold / Parked Bills
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            "Cart (${activeCart.values.sum()})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Surface(
                            onClick = onToggleWholesale,
                            color = if (isWholesaleMode) Color(0xFF00897B) else MaterialTheme.colorScheme.surface,
                            shape = RoundedCornerShape(6.dp),
                            border = BorderStroke(1.dp, if (isWholesaleMode) Color(0xFF00897B) else MaterialTheme.colorScheme.outlineVariant)
                        ) {
                            Text(
                                if (isWholesaleMode) "Wholesale" else "Retail",
                                fontSize = 9.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isWholesaleMode) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                        IconButton(
                            onClick = onOpenParkedBills,
                            modifier = Modifier.size(30.dp)
                        ) {
                            BadgedBox(
                                badge = {
                                    if (parkedCount > 0) {
                                        Badge { Text("$parkedCount", fontSize = 9.sp) }
                                    }
                                }
                            ) {
                                Icon(Icons.Default.PendingActions, contentDescription = "Held Bills", modifier = Modifier.size(18.dp))
                            }
                        }
                        if (activeCart.isNotEmpty()) {
                            IconButton(
                                onClick = onHoldCurrentBill,
                                modifier = Modifier.size(30.dp)
                            ) {
                                Icon(Icons.Default.PauseCircle, contentDescription = "Park Bill", tint = Color(0xFFE65100), modifier = Modifier.size(18.dp))
                            }
                            IconButton(
                                onClick = onClearCart,
                                modifier = Modifier.size(30.dp)
                            ) {
                                Icon(Icons.Default.DeleteSweep, contentDescription = "Clear Cart", tint = Color.Red, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }

                // Order Mode Selector (Counter | Table/Ward | Delivery)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    items(listOf("Counter", "Table / Ward", "Delivery")) { mode ->
                        val active = orderMode == mode
                        Surface(
                            onClick = { onOrderModeChange(mode) },
                            color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                            shape = RoundedCornerShape(6.dp),
                            border = BorderStroke(1.dp, if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant)
                        ) {
                            Text(
                                mode,
                                fontSize = 9.5.sp,
                                fontWeight = if (active) FontWeight.Bold else FontWeight.Medium,
                                color = if (active) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                            )
                        }
                    }
                }
                if (orderMode != "Counter") {
                    OutlinedTextField(
                        value = tableOrRef,
                        onValueChange = onTableOrRefChange,
                        placeholder = { Text(if (orderMode.contains("Table")) "Table # / Ward / Bed..." else "Delivery Address / Rider...", fontSize = 10.sp) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Customer Selection + Quick Khata / Loyalty Readout
                var clientDropdownExpanded by remember { mutableStateOf(false) }
                val customerClients = remember(allClients) { allClients.filter { it.type.equals("Customer", true) } }
                val currentClient = customerClients.firstOrNull { it.id == selectedClientId }

                OutlinedCard(
                    onClick = { clientDropdownExpanded = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Bill To Customer:", fontSize = 9.5.sp, color = Color.Gray)
                            Text(
                                currentClient?.name ?: "Walking Customer / Cash",
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            if (currentClient != null && (currentClient.creditBalance > 0.0 || currentClient.loyaltyPoints > 0)) {
                                Text(
                                    "Due: Rs ${currentClient.creditBalance.toInt()} • ${currentClient.loyaltyPoints} pts",
                                    fontSize = 9.5.sp,
                                    color = if (currentClient.creditBalance > 0.0) Color(0xFFC62828) else Color(0xFF00897B),
                                    fontWeight = FontWeight.SemiBold,
                                    maxLines = 1
                                )
                            }
                        }
                        IconButton(onClick = onQuickAddCustomer, modifier = Modifier.size(26.dp)) {
                            Icon(Icons.Default.PersonAdd, contentDescription = "New Customer", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                        }
                        Icon(Icons.Default.ArrowDropDown, null, modifier = Modifier.size(18.dp))
                    }
                    DropdownMenu(
                        expanded = clientDropdownExpanded,
                        onDismissRequest = { clientDropdownExpanded = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("+ Add New Customer", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) },
                            leadingIcon = { Icon(Icons.Default.PersonAdd, null, tint = MaterialTheme.colorScheme.primary) },
                            onClick = {
                                clientDropdownExpanded = false
                                onQuickAddCustomer()
                            }
                        )
                        HorizontalDivider()
                        DropdownMenuItem(
                            text = { Text("Walking Customer / Cash") },
                            onClick = {
                                onSelectClient(null)
                                clientDropdownExpanded = false
                            }
                        )
                        customerClients.forEach { client ->
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        "${client.name}" +
                                            (if (client.creditBalance > 0) " • Due Rs ${client.creditBalance.toInt()}" else "")
                                    )
                                },
                                onClick = {
                                    onSelectClient(client.id)
                                    clientDropdownExpanded = false
                                }
                            )
                        }
                    }
                }
                if (currentClient != null && currentClient.loyaltyPoints >= 10 && cartItemsList.isNotEmpty()) {
                    val redeemablePts = minOf(currentClient.loyaltyPoints, (grandTotal / 2.0).toInt())
                    Surface(
                        onClick = { onRedeemLoyaltyChange(!redeemLoyaltyChecked) },
                        color = if (redeemLoyaltyChecked) Color(0xFFE0F2F1) else MaterialTheme.colorScheme.surface,
                        shape = RoundedCornerShape(6.dp),
                        border = BorderStroke(1.dp, if (redeemLoyaltyChecked) Color(0xFF00897B) else MaterialTheme.colorScheme.outlineVariant),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                if (redeemLoyaltyChecked) "✓ Redeeming $redeemablePts pts" else "Redeem $redeemablePts pts (-Rs $redeemablePts)",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF00695C)
                            )
                            Text(
                                if (redeemLoyaltyChecked) "-Rs $redeemablePts" else "Apply",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF00897B)
                            )
                        }
                    }
                }

                // Cart Items List
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    if (cartItemsList.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("Cart is empty\nTap items or scan barcode", textAlign = TextAlign.Center, color = Color.Gray, fontSize = 11.5.sp)
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize().padding(6.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            items(cartItemsList) { (prod, qty) ->
                                val unitPrice = effectiveUnitPrice(prod)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                                        .padding(6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f).padding(end = 4.dp)) {
                                        Text(prod.name, fontWeight = FontWeight.SemiBold, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        Text("Rs ${unitPrice.toInt()} × $qty = Rs ${(unitPrice * qty).toInt()}", fontSize = 10.sp, color = MaterialTheme.colorScheme.primary)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        IconButton(onClick = { onRemoveFromCart(prod.id) }, modifier = Modifier.size(24.dp)) {
                                            Icon(Icons.Default.Remove, null, modifier = Modifier.size(14.dp))
                                        }
                                        Text("$qty", fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 4.dp))
                                        IconButton(onClick = { onAddToCart(prod.id) }, modifier = Modifier.size(24.dp)) {
                                            Icon(Icons.Default.Add, null, modifier = Modifier.size(14.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Discount & Tax quick toggles
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(
                        value = if (discountPercent == 0.0) "" else "${discountPercent.toInt()}",
                        onValueChange = { onDiscountChange((it.toDoubleOrNull() ?: 0.0).coerceIn(0.0, 100.0)) },
                        label = { Text("Disc %", fontSize = 10.sp) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = if (taxPercent == 0.0) "" else "${taxPercent.toInt()}",
                        onValueChange = { onTaxChange((it.toDoubleOrNull() ?: 0.0).coerceIn(0.0, 100.0)) },
                        label = { Text("Tax %", fontSize = 10.sp) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                }

                // Totals Breakdown
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f))
                ) {
                    Column(modifier = Modifier.padding(8.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subtotal", fontSize = 11.sp)
                            Text("Rs ${String.format("%.2f", subtotal)}", fontSize = 11.sp, fontWeight = FontWeight.Medium)
                        }
                        if (discountAmt > 0) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Discount", fontSize = 11.sp, color = Color(0xFF2E7D32))
                                Text("-Rs ${String.format("%.2f", discountAmt)}", fontSize = 11.sp, color = Color(0xFF2E7D32))
                            }
                        }
                        if (taxAmt > 0) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Tax / GST", fontSize = 11.sp)
                                Text("+Rs ${String.format("%.2f", taxAmt)}", fontSize = 11.sp)
                            }
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 2.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("TOTAL", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text(
                                "Rs ${String.format("%.2f", grandTotal)}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.primary,
                                maxLines = 1
                            )
                        }
                    }
                }

                // Instant Checkout Button -> Opens Payment / Split Tender / Change Dialog
                val totalQtyInCart = cartItemsList.sumOf { it.second }
                Button(
                    onClick = onCheckout,
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    shape = RoundedCornerShape(10.dp),
                    enabled = cartItemsList.isNotEmpty()
                ) {
                    Icon(Icons.Default.Payments, null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        if (totalQtyInCart > 0) "Pay & Bill ($totalQtyInCart)" else "Checkout",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        maxLines = 1
                    )
                }
            }
        }
    }
}

// -------------------------------------------------------------
// INVOICES & RECEIPTS LEDGER TAB
// -------------------------------------------------------------
@Composable
fun PosInvoicesLedgerSection(
    allOrders: List<PosOrder>,
    allClients: List<PosClient>,
    allKhataTx: List<PosKhataTransaction>,
    allPosExpenses: List<PosExpense>,
    viewModel: StudentKitViewModel,
    onOpenFullscreenInvoice: (PosOrder, List<PosOrderItem>, PosClient?) -> Unit,
    onOpenReturnDialog: (PosOrder, List<PosOrderItem>) -> Unit,
    onCreateCustomInvoice: () -> Unit,
    onAddClient: (String) -> Unit,
    onEditClient: (PosClient) -> Unit,
    onSettleKhata: (PosClient) -> Unit,
    onViewClientHistory: (PosClient) -> Unit,
    onAddExpense: () -> Unit,
    onDeleteExpense: (String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    var subMode by remember { mutableIntStateOf(0) } // 0: All Bills, 1: Customers & Khata, 2: Store Expenses
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilterType by remember { mutableStateOf("All") }

    val filteredOrders = remember(allOrders, searchQuery, selectedFilterType) {
        allOrders.filter { order ->
            val matchType = selectedFilterType == "All" || order.documentType.equals(selectedFilterType, ignoreCase = true)
            val matchSearch = searchQuery.isBlank() ||
                order.id.contains(searchQuery, ignoreCase = true) ||
                order.date.contains(searchQuery, ignoreCase = true) ||
                order.paymentMethod.contains(searchQuery, ignoreCase = true)
            matchType && matchSearch
        }
    }

    val customersOnly = remember(allClients) { allClients.filter { it.type.equals("Customer", true) } }
    val totalReceivables = remember(customersOnly) { customersOnly.sumOf { it.creditBalance } }
    val totalExpensesOnly = remember(allPosExpenses) {
        allPosExpenses.filter { !it.category.equals("Cash In Top-up", true) }.sumOf { it.amount }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Pack B Segmented Switcher: Bills | Customers & Khata | Store Expenses
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            val subTabs = listOf(
                0 to "All Bills (${allOrders.size})",
                1 to "Customers & Khata (${customersOnly.size})",
                2 to "Store Expenses (${allPosExpenses.size})"
            )
            items(subTabs) { (idx, label) ->
                FilterChip(
                    selected = subMode == idx,
                    onClick = { subMode = idx },
                    label = { Text(label, fontSize = 11.5.sp, fontWeight = if (subMode == idx) FontWeight.Bold else FontWeight.Normal) }
                )
            }
        }

        if (subMode == 1) {
            PosCustomersKhataSubSection(
                context = context,
                customers = customersOnly,
                totalReceivables = totalReceivables,
                onAddCustomer = { onAddClient("Customer") },
                onEditCustomer = onEditClient,
                onSettleKhata = onSettleKhata,
                onViewHistory = onViewClientHistory,
                onDeleteClient = { viewModel.deletePosClientById(it) }
            )
            return@PosInvoicesLedgerSection
        }

        if (subMode == 2) {
            PosExpensesSubSection(
                expenses = allPosExpenses,
                totalExpenses = totalExpensesOnly,
                onAddExpense = onAddExpense,
                onDeleteExpense = onDeleteExpense
            )
            return@PosInvoicesLedgerSection
        }

        // Top Filter & Search Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search invoice #, date, method...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f)
            )

            Button(
                onClick = onCreateCustomInvoice,
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("New Bill", fontSize = 12.sp)
            }
        }

        // Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(listOf("All", "Invoice", "Receipt", "Estimate", "Credit Note")) { type ->
                val isSelected = selectedFilterType == type
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedFilterType = type },
                    label = { Text(type, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) }
                )
            }
        }

        // Invoices List
        if (filteredOrders.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.ReceiptLong, null, modifier = Modifier.size(54.dp), tint = Color.Gray)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("No billing records found", color = Color.Gray, fontSize = 14.sp)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredOrders) { order ->
                    val matchedClient = allClients.firstOrNull { it.id == order.clientId }
                    val canReturn = order.documentType != "Estimate" &&
                        order.documentType != "Credit Note" &&
                        order.status != "Returned"
                    val statusColor = when (order.status) {
                        "Paid" -> Color(0xFF2E7D32)
                        "Partial", "Partial Return" -> Color(0xFFE65100)
                        "Returned", "Refunded", "Unpaid" -> Color(0xFFC62828)
                        else -> MaterialTheme.colorScheme.primary
                    }

                    Card(
                        onClick = {
                            coroutineScope.launch {
                                val items = viewModel.getPosOrderItems(order.id).first()
                                onOpenFullscreenInvoice(order, items, matchedClient)
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(order.id, fontWeight = FontWeight.Bold, fontSize = 13.5.sp)
                                    Surface(
                                        color = MaterialTheme.colorScheme.primaryContainer,
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            order.documentType,
                                            fontSize = 9.5.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }
                                    Surface(
                                        color = statusColor.copy(alpha = 0.14f),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            order.status,
                                            fontSize = 9.5.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = statusColor,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Text(
                                    matchedClient?.name ?: "Walking Customer / Cash",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                val modeTag = if (!order.orderMode.equals("Counter", true) || order.tableOrRef.isNotBlank()) {
                                    " • ${order.orderMode}" + (if (order.tableOrRef.isNotBlank()) " (${order.tableOrRef})" else "")
                                } else ""
                                Text("${order.date} • ${order.paymentMethod}$modeTag", fontSize = 10.sp, color = Color.Gray)
                                if (order.dueAmount > 0.0) {
                                    Text("Due: Rs ${String.format("%.2f", order.dueAmount)}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFFC62828))
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    "Rs ${String.format("%.2f", order.total)}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.5.sp,
                                    color = if (order.total < 0) Color(0xFFC62828) else MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    if (canReturn) {
                                        FilledTonalIconButton(
                                            onClick = {
                                                coroutineScope.launch {
                                                    val items = viewModel.getPosOrderItems(order.id).first()
                                                    onOpenReturnDialog(order, items)
                                                }
                                            },
                                            modifier = Modifier.size(30.dp)
                                        ) {
                                            Icon(Icons.Default.AssignmentReturn, contentDescription = "Return/Refund", modifier = Modifier.size(16.dp), tint = Color(0xFFE65100))
                                        }
                                    }
                                    FilledTonalIconButton(
                                        onClick = {
                                            coroutineScope.launch {
                                                val items = viewModel.getPosOrderItems(order.id).first()
                                                onOpenFullscreenInvoice(order, items, matchedClient)
                                            }
                                        },
                                        modifier = Modifier.size(30.dp)
                                    ) {
                                        Icon(Icons.Default.Fullscreen, contentDescription = "View Receipt", modifier = Modifier.size(16.dp))
                                    }
                                    IconButton(
                                        onClick = {
                                            viewModel.deletePosOrderById(order.id)
                                            Toast.makeText(context, "Order ${order.id} deleted", Toast.LENGTH_SHORT).show()
                                        },
                                        modifier = Modifier.size(30.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, null, tint = Color.Red.copy(alpha = 0.7f), modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// INVENTORY & STOCK MANAGEMENT TAB
// -------------------------------------------------------------
@Composable
fun PosInventorySection(
    allProducts: List<PosProduct>,
    allSuppliers: List<PosClient>,
    allPurchaseOrders: List<PosPurchaseOrder>,
    onAddProduct: () -> Unit,
    onEditProduct: (PosProduct) -> Unit,
    onQuickRestock: (String, Int) -> Unit,
    onDeleteProduct: (String) -> Unit,
    onAddSupplier: () -> Unit,
    onOpenReceiveGrn: () -> Unit,
    onPaySupplier: (PosClient) -> Unit,
    onViewSupplierHistory: (PosClient) -> Unit,
    onPrintBarcodeTags: (List<PosProduct>) -> Unit
) {
    var invSubTab by remember { mutableIntStateOf(0) } // 0: Catalog & Stock, 1: Suppliers & GRN Stock-In
    var searchQuery by remember { mutableStateOf("") }
    var stockFilter by remember { mutableStateOf("All") }

    val filteredProducts = remember(allProducts, searchQuery, stockFilter) {
        allProducts.filter { prod ->
            val matchSearch = searchQuery.isBlank() ||
                prod.name.contains(searchQuery, ignoreCase = true) ||
                prod.category.contains(searchQuery, ignoreCase = true) ||
                prod.sku.contains(searchQuery, ignoreCase = true) ||
                prod.barcode.contains(searchQuery, ignoreCase = true) ||
                prod.batchNumber.contains(searchQuery, ignoreCase = true)
            val expCode = prod.expiryStatusCode()
            val matchFilter = when (stockFilter) {
                "Low Stock" -> prod.stock in 1..prod.minStockAlert
                "Out of Stock" -> prod.stock <= 0
                "Near Expiry" -> expCode == 1
                "Expired" -> expCode == 2
                else -> true
            }
            matchSearch && matchFilter
        }
    }

    val lowCount = remember(allProducts) { allProducts.count { it.stock in 1..it.minStockAlert } }
    val outCount = remember(allProducts) { allProducts.count { it.stock <= 0 } }
    val expSoonCount = remember(allProducts) { allProducts.count { it.expiryStatusCode() == 1 } }
    val expiredCount = remember(allProducts) { allProducts.count { it.expiryStatusCode() == 2 } }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = invSubTab == 0,
                onClick = { invSubTab = 0 },
                label = { Text("Catalog & Stock (${allProducts.size})", fontSize = 11.5.sp, fontWeight = if (invSubTab == 0) FontWeight.Bold else FontWeight.Normal) }
            )
            FilterChip(
                selected = invSubTab == 1,
                onClick = { invSubTab = 1 },
                label = { Text("Suppliers & GRN (${allPurchaseOrders.size})", fontSize = 11.5.sp, fontWeight = if (invSubTab == 1) FontWeight.Bold else FontWeight.Normal) }
            )
        }

        if (invSubTab == 1) {
            PosSuppliersGrnSubSection(
                suppliers = allSuppliers,
                purchaseOrders = allPurchaseOrders,
                onAddSupplier = onAddSupplier,
                onOpenReceiveGrn = onOpenReceiveGrn,
                onPaySupplier = onPaySupplier,
                onViewHistory = onViewSupplierHistory
            )
            return@PosInventorySection
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search name, SKU, batch...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f)
            )

            FilledTonalIconButton(
                onClick = { onPrintBarcodeTags(filteredProducts) },
                modifier = Modifier.size(44.dp),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Label, contentDescription = "Print Barcode Price-Tag PDF", tint = MaterialTheme.colorScheme.primary)
            }

            Button(onClick = onAddProduct, shape = RoundedCornerShape(10.dp)) {
                Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(3.dp))
                Text("Add", fontSize = 12.sp)
            }
        }

        // Stock & Expiry Health Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            val filters = listOf(
                "All" to "All (${allProducts.size})",
                "Low Stock" to "Low ($lowCount)",
                "Out of Stock" to "Out ($outCount)",
                "Near Expiry" to "Expiring ($expSoonCount)",
                "Expired" to "Expired ($expiredCount)"
            )
            items(filters) { (key, label) ->
                FilterChip(
                    selected = stockFilter == key,
                    onClick = { stockFilter = key },
                    label = { Text(label, fontSize = 11.sp, fontWeight = if (stockFilter == key) FontWeight.Bold else FontWeight.Normal) }
                )
            }
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filteredProducts) { prod ->
                val isOut = prod.stock <= 0
                val isLow = !isOut && prod.stock <= prod.minStockAlert
                val expCode = prod.expiryStatusCode()
                val marginPct = if (prod.price > 0.0 && prod.costPrice > 0.0) {
                    ((prod.price - prod.costPrice) / prod.price) * 100.0
                } else 0.0

                Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                            Text(prod.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(
                                "${prod.category} • ${prod.unit}" +
                                    (if (prod.sku.isNotBlank()) " • ${prod.sku}" else "") +
                                    (if (prod.batchNumber.isNotBlank()) " • B:${prod.batchNumber}" else ""),
                                fontSize = 10.5.sp,
                                color = Color.Gray,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                buildString {
                                    append(if (prod.costPrice > 0.0) "Cost: Rs ${prod.costPrice.toInt()} (${String.format("%.0f", marginPct)}%)" else "Retail")
                                    if (prod.wholesalePrice > 0.0) append(" • W/S: Rs ${prod.wholesalePrice.toInt()}")
                                    if (prod.expiryDate.isNotBlank()) append(" • Exp: ${prod.expiryDate}")
                                },
                                fontSize = 10.sp,
                                color = when (expCode) {
                                    2 -> Color(0xFFC62828)
                                    1 -> Color(0xFFE65100)
                                    else -> if (prod.costPrice > 0.0) Color(0xFF2E7D32) else Color.Gray
                                },
                                fontWeight = if (expCode > 0) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Rs ${prod.price.toInt()}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
                            Text(
                                when {
                                    isOut -> "OUT OF STOCK"
                                    isLow -> "LOW: ${prod.stock} ${prod.unit}"
                                    else -> "Stock: ${prod.stock}"
                                },
                                fontSize = 10.5.sp,
                                fontWeight = if (isOut || isLow) FontWeight.Bold else FontWeight.Normal,
                                color = when {
                                    isOut -> Color(0xFFC62828)
                                    isLow -> Color(0xFFE65100)
                                    else -> Color.DarkGray
                                }
                            )
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(2.dp), verticalAlignment = Alignment.CenterVertically) {
                            FilledTonalButton(
                                onClick = { onQuickRestock(prod.id, 10) },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text("+10", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            IconButton(onClick = { onPrintBarcodeTags(listOf(prod)) }, modifier = Modifier.size(30.dp)) {
                                Icon(Icons.Default.Label, contentDescription = "Print Price Tag", tint = Color(0xFF00897B), modifier = Modifier.size(16.dp))
                            }
                            IconButton(onClick = { onEditProduct(prod) }, modifier = Modifier.size(30.dp)) {
                                Icon(Icons.Default.Edit, contentDescription = "Edit Item", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                            }
                            IconButton(onClick = { onDeleteProduct(prod.id) }, modifier = Modifier.size(30.dp)) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete Item", tint = Color.Red.copy(alpha = 0.7f), modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// ADD / EDIT PRODUCT DIALOG (Cost Price, Wholesale, Batch, Expiry, Barcode, SKU)
// -------------------------------------------------------------
@Composable
fun PosProductEditorDialog(
    existingProduct: PosProduct? = null,
    initialBarcode: String = "",
    onScanBarcode: ((String) -> Unit) -> Unit,
    onDismiss: () -> Unit,
    onConfirm: (PosProduct) -> Unit
) {
    var name by remember { mutableStateOf(existingProduct?.name ?: "") }
    var category by remember { mutableStateOf(existingProduct?.category ?: "Pharmacy") }
    var priceStr by remember { mutableStateOf(existingProduct?.let { if (it.price > 0) it.price.toInt().toString() else "" } ?: "") }
    var costStr by remember { mutableStateOf(existingProduct?.let { if (it.costPrice > 0) it.costPrice.toInt().toString() else "" } ?: "") }
    var wholesaleStr by remember { mutableStateOf(existingProduct?.let { if (it.wholesalePrice > 0) it.wholesalePrice.toInt().toString() else "" } ?: "") }
    var stockStr by remember { mutableStateOf(existingProduct?.stock?.toString() ?: "50") }
    var minAlertStr by remember { mutableStateOf(existingProduct?.minStockAlert?.toString() ?: "10") }
    var unit by remember { mutableStateOf(existingProduct?.unit ?: "Piece") }
    var sku by remember { mutableStateOf(existingProduct?.sku ?: "") }
    var barcode by remember { mutableStateOf(existingProduct?.barcode?.ifBlank { initialBarcode } ?: initialBarcode) }
    var batchNumber by remember { mutableStateOf(existingProduct?.batchNumber ?: "") }
    var expiryDate by remember { mutableStateOf(existingProduct?.expiryDate ?: "") }

    val saleVal = priceStr.toDoubleOrNull() ?: 0.0
    val costVal = costStr.toDoubleOrNull() ?: 0.0
    val profit = saleVal - costVal
    val marginPct = if (saleVal > 0 && costVal > 0) (profit / saleVal) * 100.0 else 0.0

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (existingProduct != null) "Edit Catalog Item" else "Add Catalog Item", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth().heightIn(max = 460.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Item Name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Category") }, singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = unit, onValueChange = { unit = it }, label = { Text("Unit") }, singleLine = true, modifier = Modifier.weight(0.8f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(value = priceStr, onValueChange = { priceStr = it }, label = { Text("Retail (Rs)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = wholesaleStr, onValueChange = { wholesaleStr = it }, label = { Text("Wholesale (Rs)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = costStr, onValueChange = { costStr = it }, label = { Text("Cost (Rs)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                }
                if (saleVal > 0 && costVal > 0) {
                    Surface(
                        color = if (profit >= 0) Color(0xFFE8F5E9) else Color(0xFFFFEBEE),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            "Profit/Unit: Rs ${String.format("%.2f", profit)} (${String.format("%.1f", marginPct)}% Margin)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (profit >= 0) Color(0xFF2E7D32) else Color(0xFFC62828),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(value = stockStr, onValueChange = { stockStr = it }, label = { Text("Stock Qty") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = minAlertStr, onValueChange = { minAlertStr = it }, label = { Text("Low Alert") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(value = batchNumber, onValueChange = { batchNumber = it }, label = { Text("Batch / Lot #") }, singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = expiryDate, onValueChange = { expiryDate = it }, label = { Text("Expiry (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.weight(1.2f))
                }
                OutlinedTextField(
                    value = sku,
                    onValueChange = { sku = it },
                    label = { Text("SKU Code (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = barcode,
                        onValueChange = { barcode = it },
                        label = { Text("Barcode / EAN-13") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    FilledTonalIconButton(
                        onClick = { onScanBarcode { code -> barcode = code } },
                        modifier = Modifier.size(44.dp)
                    ) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan Barcode")
                    }
                    FilledTonalIconButton(
                        onClick = {
                            barcode = "8964" + (100000000L + (System.currentTimeMillis() % 899999999L)).toString()
                            if (sku.isBlank()) sku = "SKU-${System.currentTimeMillis() % 10000}"
                        },
                        modifier = Modifier.size(44.dp)
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = "Auto Generate")
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        val product = PosProduct(
                            id = existingProduct?.id ?: "prod_${System.currentTimeMillis() % 100000}",
                            name = name.trim(),
                            category = category.trim().ifBlank { "General" },
                            price = priceStr.toDoubleOrNull() ?: 100.0,
                            stock = stockStr.toIntOrNull() ?: 10,
                            unit = unit.trim().ifBlank { "Piece" },
                            costPrice = costStr.toDoubleOrNull() ?: 0.0,
                            sku = sku.trim(),
                            barcode = barcode.trim(),
                            minStockAlert = minAlertStr.toIntOrNull() ?: 10,
                            batchNumber = batchNumber.trim(),
                            expiryDate = expiryDate.trim(),
                            wholesalePrice = wholesaleStr.toDoubleOrNull() ?: 0.0
                        )
                        onConfirm(product)
                    }
                }
            ) {
                Text(if (existingProduct != null) "Save Changes" else "Add Product")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

// -------------------------------------------------------------
// CHECKOUT PAYMENT, SPLIT TENDER & CHANGE CALCULATOR DIALOG
// -------------------------------------------------------------
@Composable
fun PosCheckoutPaymentDialog(
    docType: String,
    initialMethod: String,
    clientName: String,
    subtotal: Double,
    discountAmt: Double,
    taxAmt: Double,
    grandTotal: Double,
    onDismiss: () -> Unit,
    onConfirmPayment: (
        finalDocType: String,
        method: String,
        breakdown: String,
        paidAmt: Double,
        changeDue: Double,
        dueAmt: Double,
        status: String
    ) -> Unit
) {
    var selectedDocType by remember { mutableStateOf(docType) }
    var selectedMethod by remember { mutableStateOf(initialMethod) }
    var cashTenderedStr by remember { mutableStateOf(if (grandTotal > 0) String.format(Locale.US, "%.0f", grandTotal) else "0") }

    // Split Tender fields
    var splitCashStr by remember { mutableStateOf(String.format(Locale.US, "%.0f", grandTotal / 2.0)) }
    var splitCardStr by remember { mutableStateOf(String.format(Locale.US, "%.0f", grandTotal - (grandTotal / 2.0))) }
    var splitQrStr by remember { mutableStateOf("0") }

    val tenderedAmount = when (selectedMethod) {
        "Cash" -> cashTenderedStr.toDoubleOrNull() ?: 0.0
        "Split" -> (splitCashStr.toDoubleOrNull() ?: 0.0) + (splitCardStr.toDoubleOrNull() ?: 0.0) + (splitQrStr.toDoubleOrNull() ?: 0.0)
        "Credit / Khata" -> 0.0
        else -> grandTotal
    }
    val changeDue = if (selectedDocType != "Estimate" && selectedMethod != "Credit / Khata") {
        (tenderedAmount - grandTotal).coerceAtLeast(0.0)
    } else 0.0
    val dueAmt = if (selectedDocType == "Estimate") {
        0.0
    } else if (selectedMethod == "Credit / Khata") {
        grandTotal
    } else {
        (grandTotal - tenderedAmount).coerceAtLeast(0.0)
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column {
                Text("Confirm Payment & Issue", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                Text("Customer: $clientName", fontSize = 12.sp, color = Color.Gray)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth().heightIn(max = 470.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Total Summary Card
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subtotal / Disc / Tax", fontSize = 11.sp, color = Color.Gray)
                            Text("Rs ${subtotal.toInt()} / -${discountAmt.toInt()} / +${taxAmt.toInt()}", fontSize = 11.sp)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("NET PAYABLE", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("Rs ${String.format("%.2f", grandTotal)}", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                // Document Type
                Text("Document Type:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Invoice", "Receipt", "Estimate").forEach { dt ->
                        FilterChip(
                            selected = selectedDocType == dt,
                            onClick = { selectedDocType = dt },
                            label = { Text(dt, fontSize = 11.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                if (selectedDocType != "Estimate") {
                    Text("Payment Method:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(listOf("Cash", "Card POS", "QR Wallet", "Split", "Credit / Khata")) { method ->
                            FilterChip(
                                selected = selectedMethod == method,
                                onClick = { selectedMethod = method },
                                label = { Text(method, fontSize = 11.sp) }
                            )
                        }
                    }

                    if (selectedMethod == "Cash") {
                        OutlinedTextField(
                            value = cashTenderedStr,
                            onValueChange = { cashTenderedStr = it },
                            label = { Text("Cash Tendered (Rs)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        // Quick Cash Buttons
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            val quickAmounts = listOf(
                                "Exact" to grandTotal,
                                "500" to 500.0,
                                "1000" to 1000.0,
                                "2000" to 2000.0,
                                "5000" to 5000.0
                            )
                            items(quickAmounts) { (lbl, amt) ->
                                AssistChip(
                                    onClick = { cashTenderedStr = String.format(Locale.US, "%.0f", amt) },
                                    label = { Text(lbl, fontSize = 11.sp) }
                                )
                            }
                        }
                    } else if (selectedMethod == "Split") {
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            OutlinedTextField(value = splitCashStr, onValueChange = { splitCashStr = it }, label = { Text("Cash") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                            OutlinedTextField(value = splitCardStr, onValueChange = { splitCardStr = it }, label = { Text("Card") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                            OutlinedTextField(value = splitQrStr, onValueChange = { splitQrStr = it }, label = { Text("QR") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                        }
                    }

                    // Live Change / Due Readout
                    Surface(
                        color = if (dueAmt > 0.0) Color(0xFFFFEBEE) else Color(0xFFE8F5E9),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                if (dueAmt > 0.0) "Balance Due (Khata):" else "Change Due to Customer:",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = if (dueAmt > 0.0) Color(0xFFC62828) else Color(0xFF2E7D32)
                            )
                            Text(
                                "Rs ${String.format("%.2f", if (dueAmt > 0.0) dueAmt else changeDue)}",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 15.sp,
                                color = if (dueAmt > 0.0) Color(0xFFC62828) else Color(0xFF2E7D32)
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val status = when {
                        selectedDocType == "Estimate" -> "Estimate"
                        dueAmt >= grandTotal && grandTotal > 0 -> "Unpaid"
                        dueAmt > 0.0 -> "Partial"
                        else -> "Paid"
                    }
                    val breakdown = if (selectedMethod == "Split") {
                        buildList {
                            val c = splitCashStr.toDoubleOrNull() ?: 0.0
                            val card = splitCardStr.toDoubleOrNull() ?: 0.0
                            val qr = splitQrStr.toDoubleOrNull() ?: 0.0
                            if (c > 0) add("Cash: ${c.toInt()}")
                            if (card > 0) add("Card: ${card.toInt()}")
                            if (qr > 0) add("QR: ${qr.toInt()}")
                        }.joinToString(" | ")
                    } else ""
                    val finalMethod = if (selectedDocType == "Estimate") "Quotation" else selectedMethod
                    onConfirmPayment(selectedDocType, finalMethod, breakdown, tenderedAmount, changeDue, dueAmt, status)
                }
            ) {
                Icon(Icons.Default.CheckCircle, null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Confirm & Print")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

// -------------------------------------------------------------
// RETURNS & PARTIAL REFUNDS DIALOG (Restores Stock + Credit Note)
// -------------------------------------------------------------
@Composable
fun PosReturnRefundDialog(
    order: PosOrder,
    items: List<PosOrderItem>,
    onDismiss: () -> Unit,
    onConfirmReturn: (qtyMap: Map<String, Int>, restockItems: Boolean, refundMethod: String) -> Unit
) {
    val returnQtyMap = remember(items) {
        mutableStateMapOf<String, Int>().apply {
            items.forEach { put(it.id, 0) }
        }
    }
    var restockItems by remember { mutableStateOf(true) }
    var refundMethod by remember { mutableStateOf("Cash") }

    val selectedSubtotal = items.sumOf { item -> item.price * (returnQtyMap[item.id] ?: 0) }
    val origSub = order.subtotal.coerceAtLeast(0.01)
    val ratio = (selectedSubtotal / origSub).coerceIn(0.0, 1.0)
    val estNetRefund = ((selectedSubtotal - order.discount * ratio) + order.tax * ratio).coerceAtLeast(0.0)
    val totalSelectedUnits = returnQtyMap.values.sum()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column {
                Text("Return / Refund ${order.id}", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("Select item quantities to refund", fontSize = 11.5.sp, color = Color.Gray)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth().heightIn(max = 440.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = {
                        items.forEach { item ->
                            returnQtyMap[item.id] = (item.quantity - item.returnedQty).coerceAtLeast(0)
                        }
                    }) {
                        Text("Select All Remaining", fontSize = 11.sp)
                    }
                }

                items.forEach { item ->
                    val maxReturnable = (item.quantity - item.returnedQty).coerceAtLeast(0)
                    val selQty = returnQtyMap[item.id] ?: 0
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(8.dp)) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.name, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text(
                                    "Sold: ${item.quantity} • Returned: ${item.returnedQty} • Rs ${item.price.toInt()}/ea",
                                    fontSize = 10.sp,
                                    color = Color.Gray
                                )
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconButton(
                                    onClick = { if (selQty > 0) returnQtyMap[item.id] = selQty - 1 },
                                    enabled = selQty > 0,
                                    modifier = Modifier.size(28.dp)
                                ) { Icon(Icons.Default.Remove, null, modifier = Modifier.size(16.dp)) }
                                Text("$selQty", fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp))
                                IconButton(
                                    onClick = { if (selQty < maxReturnable) returnQtyMap[item.id] = selQty + 1 },
                                    enabled = selQty < maxReturnable,
                                    modifier = Modifier.size(28.dp)
                                ) { Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp)) }
                            }
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Restock items back to Inventory", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    Switch(checked = restockItems, onCheckedChange = { restockItems = it })
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Cash", "Card POS", "Store Credit").forEach { m ->
                        FilterChip(
                            selected = refundMethod == m,
                            onClick = { refundMethod = m },
                            label = { Text(m, fontSize = 11.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                Surface(
                    color = Color(0xFFFFF3E0),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Credit Note Refund:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFFE65100))
                        Text("Rs ${String.format("%.2f", estNetRefund)}", fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = Color(0xFFE65100))
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirmReturn(returnQtyMap.toMap(), restockItems, refundMethod) },
                enabled = totalSelectedUnits > 0,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE65100))
            ) {
                Text("Issue Credit Note ($totalSelectedUnits)")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

// -------------------------------------------------------------
// PACK B: CUSTOMERS & KHATA LEDGER SUB-SECTION
// -------------------------------------------------------------
@Composable
fun PosCustomersKhataSubSection(
    context: Context,
    customers: List<PosClient>,
    totalReceivables: Double,
    onAddCustomer: () -> Unit,
    onEditCustomer: (PosClient) -> Unit,
    onSettleKhata: (PosClient) -> Unit,
    onViewHistory: (PosClient) -> Unit,
    onDeleteClient: (String) -> Unit
) {
    var search by remember { mutableStateOf("") }
    var onlyDue by remember { mutableStateOf(false) }

    val filtered = remember(customers, search, onlyDue) {
        customers.filter { c ->
            val matchQ = search.isBlank() || c.name.contains(search, true) || c.phone.contains(search, true)
            val matchDue = !onlyDue || c.creditBalance > 0.0
            matchQ && matchDue
        }
    }

    Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Total Customer Khata Receivable", fontSize = 11.sp, color = Color.Gray)
                    Text("Rs ${String.format("%.2f", totalReceivables)}", fontWeight = FontWeight.ExtraBold, fontSize = 17.sp, color = Color(0xFFC62828))
                    Text("${customers.count { it.creditBalance > 0 }} account(s) with pending due", fontSize = 10.sp, color = Color.Gray)
                }
                Button(onClick = onAddCustomer, shape = RoundedCornerShape(10.dp)) {
                    Icon(Icons.Default.PersonAdd, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("New Customer", fontSize = 11.sp)
                }
            }
        }

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = search,
                onValueChange = { search = it },
                placeholder = { Text("Search customer name or phone...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f)
            )
            FilterChip(
                selected = onlyDue,
                onClick = { onlyDue = !onlyDue },
                label = { Text("Due Only", fontSize = 11.sp) }
            )
        }

        LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(filtered) { c ->
                Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(c.name, fontWeight = FontWeight.Bold, fontSize = 13.5.sp)
                                Text("${c.phone} • ${c.address.ifBlank { "No address" }}", fontSize = 11.sp, color = Color.Gray, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text("Spent: Rs ${c.totalSpent.toInt()} • Loyalty: ${c.loyaltyPoints} pts • Limit: Rs ${c.creditLimit.toInt()}", fontSize = 10.sp, color = Color(0xFF00897B), fontWeight = FontWeight.SemiBold)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    "Rs ${String.format("%.2f", c.creditBalance)}",
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 14.sp,
                                    color = if (c.creditBalance > 0.0) Color(0xFFC62828) else Color(0xFF2E7D32)
                                )
                                Text(if (c.creditBalance > 0.0) "KHATA DUE" else "CLEAR", fontSize = 9.5.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
                            }
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            FilledTonalButton(
                                onClick = { onSettleKhata(c) },
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Payments, null, modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Collect Due", fontSize = 11.sp)
                            }
                            OutlinedButton(
                                onClick = {
                                    val profile = getSavedBusinessProfile(context)
                                    val msg = "Assalam-o-Alaikum ${c.name},\nFriendly reminder from *${profile.businessName}*:\nYour current Khata balance is *Rs ${String.format("%.2f", c.creditBalance)}* (Loyalty Points: ${c.loyaltyPoints}).\nThank you!"
                                    val cleanPhone = c.phone.replace(Regex("[^0-9+]"), "")
                                    try {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$cleanPhone?text=${Uri.encode(msg)}"))
                                        context.startActivity(intent)
                                    } catch (_: Exception) {
                                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                            type = "text/plain"
                                            putExtra(Intent.EXTRA_TEXT, msg)
                                        }
                                        context.startActivity(Intent.createChooser(shareIntent, "Send Khata Reminder"))
                                    }
                                },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.Send, null, tint = Color(0xFF25D366), modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(3.dp))
                                Text("WhatsApp", fontSize = 10.5.sp, color = Color(0xFF25D366))
                            }
                            IconButton(onClick = { onViewHistory(c) }, modifier = Modifier.size(32.dp)) {
                                Icon(Icons.Default.History, contentDescription = "Ledger History", modifier = Modifier.size(16.dp))
                            }
                            IconButton(onClick = { onEditCustomer(c) }, modifier = Modifier.size(32.dp)) {
                                Icon(Icons.Default.Edit, contentDescription = "Edit Customer", modifier = Modifier.size(16.dp))
                            }
                            IconButton(onClick = { onDeleteClient(c.id) }, modifier = Modifier.size(32.dp)) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.7f), modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// PACK B: STORE EXPENSES & PETTY CASH SUB-SECTION
// -------------------------------------------------------------
@Composable
fun PosExpensesSubSection(
    expenses: List<PosExpense>,
    totalExpenses: Double,
    onAddExpense: () -> Unit,
    onDeleteExpense: (String) -> Unit
) {
    val totalCashIn = remember(expenses) { expenses.filter { it.category.equals("Cash In Top-up", true) }.sumOf { it.amount } }
    Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Store Overheads & Petty Cash", fontSize = 11.sp, color = Color.Gray)
                    Text("Rs ${String.format("%.2f", totalExpenses)}", fontWeight = FontWeight.ExtraBold, fontSize = 17.sp, color = MaterialTheme.colorScheme.error)
                    Text("Cash Drawer Top-ups: +Rs ${totalCashIn.toInt()} • Synced to P&L Report", fontSize = 10.sp, color = Color.Gray)
                }
                Button(onClick = onAddExpense, shape = RoundedCornerShape(10.dp)) {
                    Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Log Expense", fontSize = 11.sp)
                }
            }
        }

        if (expenses.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No store expenses recorded yet.\nLog Rent, Utilities, Supplies, or Petty Cash to reflect real Net Profit.", textAlign = TextAlign.Center, color = Color.Gray, fontSize = 12.sp)
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(expenses) { exp ->
                    val isCashIn = exp.category.equals("Cash In Top-up", true)
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp)) {
                        Row(
                            modifier = Modifier.padding(12.dp).fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(exp.category, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("${exp.date} • ${exp.paymentSource}", fontSize = 10.5.sp, color = Color.Gray)
                                if (exp.note.isNotBlank()) Text(exp.note, fontSize = 11.sp)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    "${if (isCashIn) "+" else "-"}Rs ${String.format("%.2f", exp.amount)}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = if (isCashIn) Color(0xFF2E7D32) else Color(0xFFC62828)
                                )
                                IconButton(onClick = { onDeleteExpense(exp.id) }, modifier = Modifier.size(28.dp)) {
                                    Icon(Icons.Default.Delete, null, tint = Color.Red.copy(alpha = 0.7f), modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// PACK B: SUPPLIERS & PURCHASE ORDERS (GRN STOCK-IN) SUB-SECTION
// -------------------------------------------------------------
@Composable
fun PosSuppliersGrnSubSection(
    suppliers: List<PosClient>,
    purchaseOrders: List<PosPurchaseOrder>,
    onAddSupplier: () -> Unit,
    onOpenReceiveGrn: () -> Unit,
    onPaySupplier: (PosClient) -> Unit,
    onViewHistory: (PosClient) -> Unit
) {
    val totalPayable = remember(suppliers) { suppliers.sumOf { it.creditBalance } }
    Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("Supplier Payables & GRN Intake", fontSize = 11.sp, color = Color.Gray)
                        Text("Payable: Rs ${String.format("%.2f", totalPayable)}", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = MaterialTheme.colorScheme.tertiary)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedButton(onClick = onAddSupplier, contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)) {
                            Text("+ Supplier", fontSize = 11.sp)
                        }
                        Button(onClick = onOpenReceiveGrn, contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)) {
                            Icon(Icons.Default.LocalShipping, null, modifier = Modifier.size(15.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Receive GRN", fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (suppliers.isNotEmpty()) {
                item {
                    Text("Suppliers (${suppliers.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Gray)
                }
                items(suppliers) { sup ->
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp)) {
                        Row(modifier = Modifier.padding(10.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(sup.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("${sup.phone} • ${sup.address}", fontSize = 10.5.sp, color = Color.Gray, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("Rs ${sup.creditBalance.toInt()}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = if (sup.creditBalance > 0) Color(0xFFC62828) else Color(0xFF2E7D32))
                                    Text("Payable", fontSize = 9.sp, color = Color.Gray)
                                }
                                FilledTonalButton(onClick = { onPaySupplier(sup) }, contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp), modifier = Modifier.height(30.dp)) {
                                    Text("Pay", fontSize = 11.sp)
                                }
                                IconButton(onClick = { onViewHistory(sup) }, modifier = Modifier.size(28.dp)) {
                                    Icon(Icons.Default.History, null, modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(Modifier.height(4.dp))
                Text("Purchase Orders / GRN History (${purchaseOrders.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Gray)
            }
            if (purchaseOrders.isEmpty()) {
                item {
                    Text("No GRNs received yet. Tap Receive GRN to restock inventory & update wholesale costs.", fontSize = 12.sp, color = Color.Gray)
                }
            } else {
                items(purchaseOrders) { po ->
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp)) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("${po.id} • ${po.supplierName}", fontWeight = FontWeight.Bold, fontSize = 12.5.sp)
                                Text("Rs ${String.format("%.2f", po.totalCost)}", fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary, fontSize = 12.5.sp)
                            }
                            Text(po.itemsSummary, fontSize = 11.sp, color = Color.DarkGray, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            Text("${po.date} • Paid: Rs ${po.paidAmount.toInt()} • Due: Rs ${po.dueAmount.toInt()} (${po.status})", fontSize = 10.sp, color = Color.Gray)
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// PACK B DIALOGS: CASH DRAWER & PIN SWITCH, CLIENT/KHATA, GRN, EXPENSE
// -------------------------------------------------------------
@Composable
fun PosRegisterAndPinDialog(
    activeCashierName: String,
    activeCashierRole: String,
    employees: List<PosEmployee>,
    drawers: List<PosCashDrawerSession>,
    orders: List<PosOrder>,
    posExpenses: List<PosExpense>,
    onDismiss: () -> Unit,
    onSwitchCashierPin: (String, (Boolean, String) -> Unit) -> Unit,
    onOpenDrawer: (Double, String) -> Unit,
    onCloseDrawer: (PosCashDrawerSession, Double, Double, String) -> Unit,
    onQuickCashMovement: (Boolean, Double, String) -> Unit
) {
    val context = LocalContext.current
    val cashDrawerScope = rememberCoroutineScope()
    val openSession = drawers.firstOrNull { it.status == "OPEN" }
    var pinInput by remember { mutableStateOf("") }
    var floatInput by remember { mutableStateOf("5000") }
    var countedCashInput by remember { mutableStateOf("") }
    var drawerNote by remember { mutableStateOf("") }
    var cashMoveAmount by remember { mutableStateOf("") }
    var cashMoveNote by remember { mutableStateOf("") }

    val cashSalesTotal = orders.filter { it.documentType != "Estimate" && it.paymentMethod.contains("Cash", true) }
        .sumOf { it.total - it.dueAmount }
    val cashInTotal = posExpenses.filter { it.category.equals("Cash In Top-up", true) }.sumOf { it.amount }
    val cashOutTotal = posExpenses.filter { !it.category.equals("Cash In Top-up", true) && it.paymentSource.equals("Cash Drawer", true) }.sumOf { it.amount }
    val expectedCash = (openSession?.openingFloat ?: 0.0) + cashSalesTotal + cashInTotal - cashOutTotal

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column {
                Text("Cash Drawer & Cashier Switch", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("Active: $activeCashierName ($activeCashierRole)", fontSize = 11.5.sp, color = MaterialTheme.colorScheme.primary)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth().heightIn(max = 460.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Quick PIN Switcher
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Switch Operator via 4-Digit PIN (0000 = Admin):", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(
                                value = pinInput,
                                onValueChange = { if (it.length <= 6) pinInput = it },
                                label = { Text("Enter Staff PIN") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )
                            Button(onClick = {
                                onSwitchCashierPin(pinInput) { ok, msg ->
                                    Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                                    if (ok) pinInput = ""
                                }
                            }) {
                                Text("Switch", fontSize = 12.sp)
                            }
                        }
                        if (employees.isNotEmpty()) {
                            Text(
                                "Staff PINs: " + employees.take(4).joinToString(" | ") { "${it.fullName.substringBefore(" ")} (${it.pinCode})" },
                                fontSize = 10.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }

                // Cash Drawer Open / Close Section
                if (openSession == null) {
                    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0))) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Register Drawer is CLOSED", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFFE65100))
                            OutlinedTextField(
                                value = floatInput,
                                onValueChange = { floatInput = it },
                                label = { Text("Opening Cash Float (Rs)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                            OutlinedTextField(
                                value = drawerNote,
                                onValueChange = { drawerNote = it },
                                label = { Text("Shift Note (optional)") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                            Button(
                                onClick = { onOpenDrawer(floatInput.toDoubleOrNull() ?: 0.0, drawerNote) },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Open Register Drawer")
                            }
                        }
                    }
                } else {
                    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9))) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Drawer OPEN (${openSession.id})", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF2E7D32))
                            Text("Opened: ${openSession.openedAt} • Float: Rs ${openSession.openingFloat.toInt()}", fontSize = 11.sp)
                            Text("Expected Drawer Cash: Rs ${String.format("%.2f", expectedCash)}", fontWeight = FontWeight.Bold, fontSize = 13.sp)

                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                OutlinedTextField(value = cashMoveAmount, onValueChange = { cashMoveAmount = it }, label = { Text("Petty Amt") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                                OutlinedTextField(value = cashMoveNote, onValueChange = { cashMoveNote = it }, label = { Text("Reason") }, singleLine = true, modifier = Modifier.weight(1.2f))
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                OutlinedButton(
                                    onClick = {
                                        val amt = cashMoveAmount.toDoubleOrNull() ?: 0.0
                                        if (amt > 0) {
                                            onQuickCashMovement(true, amt, cashMoveNote.ifBlank { "Drawer Float Top-up" })
                                            cashMoveAmount = ""
                                            cashMoveNote = ""
                                        }
                                    },
                                    modifier = Modifier.weight(1f)
                                ) { Text("+ Cash In", fontSize = 11.sp) }
                                OutlinedButton(
                                    onClick = {
                                        val amt = cashMoveAmount.toDoubleOrNull() ?: 0.0
                                        if (amt > 0) {
                                            onQuickCashMovement(false, amt, cashMoveNote.ifBlank { "Petty Cash Paid Out" })
                                            cashMoveAmount = ""
                                            cashMoveNote = ""
                                        }
                                    },
                                    modifier = Modifier.weight(1f)
                                ) { Text("- Cash Out", fontSize = 11.sp) }
                            }

                            HorizontalDivider()
                            OutlinedTextField(
                                value = countedCashInput,
                                onValueChange = { countedCashInput = it },
                                label = { Text("Counted Physical Cash to Close (Rs)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                            val countedVal = countedCashInput.toDoubleOrNull() ?: expectedCash
                            val diff = countedVal - expectedCash
                            Text(
                                "Closing Variance: Rs ${String.format("%.2f", diff)}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (diff == 0.0) Color(0xFF2E7D32) else Color(0xFFC62828)
                            )
                            Button(
                                onClick = { onCloseDrawer(openSession, expectedCash, countedVal, drawerNote) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Close Register & Save Z-Audit")
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedButton(
                    onClick = {
                        cashDrawerScope.launch(Dispatchers.IO) {
                            val (ok, msg) = BluetoothThermalPrinterHelper.openCashDrawer(context)
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                ) {
                    Text("⚡ Kick Drawer", fontSize = 11.5.sp)
                }
                TextButton(onClick = onDismiss) { Text("Done") }
            }
        }
    )
}

@Composable
fun PosClientEditorDialog(
    existingClient: PosClient? = null,
    defaultType: String = "Customer",
    onDismiss: () -> Unit,
    onSave: (PosClient) -> Unit
) {
    var name by remember { mutableStateOf(existingClient?.name ?: "") }
    var phone by remember { mutableStateOf(existingClient?.phone ?: "") }
    var email by remember { mutableStateOf(existingClient?.email ?: "") }
    var address by remember { mutableStateOf(existingClient?.address ?: "") }
    var type by remember { mutableStateOf(existingClient?.type ?: defaultType) }
    var creditLimit by remember { mutableStateOf(if (existingClient != null) existingClient.creditLimit.toInt().toString() else "50000") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (existingClient != null) "Edit $type" else "New $type", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.verticalScroll(rememberScrollState())) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Customer", "Supplier").forEach { t ->
                        FilterChip(selected = type == t, onClick = { type = t }, label = { Text(t) }, modifier = Modifier.weight(1f))
                    }
                }
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full / Business Name*") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone / WhatsApp") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email (optional)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = address, onValueChange = { address = it }, label = { Text("Address") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = creditLimit, onValueChange = { creditLimit = it }, label = { Text("Credit Limit (Rs)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(
                        PosClient(
                            id = existingClient?.id ?: "client_${System.currentTimeMillis() % 1000000}",
                            name = name.trim(),
                            phone = phone.trim(),
                            email = email.trim(),
                            address = address.trim(),
                            type = type,
                            creditBalance = existingClient?.creditBalance ?: 0.0,
                            creditLimit = creditLimit.toDoubleOrNull() ?: 50000.0,
                            loyaltyPoints = existingClient?.loyaltyPoints ?: 0,
                            totalSpent = existingClient?.totalSpent ?: 0.0
                        )
                    )
                },
                enabled = name.isNotBlank()
            ) { Text("Save $type") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun PosKhataSettleDialog(
    client: PosClient,
    onDismiss: () -> Unit,
    onConfirmSettle: (amount: Double, method: String, note: String) -> Unit
) {
    val isSupplier = client.type.equals("Supplier", true)
    var amountStr by remember { mutableStateOf(if (client.creditBalance > 0) String.format(Locale.US, "%.0f", client.creditBalance) else "") }
    var method by remember { mutableStateOf("Cash") }
    var note by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column {
                Text(if (isSupplier) "Pay Supplier Due" else "Collect Customer Khata", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("${client.name} • Current Due: Rs ${String.format("%.2f", client.creditBalance)}", fontSize = 11.5.sp, color = Color(0xFFC62828))
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = amountStr,
                    onValueChange = { amountStr = it },
                    label = { Text("Settlement Amount (Rs)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Cash", "Bank / Transfer", "QR Wallet").forEach { m ->
                        FilterChip(selected = method == m, onClick = { method = m }, label = { Text(m, fontSize = 10.5.sp) })
                    }
                }
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("Reference / Note") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            val amt = amountStr.toDoubleOrNull() ?: 0.0
            Button(onClick = { onConfirmSettle(amt, method, note) }, enabled = amt > 0.0) {
                Text("Record Payment")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun PosKhataHistoryDialog(
    context: Context,
    client: PosClient,
    transactions: List<PosKhataTransaction>,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column {
                Text("${client.name} Ledger", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("Balance: Rs ${String.format("%.2f", client.creditBalance)} • ${client.loyaltyPoints} pts", fontSize = 11.5.sp, color = MaterialTheme.colorScheme.primary)
            }
        },
        text = {
            if (transactions.isEmpty()) {
                Text("No Khata ledger transactions recorded for this account yet.", fontSize = 12.sp, color = Color.Gray)
            } else {
                Column(modifier = Modifier.fillMaxWidth().heightIn(max = 360.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    transactions.forEach { tx ->
                        val isDebit = tx.type.contains("Sale", true) || tx.type.contains("Bill", true)
                        Card(shape = RoundedCornerShape(8.dp)) {
                            Row(modifier = Modifier.padding(8.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(tx.type, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    Text("${tx.date} • ${tx.paymentMethod}", fontSize = 10.sp, color = Color.Gray)
                                    if (tx.note.isNotBlank()) Text(tx.note, fontSize = 10.5.sp)
                                }
                                Text(
                                    "${if (isDebit) "+" else "-"}Rs ${String.format("%.2f", tx.amount)}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.5.sp,
                                    color = if (isDebit) Color(0xFFC62828) else Color(0xFF2E7D32)
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Close") } }
    )
}

@Composable
fun PosPurchaseOrderGrnDialog(
    suppliers: List<PosClient>,
    products: List<PosProduct>,
    onDismiss: () -> Unit,
    onReceiveGrn: (PosPurchaseOrder, List<Triple<String, Int, Double>>) -> Unit
) {
    var selectedSupplierId by remember { mutableStateOf(suppliers.firstOrNull()?.id) }
    var supExpanded by remember { mutableStateOf(false) }
    var selectedProd by remember { mutableStateOf(products.firstOrNull()) }
    var prodExpanded by remember { mutableStateOf(false) }
    var qtyStr by remember { mutableStateOf("10") }
    var costStr by remember { mutableStateOf(products.firstOrNull()?.costPrice?.toInt()?.toString() ?: "") }
    val lineItems = remember { mutableStateListOf<Triple<PosProduct, Int, Double>>() }
    var paidAmountStr by remember { mutableStateOf("") }
    var poNote by remember { mutableStateOf("") }

    val totalCost = lineItems.sumOf { (_, q, c) -> q * c }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Receive Stock (Purchase Order / GRN)", fontWeight = FontWeight.Bold, fontSize = 15.5.sp) },
        text = {
            Column(modifier = Modifier.fillMaxWidth().heightIn(max = 460.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                val curSup = suppliers.firstOrNull { it.id == selectedSupplierId }
                OutlinedCard(onClick = { supExpanded = true }, modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(10.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column {
                            Text("Supplier:", fontSize = 10.sp, color = Color.Gray)
                            Text(curSup?.name ?: "Direct Cash Supplier", fontWeight = FontWeight.Bold, fontSize = 12.5.sp)
                        }
                        Icon(Icons.Default.ArrowDropDown, null)
                    }
                    DropdownMenu(expanded = supExpanded, onDismissRequest = { supExpanded = false }) {
                        DropdownMenuItem(text = { Text("Direct Cash Supplier") }, onClick = { selectedSupplierId = null; supExpanded = false })
                        suppliers.forEach { s ->
                            DropdownMenuItem(text = { Text(s.name) }, onClick = { selectedSupplierId = s.id; supExpanded = false })
                        }
                    }
                }

                // Product picker to add to GRN
                OutlinedCard(onClick = { prodExpanded = true }, modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(10.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Product to Restock:", fontSize = 10.sp, color = Color.Gray)
                            Text(selectedProd?.name ?: "Select product", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                        Icon(Icons.Default.ArrowDropDown, null)
                    }
                    DropdownMenu(expanded = prodExpanded, onDismissRequest = { prodExpanded = false }) {
                        products.forEach { p ->
                            DropdownMenuItem(
                                text = { Text("${p.name} (Stock: ${p.stock})") },
                                onClick = {
                                    selectedProd = p
                                    costStr = (if (p.costPrice > 0) p.costPrice else p.price * 0.7).toInt().toString()
                                    prodExpanded = false
                                }
                            )
                        }
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(value = qtyStr, onValueChange = { qtyStr = it }, label = { Text("Qty") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = costStr, onValueChange = { costStr = it }, label = { Text("Unit Cost") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.weight(1.2f))
                    Button(
                        onClick = {
                            val p = selectedProd ?: return@Button
                            val q = qtyStr.toIntOrNull() ?: 0
                            val c = costStr.toDoubleOrNull() ?: p.costPrice
                            if (q > 0) {
                                lineItems.add(Triple(p, q, c))
                            }
                        }
                    ) { Text("+ Add") }
                }

                lineItems.forEachIndexed { idx, (p, q, c) ->
                    Row(
                        modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), RoundedCornerShape(6.dp)).padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("${p.name} × $q @ Rs ${c.toInt()}", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text("Rs ${(q * c).toInt()}", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        IconButton(onClick = { lineItems.removeAt(idx) }, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Default.Delete, null, tint = Color.Red, modifier = Modifier.size(14.dp))
                        }
                    }
                }

                if (lineItems.isNotEmpty()) {
                    Text("Total PO Cost: Rs ${String.format("%.2f", totalCost)}", fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                    OutlinedTextField(value = paidAmountStr, onValueChange = { paidAmountStr = it }, label = { Text("Amount Paid Now (blank = full paid)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = poNote, onValueChange = { poNote = it }, label = { Text("GRN Reference / Invoice #") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val sup = suppliers.firstOrNull { it.id == selectedSupplierId }
                    val paid = if (paidAmountStr.isBlank()) totalCost else (paidAmountStr.toDoubleOrNull() ?: 0.0)
                    val due = (totalCost - paid).coerceAtLeast(0.0)
                    val status = when {
                        due <= 0.0 -> "Received"
                        paid > 0.0 -> "Partial"
                        else -> "Unpaid"
                    }
                    val summary = lineItems.joinToString(", ") { (p, q, _) -> "${p.name} (×$q)" }
                    val po = PosPurchaseOrder(
                        id = "PO-${System.currentTimeMillis() % 1000000}",
                        date = SimpleDateFormat("dd-MMM-yyyy hh:mm a", Locale.getDefault()).format(Date()),
                        supplierId = sup?.id,
                        supplierName = sup?.name ?: "Direct Cash Supplier",
                        itemsSummary = summary,
                        totalCost = totalCost,
                        paidAmount = paid,
                        dueAmount = due,
                        status = status,
                        note = poNote
                    )
                    val stockUpdates = lineItems.map { (p, q, c) -> Triple(p.id, q, c) }
                    onReceiveGrn(po, stockUpdates)
                },
                enabled = lineItems.isNotEmpty()
            ) { Text("Confirm GRN & Restock") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun PosExpenseEditorDialog(
    onDismiss: () -> Unit,
    onSave: (PosExpense) -> Unit
) {
    var category by remember { mutableStateOf("Supplies & Bags") }
    var amountStr by remember { mutableStateOf("") }
    var paymentSource by remember { mutableStateOf("Cash Drawer") }
    var note by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Log Store Expense / Petty Cash", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(listOf("Rent", "Utilities", "Supplies & Bags", "Petty Cash Out", "Transport", "Marketing", "Cash In Top-up")) { cat ->
                        FilterChip(selected = category == cat, onClick = { category = cat }, label = { Text(cat, fontSize = 10.5.sp) })
                    }
                }
                OutlinedTextField(
                    value = amountStr,
                    onValueChange = { amountStr = it },
                    label = { Text("Amount (Rs)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Cash Drawer", "Bank / Wallet").forEach { src ->
                        FilterChip(selected = paymentSource == src, onClick = { paymentSource = src }, label = { Text(src, fontSize = 11.sp) }, modifier = Modifier.weight(1f))
                    }
                }
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("Description / Bill Ref") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            val amt = amountStr.toDoubleOrNull() ?: 0.0
            Button(
                onClick = {
                    onSave(
                        PosExpense(
                            id = "EXP-${System.currentTimeMillis() % 1000000}",
                            date = SimpleDateFormat("dd-MMM-yyyy hh:mm a", Locale.getDefault()).format(Date()),
                            category = category,
                            amount = amt,
                            paymentSource = paymentSource,
                            note = note.trim()
                        )
                    )
                },
                enabled = amt > 0.0
            ) { Text("Save Entry") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

// -------------------------------------------------------------
// CUSTOM INVOICE BUILDER DIALOG
// -------------------------------------------------------------
@Composable
fun CustomInvoiceBuilderDialog(
    allClients: List<PosClient>,
    onDismiss: () -> Unit,
    onCreateOrder: (PosOrder, List<PosOrderItem>) -> Unit
) {
    var docType by remember { mutableStateOf("Invoice") }
    var selectedClientId by remember { mutableStateOf<String?>(null) }
    var customItemName by remember { mutableStateOf("") }
    var customItemRate by remember { mutableStateOf("") }
    var customItemQty by remember { mutableStateOf("1") }
    val customItems = remember { mutableStateListOf<PosOrderItem>() }
    var discountStr by remember { mutableStateOf("0") }
    var taxStr by remember { mutableStateOf("0") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Custom Invoice / Quotation", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 450.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Doc Type Switcher
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Invoice", "Receipt", "Estimate").forEach { type ->
                        FilterChip(
                            selected = docType == type,
                            onClick = { docType = type },
                            label = { Text(type, fontSize = 11.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Add Custom Line Item Form
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Add Custom Line Item:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        OutlinedTextField(
                            value = customItemName,
                            onValueChange = { customItemName = it },
                            label = { Text("Item Description") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            OutlinedTextField(
                                value = customItemRate,
                                onValueChange = { customItemRate = it },
                                label = { Text("Rate (Rs)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = customItemQty,
                                onValueChange = { customItemQty = it },
                                label = { Text("Qty") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )
                        }
                        Button(
                            onClick = {
                                if (customItemName.isNotBlank()) {
                                    customItems.add(
                                        PosOrderItem(
                                            id = UUID.randomUUID().toString(),
                                            orderId = "",
                                            productId = "custom_${System.currentTimeMillis() % 10000}",
                                            name = customItemName.trim(),
                                            quantity = customItemQty.toIntOrNull() ?: 1,
                                            price = customItemRate.toDoubleOrNull() ?: 0.0
                                        )
                                    )
                                    customItemName = ""
                                    customItemRate = ""
                                    customItemQty = "1"
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Add Line Item", fontSize = 12.sp)
                        }
                    }
                }

                // Added Items
                if (customItems.isNotEmpty()) {
                    Text("Included Items (${customItems.size}):", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    customItems.forEachIndexed { index, item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(6.dp))
                                .padding(6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.name, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                Text("${item.quantity} × Rs ${item.price} = Rs ${(item.quantity * item.price).toInt()}", fontSize = 10.sp, color = Color.Gray)
                            }
                            IconButton(onClick = { customItems.removeAt(index) }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Delete, null, tint = Color.Red, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (customItems.isNotEmpty()) {
                        val orderId = "INV-${System.currentTimeMillis() % 1000000}"
                        val dateStr = SimpleDateFormat("dd-MMM-yyyy hh:mm a", Locale.getDefault()).format(Date())
                        val subtotal = customItems.sumOf { it.price * it.quantity }
                        val discount = subtotal * ((discountStr.toDoubleOrNull() ?: 0.0) / 100.0)
                        val tax = (subtotal - discount) * ((taxStr.toDoubleOrNull() ?: 0.0) / 100.0)
                        val total = (subtotal - discount) + tax

                        val finalItems = customItems.map { it.copy(orderId = orderId) }
                        val newOrder = PosOrder(
                            id = orderId,
                            date = dateStr,
                            clientId = selectedClientId,
                            subtotal = subtotal,
                            tax = tax,
                            discount = discount,
                            total = total,
                            documentType = docType
                        )
                        onCreateOrder(newOrder, finalItems)
                    }
                },
                enabled = customItems.isNotEmpty()
            ) {
                Text("Create Invoice")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

// -------------------------------------------------------------
// ENTERPRISE SUITE SETTINGS & OFFICIAL LOGO STUDIO TAB
// -------------------------------------------------------------
@Composable
fun PosEnterpriseSettingsSection(context: Context, viewModel: StudentKitViewModel) {
    val coroutineScope = rememberCoroutineScope()
    val initialProfile = remember { getSavedBusinessProfile(context) }

    var bizName by remember { mutableStateOf(initialProfile.businessName) }
    var bizTagline by remember { mutableStateOf(initialProfile.tagline) }
    var bizAddress by remember { mutableStateOf(initialProfile.address) }
    var bizCity by remember { mutableStateOf(initialProfile.cityCountry) }
    var bizPhone by remember { mutableStateOf(initialProfile.phone) }
    var bizEmail by remember { mutableStateOf(initialProfile.email) }
    var bizNtn by remember { mutableStateOf(initialProfile.ntnNumber) }
    var bizStrn by remember { mutableStateOf(initialProfile.strnNumber) }
    var bizPosId by remember { mutableStateOf(initialProfile.fbrPosId) }
    var bizCurrency by remember { mutableStateOf(initialProfile.currency) }
    var defaultTaxStr by remember { mutableStateOf(if (initialProfile.defaultTaxPercent > 0.0) initialProfile.defaultTaxPercent.toString() else "0") }
    var receiptFooter by remember { mutableStateOf(initialProfile.receiptFooter) }
    var loyaltyPer100Str by remember { mutableStateOf(initialProfile.loyaltyPointsPer100.toString()) }
    var autoKickDrawer by remember { mutableStateOf(initialProfile.autoKickDrawer) }

    var showLogoOnInvoice by remember { mutableStateOf(initialProfile.showLogoOnInvoice) }
    var showLogoOnThermal by remember { mutableStateOf(initialProfile.showLogoOnThermal) }
    var thermalThreshold by remember { mutableFloatStateOf(initialProfile.thermalDitherThreshold.toFloat()) }

    var logoBitmap by remember { mutableStateOf(BluetoothThermalPrinterHelper.getSavedLogoBitmap(context)) }

    // Bluetooth Hardware settings
    var selectedPrinterAddress by remember { mutableStateOf(BluetoothThermalPrinterHelper.getSavedPrinterAddress(context)) }
    var selectedPaperSize by remember { mutableStateOf(BluetoothThermalPrinterHelper.getSavedPaperSize(context)) }
    var availablePrinters by remember { mutableStateOf(BluetoothThermalPrinterHelper.getAvailablePrinters(context)) }

    // File picker for Logo Upload (PNG/JPG/WEBP)
    val logoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            val savedPath = BluetoothThermalPrinterHelper.saveLogoFromUri(context, uri)
            if (savedPath != null) {
                logoBitmap = BluetoothThermalPrinterHelper.getSavedLogoBitmap(context)
                Toast.makeText(context, "Logo Uploaded in Best Quality! Ready for A4 & Thermal Bills.", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, "Could not process selected image. Please try another PNG or JPG.", Toast.LENGTH_LONG).show()
            }
        }
    }

    // Pack C: File picker for JSON Full Store Restore & CSV Catalog Import
    val jsonRestoreLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                val jsonText = context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() } ?: ""
                if (jsonText.isNotBlank()) {
                    viewModel.restorePosBackupJson(jsonText) { _, msg ->
                        Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Could not read backup file: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    val csvImportLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                val csvText = context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() } ?: ""
                if (csvText.isNotBlank()) {
                    viewModel.importPosProductsCsv(csvText) { count ->
                        Toast.makeText(context, "Imported $count catalog products from CSV!", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(context, "CSV read failed: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    // Dynamic 1-Bit Thermal Simulation Preview Bitmap
    val simulatedThermalBitmap = remember(logoBitmap, thermalThreshold) {
        logoBitmap?.let { bmp ->
            try {
                val targetWidth = 384
                val aspect = bmp.height.toFloat() / bmp.width.toFloat()
                val targetHeight = (targetWidth * aspect).toInt().coerceAtLeast(1)
                val scaled = Bitmap.createScaledBitmap(bmp, targetWidth, targetHeight, true)
                val mono = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888)
                val pixels = IntArray(targetWidth * targetHeight)
                scaled.getPixels(pixels, 0, targetWidth, 0, 0, targetWidth, targetHeight)
                val thresh = thermalThreshold.toInt()
                for (i in pixels.indices) {
                    val c = pixels[i]
                    val a = (c ushr 24) and 0xFF
                    val r = (c ushr 16) and 0xFF
                    val g = (c ushr 8) and 0xFF
                    val b = c and 0xFF
                    if (a < 50) {
                        pixels[i] = AndroidColor.WHITE
                    } else {
                        val lum = (0.299 * r + 0.587 * g + 0.114 * b).toInt()
                        pixels[i] = if (lum < thresh) AndroidColor.BLACK else AndroidColor.WHITE
                    }
                }
                mono.setPixels(pixels, 0, targetWidth, 0, 0, targetWidth, targetHeight)
                mono
            } catch (e: Exception) {
                null
            }
        }
    }

    val saveSettings = {
        val updatedProfile = PosBusinessProfile(
            businessName = bizName.trim(),
            tagline = bizTagline.trim(),
            address = bizAddress.trim(),
            cityCountry = bizCity.trim(),
            phone = bizPhone.trim(),
            email = bizEmail.trim(),
            ntnNumber = bizNtn.trim(),
            strnNumber = bizStrn.trim(),
            fbrPosId = bizPosId.trim(),
            currency = bizCurrency.trim().ifBlank { "Rs" },
            logoUri = if (logoBitmap != null) "internal://omni_pos_logo.png" else "",
            showLogoOnInvoice = showLogoOnInvoice,
            showLogoOnThermal = showLogoOnThermal,
            thermalDitherThreshold = thermalThreshold.toInt(),
            defaultTaxPercent = (defaultTaxStr.toDoubleOrNull() ?: 0.0).coerceIn(0.0, 100.0),
            receiptFooter = receiptFooter.trim().ifBlank { "Thank you for your business!" },
            autoKickDrawer = autoKickDrawer,
            loyaltyPointsPer100 = (loyaltyPer100Str.toIntOrNull() ?: 1).coerceIn(0, 50)
        )
        saveBusinessProfile(context, updatedProfile)
        BluetoothThermalPrinterHelper.savePrinterAddress(context, selectedPrinterAddress)
        BluetoothThermalPrinterHelper.savePaperSize(context, selectedPaperSize)
        Toast.makeText(context, "Enterprise Profile, Tax & Hardware Settings Saved!", Toast.LENGTH_SHORT).show()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // HEADER TITLE CARD
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Storefront, contentDescription = null, tint = Color.White, modifier = Modifier.size(28.dp))
                    }
                    Spacer(Modifier.width(14.dp))
                    Column {
                        Text(
                            "Enterprise Suite & Branding Studio",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            "Upload official logos, tune thermal contrast, customize receipts & A4 tax invoices",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // SECTION 1: OFFICIAL BUSINESS LOGO STUDIO (A4 & THERMAL)
        // -------------------------------------------------------------
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(Modifier.width(8.dp))
                            Text("Official Business Logo", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                        if (logoBitmap != null) {
                            Surface(
                                color = Color(0xFFE8F5E9),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    "✓ High-Res Active",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF2E7D32),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    Text(
                        "Upload your hospital, clinic, pharmacy, or enterprise logo. The app automatically renders it in vector-sharp quality for A4 PDFs and converts it to crisp 1-bit monochrome raster dots for ESC/POS thermal printers.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    // LOGO PREVIEW CANVAS
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(130.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSystemInDarkTheme()) Color(0xFF1E293B) else Color(0xFFF1F5F9))
                            .border(BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        if (logoBitmap != null) {
                            Image(
                                bitmap = logoBitmap!!.asImageBitmap(),
                                contentDescription = "Uploaded Business Logo",
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(12.dp),
                                contentScale = ContentScale.Fit
                            )
                        } else {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    Icons.Default.CloudUpload,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(Modifier.height(6.dp))
                                Text(
                                    "No Logo Uploaded (Default text header active)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    // UPLOAD / REMOVE BUTTONS
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { logoPickerLauncher.launch("image/*") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.UploadFile, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text(if (logoBitmap == null) "Upload Logo" else "Change Logo", fontWeight = FontWeight.Bold)
                        }

                        if (logoBitmap != null) {
                            OutlinedButton(
                                onClick = {
                                    BluetoothThermalPrinterHelper.deleteSavedLogo(context)
                                    logoBitmap = null
                                    Toast.makeText(context, "Logo removed", Toast.LENGTH_SHORT).show()
                                },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
                            ) {
                                Icon(Icons.Default.Delete, null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Remove")
                            }
                        }
                    }

                    Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                    // SWITCHES FOR OUTPUT DESTINATIONS
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                            Text("Show Logo on A4 Invoices & PDFs", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Displays high-resolution branded header on laser/inkjet printed A4 bills and exported PDFs", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Switch(
                            checked = showLogoOnInvoice,
                            onCheckedChange = { showLogoOnInvoice = it }
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                            Text("Show Logo on Thermal Receipts", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Burns 1-bit monochrome raster image at the top of 58mm & 80mm ESC/POS receipts", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Switch(
                            checked = showLogoOnThermal,
                            onCheckedChange = { showLogoOnThermal = it }
                        )
                    }

                    // THERMAL MONOCHROME CONTRAST / DITHER TUNER
                    if (logoBitmap != null && showLogoOnThermal) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Thermal Contrast / Dither Threshold", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    Text("${thermalThreshold.toInt()} / 255", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                                }

                                Slider(
                                    value = thermalThreshold,
                                    onValueChange = { thermalThreshold = it },
                                    valueRange = 50f..200f,
                                    steps = 30
                                )

                                Text(
                                    "Live 1-Bit Thermal Simulation Preview (What the thermal head prints):",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                if (simulatedThermalBitmap != null) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(80.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color.White)
                                            .border(BorderStroke(1.dp, Color.Gray), RoundedCornerShape(6.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Image(
                                            bitmap = simulatedThermalBitmap.asImageBitmap(),
                                            contentDescription = "Simulated Thermal Raster",
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .padding(6.dp),
                                            contentScale = ContentScale.Fit
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // SECTION 2: ENTERPRISE BUSINESS & LEGAL PROFILE
        // -------------------------------------------------------------
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Business, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.width(8.dp))
                        Text("Business & Legal Information", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedTextField(
                        value = bizName,
                        onValueChange = { bizName = it },
                        label = { Text("Enterprise / Clinic Name") },
                        leadingIcon = { Icon(Icons.Default.Store, null) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = bizTagline,
                        onValueChange = { bizTagline = it },
                        label = { Text("Business Tagline / Subtitle") },
                        leadingIcon = { Icon(Icons.Default.Info, null) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = bizAddress,
                            onValueChange = { bizAddress = it },
                            label = { Text("Street Address") },
                            modifier = Modifier.weight(1.4f),
                            shape = RoundedCornerShape(10.dp)
                        )
                        OutlinedTextField(
                            value = bizCity,
                            onValueChange = { bizCity = it },
                            label = { Text("City / Region") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = bizPhone,
                            onValueChange = { bizPhone = it },
                            label = { Text("Phone / WhatsApp") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        )
                        OutlinedTextField(
                            value = bizEmail,
                            onValueChange = { bizEmail = it },
                            label = { Text("Support Email") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = bizNtn,
                            onValueChange = { bizNtn = it },
                            label = { Text("NTN Number") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        )
                        OutlinedTextField(
                            value = bizStrn,
                            onValueChange = { bizStrn = it },
                            label = { Text("STRN Number") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = bizPosId,
                            onValueChange = { bizPosId = it },
                            label = { Text("FBR POS ID") },
                            modifier = Modifier.weight(1.2f),
                            shape = RoundedCornerShape(10.dp)
                        )
                        OutlinedTextField(
                            value = bizCurrency,
                            onValueChange = { bizCurrency = it },
                            label = { Text("Currency Symbol") },
                            modifier = Modifier.weight(0.8f),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = defaultTaxStr,
                            onValueChange = { defaultTaxStr = it },
                            label = { Text("Default Tax %") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        )
                        OutlinedTextField(
                            value = loyaltyPer100Str,
                            onValueChange = { loyaltyPer100Str = it },
                            label = { Text("Loyalty Pts / 100") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }

                    OutlinedTextField(
                        value = receiptFooter,
                        onValueChange = { receiptFooter = it },
                        label = { Text("Receipt Footer Message / Warranty Note") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            }
        }

        // -------------------------------------------------------------
        // SECTION 3: PRINTER & HARDWARE INTEGRATION
        // -------------------------------------------------------------
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Print, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(Modifier.width(8.dp))
                            Text("Bluetooth & Paper Setup", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }

                        IconButton(
                            onClick = {
                                availablePrinters = BluetoothThermalPrinterHelper.getAvailablePrinters(context)
                                Toast.makeText(context, "Found ${availablePrinters.size} paired devices", Toast.LENGTH_SHORT).show()
                            }
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh paired printers")
                        }
                    }

                    // Paper Presets
                    Text("Default Printing Paper Format:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf(
                            BluetoothThermalPrinterHelper.PAPER_58MM to "58mm Thermal",
                            BluetoothThermalPrinterHelper.PAPER_80MM to "80mm Thermal",
                            BluetoothThermalPrinterHelper.PAPER_A4 to "A4 Page / PDF"
                        ).forEach { (formatKey, label) ->
                            val isSelected = selectedPaperSize == formatKey
                            FilterChip(
                                selected = isSelected,
                                onClick = { selectedPaperSize = formatKey },
                                label = { Text(label, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Paired Printers List
                    Text("Paired Bluetooth Printer (${availablePrinters.size} available):", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    if (availablePrinters.isEmpty()) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                "No paired Bluetooth printers found. Pair your thermal printer in Android Bluetooth Settings first, then tap refresh above.",
                                fontSize = 11.sp,
                                modifier = Modifier.padding(10.dp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            availablePrinters.forEach { device ->
                                val isSelected = selectedPrinterAddress == device.address
                                Surface(
                                    onClick = { selectedPrinterAddress = device.address },
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                    border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary) else null,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column {
                                            Text(device.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                            Text(device.address, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                        if (isSelected) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = "Selected", tint = MaterialTheme.colorScheme.primary)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // TEST PRINT WITH LOGO
                    FilledTonalButton(
                        onClick = {
                            val sampleItems = listOf(
                                PosOrderItem("1", "TEST-01", "1", "Panadol Extra 500mg", 2, 180.0),
                                PosOrderItem("2", "TEST-01", "2", "Multivitamin & Zinc 120ml", 1, 240.0)
                            )
                            val a4SampleText = BluetoothThermalPrinterHelper.buildA4InvoiceText(
                                businessName = bizName.ifBlank { "AL-TAHIR HEALTHCARE & ENTERPRISE" },
                                tagline = bizTagline.ifBlank { "Official Test Receipt" },
                                address = "${bizAddress.ifBlank { "Hospital Road" }}, ${bizCity.ifBlank { "Buner" }}",
                                phone = bizPhone.ifBlank { "+92 300 1234567" },
                                orderId = "TEST-9999",
                                dateStr = SimpleDateFormat("dd-MMM-yyyy hh:mm a", Locale.getDefault()).format(Date()),
                                clientName = "Test Client / Quality Check",
                                items = sampleItems,
                                subtotal = 600.0,
                                discount = 0.0,
                                tax = 0.0,
                                total = 600.0,
                                paymentMethod = "Test Run",
                                footerNote = "Test print verification with logo rendering."
                            )

                            if (selectedPaperSize == BluetoothThermalPrinterHelper.PAPER_A4 || selectedPrinterAddress.isBlank()) {
                                BluetoothThermalPrinterHelper.printA4ViaSystem(
                                    context = context,
                                    jobName = "OmniPOS_Test_Print",
                                    documentTitle = "Test_Receipt_With_Logo",
                                    contentText = a4SampleText,
                                    logoBitmap = logoBitmap,
                                    showLogo = showLogoOnInvoice
                                )
                            } else {
                                coroutineScope.launch(Dispatchers.IO) {
                                    val payload = BluetoothThermalPrinterHelper.buildPosReceiptPayload(
                                        businessName = bizName.ifBlank { "AL-TAHIR HEALTHCARE & ENTERPRISE" },
                                        tagline = bizTagline.ifBlank { "Official Test Receipt" },
                                        address = "${bizAddress.ifBlank { "Hospital Road" }}, ${bizCity.ifBlank { "Buner" }}",
                                        phone = bizPhone.ifBlank { "+92 300 1234567" },
                                        orderId = "TEST-9999",
                                        dateStr = SimpleDateFormat("dd-MMM-yyyy hh:mm a", Locale.getDefault()).format(Date()),
                                        items = sampleItems,
                                        subtotal = 600.0,
                                        discount = 0.0,
                                        tax = 0.0,
                                        total = 600.0,
                                        paymentMethod = "Test Run",
                                        footerNote = receiptFooter.ifBlank { "Test print verification with logo rendering." },
                                        logoBitmap = logoBitmap,
                                        showLogo = showLogoOnThermal,
                                        threshold = thermalThreshold.toInt(),
                                        autoOpenDrawer = autoKickDrawer
                                    )
                                    val (success, msg) = BluetoothThermalPrinterHelper.printPayload(context, selectedPrinterAddress, payload)
                                    withContext(Dispatchers.Main) {
                                        Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                                    }
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.ReceiptLong, null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("🖨️ Test Print Sample Bill (with Logo)", fontWeight = FontWeight.Bold)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 10.dp)) {
                            Text("Auto-Kick RJ11 Cash Drawer", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Triggers drawer solenoid pulse after every Bluetooth thermal receipt print", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Switch(checked = autoKickDrawer, onCheckedChange = { autoKickDrawer = it })
                    }

                    OutlinedButton(
                        onClick = {
                            coroutineScope.launch(Dispatchers.IO) {
                                val (_, msg) = BluetoothThermalPrinterHelper.openCashDrawer(context, selectedPrinterAddress)
                                withContext(Dispatchers.Main) {
                                    Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("⚡ Test Kick RJ11 Cash Drawer", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // SECTION 4: ENTERPRISE BACKUP (.JSON) & BULK CATALOG (.CSV)
        // -------------------------------------------------------------
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Backup, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.width(8.dp))
                        Text("Enterprise Backup & Bulk CSV Catalog", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        "Export a full snapshot of all products, bills, Khata ledgers, suppliers, expenses, drawer audits & staff (JSON) or manage inventory via Excel CSV.",
                        fontSize = 11.5.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                viewModel.exportPosBackupJson { json ->
                                    if (json != null) {
                                        val stamp = SimpleDateFormat("yyyyMMdd_HHmm", Locale.US).format(Date())
                                        BluetoothThermalPrinterHelper.sharePosExportFile(
                                            context = context,
                                            fileName = "OmniPOS_Backup_$stamp.json",
                                            content = json,
                                            mimeType = "application/json"
                                        )
                                    } else {
                                        Toast.makeText(context, "Backup export failed", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Export .JSON", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = { jsonRestoreLauncher.launch("*/*") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Restore .JSON", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilledTonalButton(
                            onClick = {
                                viewModel.exportPosProductsCsv { csv ->
                                    if (csv != null) {
                                        val stamp = SimpleDateFormat("yyyyMMdd_HHmm", Locale.US).format(Date())
                                        BluetoothThermalPrinterHelper.sharePosExportFile(
                                            context = context,
                                            fileName = "OmniPOS_Catalog_$stamp.csv",
                                            content = csv,
                                            mimeType = "text/csv"
                                        )
                                    } else {
                                        Toast.makeText(context, "CSV export failed", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Export CSV Stock", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = { csvImportLauncher.launch("*/*") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Import CSV Stock", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // SAVE & APPLY FLOATING ACTION
        // -------------------------------------------------------------
        item {
            Button(
                onClick = { saveSettings() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Save & Apply Enterprise Settings", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(30.dp))
        }
    }
}
