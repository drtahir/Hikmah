package com.drtahir.studentkit.data

import kotlinx.coroutines.flow.Flow
import org.json.JSONArray
import org.json.JSONObject

class StudentKitRepository(private val dao: StudentKitDao) {

    // --- EXPENSES ---
    val allExpenses: Flow<List<Expense>> = dao.getAllExpenses()
    suspend fun insertExpense(expense: Expense) = dao.insertExpense(expense)
    suspend fun deleteExpenseById(id: String) = dao.deleteExpenseById(id)
    fun getExpensesByMonth(yearMonth: String): Flow<List<Expense>> = dao.getExpensesByMonth(yearMonth)

    // --- INCOME ---
    val allIncome: Flow<List<Income>> = dao.getAllIncome()
    suspend fun insertIncome(income: Income) = dao.insertIncome(income)
    suspend fun deleteIncomeById(id: String) = dao.deleteIncomeById(id)
    fun getIncomeByMonth(yearMonth: String): Flow<List<Income>> = dao.getIncomeByMonth(yearMonth)

    // --- BILLS ---
    val allBills: Flow<List<Bill>> = dao.getAllBills()
    val allUnpaidBills: Flow<List<Bill>> = dao.getAllUnpaidBills()
    suspend fun insertBill(bill: Bill) = dao.insertBill(bill)
    suspend fun setBillPaidStatus(id: String, isPaid: Int) = dao.setBillPaidStatus(id, isPaid)
    suspend fun deleteBillById(id: String) = dao.deleteBillById(id)

    // --- BC COMMITTEES ---
    val allCommittees: Flow<List<BcCommittee>> = dao.getAllCommittees()
    suspend fun insertCommittee(committee: BcCommittee) = dao.insertCommittee(committee)
    suspend fun deleteCommitteeById(id: String) = dao.deleteCommitteeById(id)

    // --- BC MEMBERS ---
    fun getMembersByCommittee(committeeId: String): Flow<List<BcMember>> = dao.getMembersByCommittee(committeeId)
    suspend fun insertMembers(members: List<BcMember>) = dao.insertMembers(members)
    suspend fun updateMemberReceivedStatus(memberId: String, hasReceived: Int) = dao.updateMemberReceivedStatus(memberId, hasReceived)

    // --- BC PAYMENTS ---
    fun getPaymentsByCommittee(committeeId: String): Flow<List<BcPayment>> = dao.getPaymentsByCommittee(committeeId)
    fun getBCPaymentsForMonth(committeeId: String, month: String): Flow<List<BcPayment>> = dao.getBCPaymentsForMonth(committeeId, month)
    suspend fun insertPayments(payments: List<BcPayment>) = dao.insertPayments(payments)
    suspend fun setPaymentPaidStatus(paymentId: String, isPaid: Int, paidDate: String?) = dao.setPaymentPaidStatus(paymentId, isPaid, paidDate)

    // --- BC HISTORY ---
    fun getHistoryByCommittee(committeeId: String): Flow<List<BcHistory>> = dao.getHistoryByCommittee(committeeId)
    suspend fun insertHistory(history: BcHistory) = dao.insertHistory(history)
    suspend fun getAllMembersSuspend(): List<BcMember> = dao.getAllMembersSuspend()
    suspend fun getAllPaymentsSuspend(): List<BcPayment> = dao.getAllPaymentsSuspend()
    suspend fun getAllHistorySuspend(): List<BcHistory> = dao.getAllHistorySuspend()

    // --- LOANS ---
    val allLoans: Flow<List<Loan>> = dao.getAllLoans()
    suspend fun insertLoan(loan: Loan) = dao.insertLoan(loan)
    suspend fun setLoanSettledStatus(id: String, isSettled: Int) = dao.setLoanSettledStatus(id, isSettled)
    suspend fun deleteLoanById(id: String) = dao.deleteLoanById(id)

    // --- SAVINGS GOALS ---
    val allSavingsGoals: Flow<List<SavingsGoal>> = dao.getAllSavingsGoals()
    suspend fun insertSavingsGoal(goal: SavingsGoal) = dao.insertSavingsGoal(goal)
    suspend fun updateSavingsGoalAmount(id: String, amount: Double) = dao.updateSavingsGoalAmount(id, amount)
    suspend fun deleteSavingsGoalById(id: String) = dao.deleteSavingsGoalById(id)

    // --- NOTES ---
    val allNotes: Flow<List<NoteEntry>> = dao.getAllNotes()
    suspend fun insertNote(note: NoteEntry) = dao.insertNote(note)
    suspend fun deleteNote(note: NoteEntry) = dao.deleteNote(note)
    suspend fun deleteNoteById(id: String) = dao.deleteNoteById(id)

    // --- TASKS ---
    val allTasks: Flow<List<TaskEntry>> = dao.getAllTasks()
    suspend fun insertTask(task: TaskEntry) = dao.insertTask(task)
    suspend fun setTaskDoneStatus(id: String, isDone: Int) = dao.setTaskDoneStatus(id, isDone)
    suspend fun deleteTaskById(id: String) = dao.deleteTaskById(id)

    // --- TIMETABLE ---
    val allTimetableClasses: Flow<List<TimetableEntry>> = dao.getAllTimetableClasses()
    suspend fun insertTimetableClass(classEntry: TimetableEntry) = dao.insertTimetableClass(classEntry)
    suspend fun deleteTimetableClassById(id: String) = dao.deleteTimetableClassById(id)

    // --- PASSWORDS ---
    val allPasswords: Flow<List<PasswordEntry>> = dao.getAllPasswords()
    suspend fun insertPassword(password: PasswordEntry) = dao.insertPassword(password)
    suspend fun deletePasswordById(id: String) = dao.deletePasswordById(id)

    // --- TEMP PDF IMAGES ---
    val allTempPdfImages: Flow<List<TempPdfImage>> = dao.getAllTempPdfImages()
    suspend fun insertTempPdfImage(image: TempPdfImage) = dao.insertTempPdfImage(image)
    suspend fun deleteTempPdfImageById(id: String) = dao.deleteTempPdfImageById(id)
    suspend fun clearAllTempPdfImages() = dao.clearAllTempPdfImages()

    // --- INTRUDER LOGS ---
    val allIntruderLogs: Flow<List<IntruderLog>> = dao.getAllIntruderLogs()
    suspend fun insertIntruderLog(log: IntruderLog) = dao.insertIntruderLog(log)
    suspend fun deleteIntruderLogById(id: String) = dao.deleteIntruderLogById(id)
    suspend fun clearAllIntruderLogs() = dao.clearAllIntruderLogs()

    // --- PIN VAULT ---
    val allPinVaultEntries: Flow<List<PinVaultEntry>> = dao.getAllPinVaultEntries()
    suspend fun insertPinVaultEntry(entry: PinVaultEntry) = dao.insertPinVaultEntry(entry)
    suspend fun deletePinVaultEntryById(id: String) = dao.deletePinVaultEntryById(id)

    // --- PHOTO VAULT ---
    val allPhotoVaultEntries: Flow<List<PhotoVaultEntry>> = dao.getAllPhotoVaultEntries()
    suspend fun insertPhotoVaultEntry(entry: PhotoVaultEntry) = dao.insertPhotoVaultEntry(entry)
    suspend fun deletePhotoVaultEntryById(id: String) = dao.deletePhotoVaultEntryById(id)

    // --- PRIVATE NOTES ---
    val allPrivateNoteEntries: Flow<List<PrivateNoteEntry>> = dao.getAllPrivateNoteEntries()
    suspend fun insertPrivateNoteEntry(entry: PrivateNoteEntry) = dao.insertPrivateNoteEntry(entry)
    suspend fun deletePrivateNoteEntryById(id: String) = dao.deletePrivateNoteEntryById(id)

    // --- WIFI MONITOR ---
    val allWifiDevices: Flow<List<WifiDevice>> = dao.getAllWifiDevices()
    suspend fun insertWifiDevice(device: WifiDevice) = dao.insertWifiDevice(device)
    suspend fun renameWifiDevice(mac: String, customName: String?, isKnown: Int) = dao.renameWifiDevice(mac, customName, isKnown)
    suspend fun getWifiDeviceByMac(mac: String): WifiDevice? = dao.getWifiDeviceByMac(mac)
    suspend fun deleteWifiDeviceByMac(mac: String) = dao.deleteWifiDeviceByMac(mac)

    val allSpeedTestHistory: Flow<List<SpeedTestHistory>> = dao.getAllSpeedTestHistory()
    suspend fun insertSpeedTestHistory(history: SpeedTestHistory) = dao.insertSpeedTestHistory(history)
    suspend fun clearSpeedTestHistory() = dao.clearSpeedTestHistory()

    // --- CACHED QURAN ---
    suspend fun getAllCachedQuranVersesSuspend(): List<CachedQuranVerse> = dao.getAllCachedQuranVersesSuspend()
    fun getCachedVersesForSurah(surahNumber: Int): Flow<List<CachedQuranVerse>> = dao.getCachedVersesForSurah(surahNumber)
    fun getCachedVersesForPage(pageNumber: Int): Flow<List<CachedQuranVerse>> = dao.getCachedVersesForPage(pageNumber)
    suspend fun insertQuranVerses(verses: List<CachedQuranVerse>) = dao.insertQuranVerses(verses)
    suspend fun getCachedQuranVersesCount(): Int = dao.getCachedQuranVersesCount()
    suspend fun clearCachedQuran() = dao.clearCachedQuran()

    // --- CACHED OFFLINE EXAM QUESTIONS ---
    fun getCachedQuestions(categoryType: String): Flow<List<CachedOfflineQuestion>> = dao.getCachedQuestions(categoryType)
    suspend fun insertCachedQuestions(questions: List<CachedOfflineQuestion>) = dao.insertCachedQuestions(questions)
    suspend fun getCachedQuestionsCount(categoryType: String): Int = dao.getCachedQuestionsCount(categoryType)
    suspend fun clearCachedQuestions(categoryType: String) = dao.clearCachedQuestions(categoryType)
    suspend fun updateQuestionSavedAnswer(id: String, answer: Int) = dao.updateQuestionSavedAnswer(id, answer)
    suspend fun updateQuestionBookmark(id: String, isBookmarked: Boolean) = dao.updateQuestionBookmark(id, isBookmarked)
    // --- POS SYSTEM ---
    val allPosProducts = dao.getAllPosProducts()
    suspend fun insertPosProduct(product: PosProduct) = dao.insertPosProduct(product)
    suspend fun deletePosProductById(id: String) = dao.deletePosProductById(id)
    suspend fun incrementPosProductStock(productId: String, qty: Int) = dao.incrementPosProductStock(productId, qty)
    suspend fun decrementPosProductStock(productId: String, qty: Int) = dao.decrementPosProductStock(productId, qty)

    val allPosClients = dao.getAllPosClients()
    suspend fun insertPosClient(client: PosClient) = dao.insertPosClient(client)
    suspend fun deletePosClientById(id: String) = dao.deletePosClientById(id)
    suspend fun adjustPosClientLedger(clientId: String, balanceDelta: Double, spentDelta: Double, pointsDelta: Int) =
        dao.adjustPosClientLedger(clientId, balanceDelta, spentDelta, pointsDelta)

    val allPosOrders = dao.getAllPosOrders()
    val allPosOrderItems = dao.getAllPosOrderItems()
    suspend fun insertPosOrder(order: PosOrder) = dao.insertPosOrder(order)
    suspend fun completePosCheckout(order: PosOrder, items: List<PosOrderItem>, redeemedPoints: Int = 0) =
        dao.completePosCheckout(order, items, redeemedPoints)
    suspend fun updatePosOrderStatus(orderId: String, status: String) = dao.updatePosOrderStatus(orderId, status)
    suspend fun getPosOrderItemsSuspend(orderId: String) = dao.getPosOrderItemsSuspend(orderId)
    suspend fun updatePosOrderItemReturnedQty(itemId: String, returnedQty: Int) = dao.updatePosOrderItemReturnedQty(itemId, returnedQty)
    suspend fun deletePosOrderById(id: String) {
        dao.deletePosOrderItemsByOrderId(id)
        dao.deletePosOrderById(id)
    }

    fun getPosOrderItems(orderId: String) = dao.getPosOrderItems(orderId)
    suspend fun insertPosOrderItem(item: PosOrderItem) = dao.insertPosOrderItem(item)

    val allPosKhataTransactions = dao.getAllPosKhataTransactions()
    suspend fun insertPosKhataTransaction(tx: PosKhataTransaction) = dao.insertPosKhataTransaction(tx)
    suspend fun deletePosKhataTransactionById(id: String) = dao.deletePosKhataTransactionById(id)
    suspend fun settlePosKhataPayment(
        client: PosClient,
        amount: Double,
        paymentMethod: String,
        dateStr: String,
        note: String
    ) = dao.settlePosKhataPayment(client, amount, paymentMethod, dateStr, note)

    val allPosPurchaseOrders = dao.getAllPosPurchaseOrders()
    suspend fun receivePurchaseOrderGrn(po: PosPurchaseOrder, stockUpdates: List<Triple<String, Int, Double>>) =
        dao.receivePurchaseOrderGrn(po, stockUpdates)
    suspend fun deletePosPurchaseOrderById(id: String) = dao.deletePosPurchaseOrderById(id)

    val allPosExpenses = dao.getAllPosExpenses()
    suspend fun insertPosExpense(expense: PosExpense) = dao.insertPosExpense(expense)
    suspend fun deletePosExpenseById(id: String) = dao.deletePosExpenseById(id)

    val allPosCashDrawers = dao.getAllPosCashDrawers()
    suspend fun insertPosCashDrawerSession(session: PosCashDrawerSession) = dao.insertPosCashDrawerSession(session)

    // --- POS EMPLOYEES & STAFF REPOSITORY ---
    val allPosEmployees = dao.getAllPosEmployees()
    suspend fun insertPosEmployee(employee: PosEmployee) = dao.insertPosEmployee(employee)
    suspend fun deletePosEmployeeById(id: String) = dao.deletePosEmployeeById(id)
    suspend fun getPosEmployeeById(id: String) = dao.getPosEmployeeById(id)
    suspend fun getPosEmployeeByPin(pin: String) = dao.getPosEmployeeByPin(pin)

    val allPosEmployeeShifts = dao.getAllPosEmployeeShifts()
    fun getPosEmployeeShiftsByEmployee(employeeId: String) = dao.getPosEmployeeShiftsByEmployee(employeeId)
    fun getOpenPosEmployeeShifts() = dao.getOpenPosEmployeeShifts()
    suspend fun insertPosEmployeeShift(shift: PosEmployeeShifts) = dao.insertPosEmployeeShift(shift)
    suspend fun deletePosEmployeeShiftById(id: String) = dao.deletePosEmployeeShiftById(id)

    val allPosEmployeePayouts = dao.getAllPosEmployeePayouts()
    fun getPosEmployeePayoutsByEmployee(employeeId: String) = dao.getPosEmployeePayoutsByEmployee(employeeId)
    suspend fun insertPosEmployeePayout(payout: PosEmployeePayout) = dao.insertPosEmployeePayout(payout)
    suspend fun deletePosEmployeePayoutById(id: String) = dao.deletePosEmployeePayoutById(id)

    // --- PACK C: FULL POS ENTERPRISE BACKUP & BULK CSV ---
    suspend fun exportPosBackupJson(): String {
        val root = JSONObject()
        root.put("schema", "OmniPOS-Enterprise-v12")
        root.put("exportedAt", java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.US).format(java.util.Date()))

        val prodArr = JSONArray()
        dao.getAllPosProductsSuspend().forEach { p ->
            prodArr.put(JSONObject().apply {
                put("id", p.id); put("name", p.name); put("category", p.category)
                put("price", p.price); put("stock", p.stock); put("unit", p.unit)
                put("costPrice", p.costPrice); put("sku", p.sku); put("barcode", p.barcode)
                put("minStockAlert", p.minStockAlert); put("batchNumber", p.batchNumber)
                put("expiryDate", p.expiryDate); put("wholesalePrice", p.wholesalePrice)
                put("defaultTaxRate", p.defaultTaxRate)
            })
        }
        root.put("pos_products", prodArr)

        val clientArr = JSONArray()
        dao.getAllPosClientsSuspend().forEach { c ->
            clientArr.put(JSONObject().apply {
                put("id", c.id); put("name", c.name); put("phone", c.phone)
                put("email", c.email); put("address", c.address); put("type", c.type)
                put("creditBalance", c.creditBalance); put("creditLimit", c.creditLimit)
                put("loyaltyPoints", c.loyaltyPoints); put("totalSpent", c.totalSpent)
            })
        }
        root.put("pos_clients", clientArr)

        val ordArr = JSONArray()
        dao.getAllPosOrdersSuspend().forEach { o ->
            ordArr.put(JSONObject().apply {
                put("id", o.id); put("date", o.date); put("clientId", o.clientId ?: JSONObject.NULL)
                put("subtotal", o.subtotal); put("tax", o.tax); put("discount", o.discount); put("total", o.total)
                put("documentType", o.documentType); put("paymentMethod", o.paymentMethod)
                put("paymentBreakdown", o.paymentBreakdown); put("paidAmount", o.paidAmount)
                put("changeDue", o.changeDue); put("dueAmount", o.dueAmount); put("status", o.status)
                put("cashierName", o.cashierName); put("loyaltyEarned", o.loyaltyEarned)
                put("orderMode", o.orderMode); put("tableOrRef", o.tableOrRef)
            })
        }
        root.put("pos_orders", ordArr)

        val itemArr = JSONArray()
        dao.getAllPosOrderItemsSuspend().forEach { it ->
            itemArr.put(JSONObject().apply {
                put("id", it.id); put("orderId", it.orderId); put("productId", it.productId)
                put("name", it.name); put("quantity", it.quantity); put("price", it.price)
                put("costPrice", it.costPrice); put("returnedQty", it.returnedQty)
            })
        }
        root.put("pos_order_items", itemArr)

        val khtArr = JSONArray()
        dao.getAllPosKhataTransactionsSuspend().forEach { k ->
            khtArr.put(JSONObject().apply {
                put("id", k.id); put("clientId", k.clientId); put("clientName", k.clientName)
                put("date", k.date); put("type", k.type); put("amount", k.amount)
                put("referenceId", k.referenceId); put("paymentMethod", k.paymentMethod); put("note", k.note)
            })
        }
        root.put("pos_khata_transactions", khtArr)

        val poArr = JSONArray()
        dao.getAllPosPurchaseOrdersSuspend().forEach { po ->
            poArr.put(JSONObject().apply {
                put("id", po.id); put("date", po.date); put("supplierId", po.supplierId ?: JSONObject.NULL)
                put("supplierName", po.supplierName); put("itemsSummary", po.itemsSummary)
                put("totalCost", po.totalCost); put("paidAmount", po.paidAmount)
                put("dueAmount", po.dueAmount); put("status", po.status); put("note", po.note)
            })
        }
        root.put("pos_purchase_orders", poArr)

        val expArr = JSONArray()
        dao.getAllPosExpensesSuspend().forEach { e ->
            expArr.put(JSONObject().apply {
                put("id", e.id); put("date", e.date); put("category", e.category)
                put("amount", e.amount); put("paymentSource", e.paymentSource); put("note", e.note)
            })
        }
        root.put("pos_expenses", expArr)

        val drwArr = JSONArray()
        dao.getAllPosCashDrawersSuspend().forEach { d ->
            drwArr.put(JSONObject().apply {
                put("id", d.id); put("openedAt", d.openedAt)
                put("closedAt", d.closedAt ?: JSONObject.NULL)
                put("openedBy", d.openedBy); put("openingFloat", d.openingFloat)
                put("expectedCash", d.expectedCash); put("countedCash", d.countedCash)
                put("variance", d.variance); put("notes", d.notes); put("status", d.status)
            })
        }
        root.put("pos_cash_drawer_sessions", drwArr)

        val empArr = JSONArray()
        dao.getAllPosEmployeesSuspend().forEach { em ->
            empArr.put(JSONObject().apply {
                put("id", em.id); put("fullName", em.fullName); put("role", em.role)
                put("pinCode", em.pinCode); put("phone", em.phone); put("email", em.email)
                put("nationalIdOrCnic", em.nationalIdOrCnic)
                put("hourlyOrBaseSalary", em.hourlyOrBaseSalary)
                put("salaryType", em.salaryType); put("commissionPercent", em.commissionPercent)
                put("isActive", em.isActive); put("joinedDate", em.joinedDate)
                put("permissionsJoined", em.permissionsJoined)
            })
        }
        root.put("pos_employees", empArr)

        return root.toString(2)
    }

    suspend fun restorePosBackupJson(jsonString: String): Pair<Boolean, String> {
        return try {
            val root = JSONObject(jsonString)
            val prods = mutableListOf<PosProduct>()
            root.optJSONArray("pos_products")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    prods.add(PosProduct(
                        id = o.getString("id"), name = o.optString("name", "Item"),
                        category = o.optString("category", "General"), price = o.optDouble("price", 0.0),
                        stock = o.optInt("stock", 0), unit = o.optString("unit", "Unit"),
                        costPrice = o.optDouble("costPrice", 0.0), sku = o.optString("sku", ""),
                        barcode = o.optString("barcode", ""), minStockAlert = o.optInt("minStockAlert", 10),
                        batchNumber = o.optString("batchNumber", ""), expiryDate = o.optString("expiryDate", ""),
                        wholesalePrice = o.optDouble("wholesalePrice", 0.0),
                        defaultTaxRate = o.optDouble("defaultTaxRate", 0.0)
                    ))
                }
            }
            val clients = mutableListOf<PosClient>()
            root.optJSONArray("pos_clients")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    clients.add(PosClient(
                        id = o.getString("id"), name = o.optString("name", "Client"),
                        phone = o.optString("phone", ""), email = o.optString("email", ""),
                        address = o.optString("address", ""), type = o.optString("type", "Customer"),
                        creditBalance = o.optDouble("creditBalance", 0.0),
                        creditLimit = o.optDouble("creditLimit", 50000.0),
                        loyaltyPoints = o.optInt("loyaltyPoints", 0),
                        totalSpent = o.optDouble("totalSpent", 0.0)
                    ))
                }
            }
            val orders = mutableListOf<PosOrder>()
            root.optJSONArray("pos_orders")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    orders.add(PosOrder(
                        id = o.getString("id"), date = o.optString("date", ""),
                        clientId = if (o.isNull("clientId")) null else o.optString("clientId"),
                        subtotal = o.optDouble("subtotal", 0.0), tax = o.optDouble("tax", 0.0),
                        discount = o.optDouble("discount", 0.0), total = o.optDouble("total", 0.0),
                        documentType = o.optString("documentType", "Invoice"),
                        paymentMethod = o.optString("paymentMethod", "Cash"),
                        paymentBreakdown = o.optString("paymentBreakdown", ""),
                        paidAmount = o.optDouble("paidAmount", 0.0),
                        changeDue = o.optDouble("changeDue", 0.0), dueAmount = o.optDouble("dueAmount", 0.0),
                        status = o.optString("status", "Paid"),
                        cashierName = o.optString("cashierName", "Administrator"),
                        loyaltyEarned = o.optInt("loyaltyEarned", 0),
                        orderMode = o.optString("orderMode", "Counter"),
                        tableOrRef = o.optString("tableOrRef", "")
                    ))
                }
            }
            val orderItems = mutableListOf<PosOrderItem>()
            root.optJSONArray("pos_order_items")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    orderItems.add(PosOrderItem(
                        id = o.getString("id"), orderId = o.getString("orderId"),
                        productId = o.optString("productId", ""), name = o.optString("name", ""),
                        quantity = o.optInt("quantity", 1), price = o.optDouble("price", 0.0),
                        costPrice = o.optDouble("costPrice", 0.0), returnedQty = o.optInt("returnedQty", 0)
                    ))
                }
            }
            val khataTx = mutableListOf<PosKhataTransaction>()
            root.optJSONArray("pos_khata_transactions")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    khataTx.add(PosKhataTransaction(
                        id = o.getString("id"), clientId = o.optString("clientId", ""),
                        clientName = o.optString("clientName", ""), date = o.optString("date", ""),
                        type = o.optString("type", "Credit Sale"), amount = o.optDouble("amount", 0.0),
                        referenceId = o.optString("referenceId", ""), paymentMethod = o.optString("paymentMethod", "Cash"),
                        note = o.optString("note", "")
                    ))
                }
            }
            val pos = mutableListOf<PosPurchaseOrder>()
            root.optJSONArray("pos_purchase_orders")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    pos.add(PosPurchaseOrder(
                        id = o.getString("id"), date = o.optString("date", ""),
                        supplierId = if (o.isNull("supplierId")) null else o.optString("supplierId"),
                        supplierName = o.optString("supplierName", ""), itemsSummary = o.optString("itemsSummary", ""),
                        totalCost = o.optDouble("totalCost", 0.0), paidAmount = o.optDouble("paidAmount", 0.0),
                        dueAmount = o.optDouble("dueAmount", 0.0), status = o.optString("status", "Received"),
                        note = o.optString("note", "")
                    ))
                }
            }
            val exps = mutableListOf<PosExpense>()
            root.optJSONArray("pos_expenses")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    exps.add(PosExpense(
                        id = o.getString("id"), date = o.optString("date", ""),
                        category = o.optString("category", "Utilities"), amount = o.optDouble("amount", 0.0),
                        paymentSource = o.optString("paymentSource", "Cash Drawer"), note = o.optString("note", "")
                    ))
                }
            }
            val drawers = mutableListOf<PosCashDrawerSession>()
            root.optJSONArray("pos_cash_drawer_sessions")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    drawers.add(PosCashDrawerSession(
                        id = o.getString("id"), openedAt = o.optString("openedAt", ""),
                        closedAt = if (o.isNull("closedAt")) null else o.optString("closedAt"),
                        openedBy = o.optString("openedBy", "Administrator"),
                        openingFloat = o.optDouble("openingFloat", 0.0),
                        expectedCash = o.optDouble("expectedCash", 0.0),
                        countedCash = o.optDouble("countedCash", 0.0),
                        variance = o.optDouble("variance", 0.0),
                        notes = o.optString("notes", ""), status = o.optString("status", "CLOSED")
                    ))
                }
            }
            val emps = mutableListOf<PosEmployee>()
            root.optJSONArray("pos_employees")?.let { arr ->
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    emps.add(PosEmployee(
                        id = o.getString("id"), fullName = o.optString("fullName", "Staff"),
                        role = o.optString("role", "Cashier"), pinCode = o.optString("pinCode", "1234"),
                        phone = o.optString("phone", ""), email = o.optString("email", ""),
                        nationalIdOrCnic = o.optString("nationalIdOrCnic", ""),
                        hourlyOrBaseSalary = o.optDouble("hourlyOrBaseSalary", 0.0),
                        salaryType = o.optString("salaryType", "Monthly Fixed"),
                        commissionPercent = o.optDouble("commissionPercent", 0.0),
                        isActive = o.optBoolean("isActive", true), joinedDate = o.optString("joinedDate", ""),
                        permissionsJoined = o.optString("permissionsJoined", "TERMINAL")
                    ))
                }
            }
            dao.restorePosBackupBatch(prods, clients, orders, orderItems, khataTx, pos, exps, drawers, emps)
            Pair(true, "Restored ${prods.size} products, ${orders.size} bills, ${clients.size} parties!")
        } catch (e: Exception) {
            Pair(false, "Backup restore failed: ${e.message}")
        }
    }

    suspend fun exportPosProductsCsv(): String {
        val sb = StringBuilder()
        sb.appendLine("id,name,category,retail_price,wholesale_price,cost_price,stock,unit,sku,barcode,min_stock_alert,batch_number,expiry_date")
        dao.getAllPosProductsSuspend().forEach { p ->
            fun esc(v: String) = "\"${v.replace("\"", "\"\"")}\""
            sb.appendLine("${esc(p.id)},${esc(p.name)},${esc(p.category)},${p.price},${p.wholesalePrice},${p.costPrice},${p.stock},${esc(p.unit)},${esc(p.sku)},${esc(p.barcode)},${p.minStockAlert},${esc(p.batchNumber)},${esc(p.expiryDate)}")
        }
        return sb.toString()
    }

    suspend fun importPosProductsCsv(csvText: String): Int {
        val lines = csvText.lines().map { it.trim() }.filter { it.isNotBlank() }
        var imported = 0
        lines.forEachIndexed { idx, line ->
            if (idx == 0 && line.lowercase().contains("name") && line.lowercase().contains("price")) return@forEachIndexed
            val cols = line.split(",").map { it.trim().removeSurrounding("\"") }
            if (cols.size >= 4) {
                val hasIdCol = cols.size >= 11 && cols[0].startsWith("prod_")
                val nameIdx = if (hasIdCol) 1 else 0
                val catIdx = if (hasIdCol) 2 else 1
                val priceIdx = if (hasIdCol) 3 else 2
                val wholesaleIdx = if (hasIdCol) 4 else -1
                val costIdx = if (hasIdCol) 5 else 3
                val stockIdx = if (hasIdCol) 6 else 4
                val unitIdx = if (hasIdCol) 7 else 5
                val skuIdx = if (hasIdCol) 8 else 6
                val barIdx = if (hasIdCol) 9 else 7
                val batchIdx = if (hasIdCol) 11 else 8
                val expIdx = if (hasIdCol) 12 else 9

                val nameVal = cols.getOrNull(nameIdx)?.trim().orEmpty()
                if (nameVal.isNotBlank()) {
                    val prod = PosProduct(
                        id = if (hasIdCol) cols[0] else "prod_csv_${System.currentTimeMillis() % 100000}_$idx",
                        name = nameVal,
                        category = cols.getOrNull(catIdx)?.ifBlank { "General" } ?: "General",
                        price = cols.getOrNull(priceIdx)?.toDoubleOrNull() ?: 100.0,
                        wholesalePrice = if (wholesaleIdx >= 0) cols.getOrNull(wholesaleIdx)?.toDoubleOrNull() ?: 0.0 else 0.0,
                        costPrice = cols.getOrNull(costIdx)?.toDoubleOrNull() ?: 0.0,
                        stock = cols.getOrNull(stockIdx)?.toIntOrNull() ?: 20,
                        unit = cols.getOrNull(unitIdx)?.ifBlank { "Piece" } ?: "Piece",
                        sku = cols.getOrNull(skuIdx) ?: "",
                        barcode = cols.getOrNull(barIdx) ?: "",
                        batchNumber = cols.getOrNull(batchIdx) ?: "",
                        expiryDate = cols.getOrNull(expIdx) ?: ""
                    )
                    dao.insertPosProduct(prod)
                    imported++
                }
            }
        }
        return imported
    }
}


