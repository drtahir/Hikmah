import { ScreenType, CategorySheetType } from '../types';

export interface ModuleItem {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  category: 'Finance' | 'Documents' | 'Utilities' | 'Study' | 'Medical' | 'Security';
  badge: string;
  colorHex: string;
  screen: ScreenType;
}

export const ALL_SUITE_MODULES: ModuleItem[] = [
  // Finance
  { id: 'expense', title: 'Expense Tracker', shortTitle: 'Expenses', description: 'Log & categorize daily cash outflows', category: 'Finance', badge: 'SQLITE', colorHex: '#E53935', screen: 'ExpenseTracker' },
  { id: 'income', title: 'Income Tracker', shortTitle: 'Income', description: 'Monitor income streams & earnings', category: 'Finance', badge: 'SQLITE', colorHex: '#43A047', screen: 'IncomeTracker' },
  { id: 'bills', title: 'Utility Bills', shortTitle: 'Bills', description: 'Reminders and logs for utility bills', category: 'Finance', badge: 'ALERTS', colorHex: '#1E88E5', screen: 'UtilityBills' },
  { id: 'zakat', title: 'Zakat Calculator', shortTitle: 'Zakat', description: 'Calculate wealth Zakat accurately', category: 'Finance', badge: 'ISLAMIC', colorHex: '#00897B', screen: 'ZakatCalculator' },
  { id: 'committee', title: 'BC Kommittees', shortTitle: 'Kameti', description: 'Kommittee lucky draw & cycle logs', category: 'Finance', badge: 'DRAWS', colorHex: '#8E24AA', screen: 'BcCommittee' },
  { id: 'loans', title: 'Loan Ledger', shortTitle: 'Loans', description: 'Track borrowings & lent payments', category: 'Finance', badge: 'TRACK', colorHex: '#D81B60', screen: 'LoanTracker' },
  { id: 'savings', title: 'Savings Goals', shortTitle: 'Savings', description: 'Target savings & deposit logs', category: 'Finance', badge: 'SAVINGS', colorHex: '#F4511E', screen: 'SavingsGoals' },
  { id: 'fin_backup', title: 'Finance Report', shortTitle: 'Reports', description: 'Statement & full JSON backup', category: 'Finance', badge: 'PDF DATA', colorHex: '#3F51B5', screen: 'FinanceReportAndBackup' },

  // Documents & OCR
  { id: 'pdftools', title: 'PDF Handlers Suite', shortTitle: 'PDF Tools', description: '14-in-1: Word (.docx), compress, merge, split, numbers, grayscale, lock', category: 'Documents', badge: '14-IN-1', colorHex: '#EF6C00', screen: 'PdfTools' },
  { id: 'pdf2word', title: 'PDF to Word', shortTitle: 'PDF to Word', description: 'Convert any digital or scanned PDF into editable Word (.docx)', category: 'Documents', badge: 'PDF→DOCX', colorHex: '#1E88E5', screen: 'PdfToWord' },
  { id: 'pdf_sign_redact', title: 'PDF Sign & Word→PDF', shortTitle: 'Sign & Redact', description: 'Sign PDFs, blackout redact & convert Word/TXT to PDF', category: 'Documents', badge: 'SIGN/REDACT', colorHex: '#0D47A1', screen: 'PdfSignRedact' },
  { id: 'img2pdf', title: 'Image to PDF', shortTitle: 'Img to PDF', description: 'Compile images into single PDF file', category: 'Documents', badge: 'PDF CONV', colorHex: '#E53935', screen: 'ImageToPdf' },
  { id: 'img2xls', title: 'Image to Excel', shortTitle: 'Img to XLS', description: 'Convert tables to spreadsheet via OCR', category: 'Documents', badge: 'OCR AI', colorHex: '#2E7D32', screen: 'ImageToXls' },
  { id: 'img2word', title: 'Image to Word', shortTitle: 'Img to Word', description: 'Convert images to DOCX files via OCR', category: 'Documents', badge: 'DOCX CONV', colorHex: '#1565C0', screen: 'ImageToWord' },
  { id: 'cv', title: 'CV Resume Builder', shortTitle: 'CV Builder', description: 'Create custom print-ready A4 PDF resumes', category: 'Documents', badge: 'A4 PRINT', colorHex: '#00C853', screen: 'CvBuilder' },
  { id: 'scanner', title: 'Edge Scanner', shortTitle: 'Doc Scan', description: 'Scan physical doc pages via camera', category: 'Documents', badge: 'HD SCAN', colorHex: '#673AB7', screen: 'DocumentScanner' },
  { id: 'id_scanner', title: 'ID Card Scanner', shortTitle: 'ID Scan', description: 'Scan front & back of ID on single page', category: 'Documents', badge: 'SINGLE PAGE', colorHex: '#1E88E5', screen: 'IdCardScanner' },
  { id: 'passport_scanner', title: 'Passport Scanner', shortTitle: 'Passport Scan', description: 'Full photo passport page scan utility', category: 'Documents', badge: 'GOVT DOC', colorHex: '#00ACC1', screen: 'PassportScanner' },
  { id: 'passport_studio', title: 'Passport Photo Studio', shortTitle: 'Visa Photo', description: 'Biometric visa sizer, target KB shrink & EXIF cleaner', category: 'Documents', badge: 'BIOMETRIC', colorHex: '#00897B', screen: 'PassportPhotoStudio' },
  { id: 'assignment_ocr', title: 'Handwritten Assignment & OCR', shortTitle: 'Assignment OCR', description: 'Offline Photo OCR & text to handwritten ruled notebook PDF', category: 'Documents', badge: 'HANDWRITING', colorHex: '#5E35B1', screen: 'AssignmentOcrStudio' },
  { id: 'invoice', title: 'OmniPOS Invoice', shortTitle: 'Invoices', description: 'Create professional PDF invoices', category: 'Documents', badge: 'INVOICES', colorHex: '#00838F', screen: 'InvoiceGenerator' },
  { id: 'hospital_clerk', title: 'Hospital Clerk & MS Kit', shortTitle: 'Clerk Kit', description: 'Official orders, rosters, show causes & letters', category: 'Documents', badge: 'GOVT KP', colorHex: '#00796B', screen: 'HospitalClerkAdmin' },
  { id: 'duty_rota', title: 'Duty Rota Creator', shortTitle: 'Duty Rota', description: 'Create official Word (.docx) & PDF rosters with header, logo & stamp', category: 'Documents', badge: 'WORD DOCX', colorHex: '#0D47A1', screen: 'DutyRotaCreator' },
  { id: 'stamp_sign', title: 'Stamp & Sign', shortTitle: 'Stamp/Sign', description: 'Freehand draw signature & stamp docs', category: 'Documents', badge: 'STAMP', colorHex: '#1976D2', screen: 'SignaturePad' },

  // Utilities
  { id: 'calc', title: 'Scientific Calc', shortTitle: 'Sci Calc', description: 'Advance mathematical formula solver', category: 'Utilities', badge: 'MATH ENGINE', colorHex: '#E91E63', screen: 'Calculator' },
  { id: 'converter', title: 'Unit Converter', shortTitle: 'Converter', description: 'Convert data, length, weight, speeds', category: 'Utilities', badge: 'CONVERT', colorHex: '#00ACC1', screen: 'UnitConverter' },
  { id: 'qr_gen', title: 'QR Generator', shortTitle: 'QR Gen', description: 'Generate secure colored QR codes', category: 'Utilities', badge: 'VECTOR', colorHex: '#3949AB', screen: 'QrGenerator' },
  { id: 'barcode_gen', title: 'Barcode Generator', shortTitle: 'Barcode', description: 'Generate all types of high-quality barcodes', category: 'Utilities', badge: 'VECTOR', colorHex: '#1E88E5', screen: 'BarcodeGenerator' },
  { id: 'qr_scan', title: 'QR Scanner', shortTitle: 'QR Scan', description: 'Scan bar codes & check web links', category: 'Utilities', badge: 'CAMERA', colorHex: '#00897B', screen: 'QrScanner' },
  { id: 'passwords', title: 'Password Vault', shortTitle: 'Passwords', description: 'Local encrypted credentials keeper', category: 'Utilities', badge: 'CRYPT', colorHex: '#2E7D32', screen: 'PasswordManager' },
  { id: 'img_tools', title: 'Image Compress', shortTitle: 'Img Compress', description: 'Compress, resize & optimize images', category: 'Utilities', badge: 'BATCH', colorHex: '#C2185B', screen: 'ImageTools' },
  { id: 'video_audio', title: 'Video & Audio Studio', shortTitle: 'Video/Audio', description: 'Compress video, trim clips & extract audio track', category: 'Utilities', badge: 'MEDIA MP4', colorHex: '#D81B60', screen: 'VideoAudioStudio' },
  { id: 'age', title: 'Age Calculator', shortTitle: 'Age Calc', description: 'Exact age in years, months & days', category: 'Utilities', badge: 'AGE FINDER', colorHex: '#E91E63', screen: 'AgeCalculator' },
  { id: 'intruder_guard', title: 'Intruder Guard', shortTitle: 'Intruder', description: 'Silent background selfie & siren alarm', category: 'Utilities', badge: 'SECURITY', colorHex: '#D32F2F', screen: 'IntruderGuard' },
  { id: 'watermark_studio', title: 'Watermark Studio', shortTitle: 'Watermark', description: 'Add text watermarks & photo filter matrix', category: 'Utilities', badge: 'STUDIO', colorHex: '#7B1FA2', screen: 'WatermarkStudio' },
  { id: 'bg_eraser', title: 'Background Eraser', shortTitle: 'BG Eraser', description: 'AI background remover with precise brush refine', category: 'Utilities', badge: 'AI SEGMENT', colorHex: '#E91E63', screen: 'BackgroundEraser' },
  { id: 'file_encryptor', title: 'File Encryptor', shortTitle: 'Encryptor', description: 'Hardware AES-256 GCM locker', category: 'Utilities', badge: 'KEYSTORE', colorHex: '#1E88E5', screen: 'FileEncryptor' },
  { id: 'hidden_locker', title: 'Hidden Locker', shortTitle: 'Locker', description: 'Secure sandbox file/photo vault', category: 'Utilities', badge: 'ENCRYPTED', colorHex: '#EC407A', screen: 'HiddenLocker' },
  { id: 'steganography', title: 'Steganography', shortTitle: 'Stego', description: 'Hide secret message in image pixels', category: 'Utilities', badge: 'LSB BIT', colorHex: '#43A047', screen: 'Steganography' },
  { id: 'steganalysis', title: 'Steganalysis', shortTitle: 'Forensics', description: 'Detect hidden data, LSB entropy & overlays', category: 'Utilities', badge: 'FORENSICS', colorHex: '#E65100', screen: 'Steganalysis' },
  { id: 'ai_enhancer', title: 'AI Enhancer', shortTitle: 'Enhancer', description: 'Offline AI face & photo restorer', category: 'Utilities', badge: 'REMINI', colorHex: '#00ACC1', screen: 'ImageEnhancer' },
  { id: 'teleprompter', title: 'Teleprompter Pro', shortTitle: 'Prompter', description: 'Camera video prompter with AI script generator', category: 'Utilities', badge: 'PRO STUDIO', colorHex: '#6366F1', screen: 'Teleprompter' },

  // Study & Health
  { id: 'notes', title: 'Lecture Notes', shortTitle: 'Notes', description: 'Organize lecture notes & study notes', category: 'Study', badge: 'OFFLINE', colorHex: '#F57C00', screen: 'Notes' },
  { id: 'timer', title: 'Pomodoro Timer', shortTitle: 'Pomodoro', description: 'Focus study timer sessions & analytics', category: 'Study', badge: 'FOCUS', colorHex: '#E64A19', screen: 'StudyTimer' },
  { id: 'timetable', title: 'Lesson Calendar', shortTitle: 'Timetable', description: 'Track school subjects & timetables', category: 'Study', badge: 'AGENDA', colorHex: '#1976D2', screen: 'Timetable' },
  { id: 'bmi', title: 'BMI & Health', shortTitle: 'BMI & Water', description: 'Water logging & fitness calculator', category: 'Study', badge: 'WELLNESS', colorHex: '#43A047', screen: 'BmiCalculator' },
  { id: 'gpa', title: 'GPA Calculator', shortTitle: 'GPA Calc', description: 'Calculate Semester GPA & CGPA instantly', category: 'Study', badge: 'GPA CALC', colorHex: '#9C27B0', screen: 'GpaCalculator' },
  { id: 'islamic_daily', title: 'Qibla, Salah & Tasbih', shortTitle: 'Qibla & Salah', description: 'Sensor Qibla compass, city/GPS prayer times & haptic tasbih', category: 'Study', badge: 'ISLAMIC PRO', colorHex: '#0F5132', screen: 'IslamicDaily' },
  { id: 'islamic', title: 'Islamic Library', shortTitle: 'Islamic Hub', description: 'Read Manzil Arabic & other books in HD', category: 'Study', badge: 'MANZIL HD', colorHex: '#198754', screen: 'IslamicHub' },

  // Medical & Clinical
  { id: 'iv_calc', title: 'IV Infusion Rate', shortTitle: 'IV Rate', description: 'IV fluid flow & drop rates tracker', category: 'Medical', badge: 'NURSING', colorHex: '#0288D1', screen: 'IvCalculator' },
  { id: 'dose_calc', title: 'Drug Dosage Calc', shortTitle: 'Dosage', description: 'Standard patient body-weight dosages', category: 'Medical', badge: 'PHARMACY', colorHex: '#00C853', screen: 'DosageCalculator' },
  { id: 'gfr_calc', title: 'GFR Renal Solver', shortTitle: 'GFR Renal', description: 'Cockcroft-Gault kidney clearance', category: 'Medical', badge: 'CLINICAL', colorHex: '#FF9100', screen: 'GfrCalculator' },
  { id: 'clinical_scores', title: 'Clinical & ABG Scores', shortTitle: 'ER Scores', description: 'ABG, Anion Gap, GCS, NEWS2, qSOFA & APGAR', category: 'Medical', badge: 'ER SCORES', colorHex: '#DC2626', screen: 'ClinicalScores' },
  { id: 'anatomy', title: 'Anatomy Atlas', shortTitle: 'Anatomy', description: 'Human systems, colorful study charts & quiz', category: 'Medical', badge: 'STUDY ATLAS', colorHex: '#E53935', screen: 'AnatomyAtlas' },
  { id: 'pharmacy_exam', title: 'Pharmacy Exam', shortTitle: 'Pharm Exam', description: 'Pakistan Category B pharmacy prep', category: 'Medical', badge: 'EXAM PREP', colorHex: '#9C27B0', screen: 'PharmacyExam' },
  { id: 'nursing_exam', title: 'Nursing Exam Kit', shortTitle: 'Nursing Exam', description: 'DHA, Saudi Prometric, NCLEX-RN, HAAD, MOH prep', category: 'Medical', badge: '12000+ Qs', colorHex: '#00695C', screen: 'NursingExam' },
  { id: 'hajj_prep', title: 'Hajj Mission Prep', shortTitle: 'Hajj NTS', description: 'Hajj Medical Mission NTS exam preparation', category: 'Medical', badge: 'NTS EXAM', colorHex: '#009688', screen: 'HajjMedicalPrep' },
  { id: 'moavineen', title: 'Moavineen Prep', shortTitle: 'Moavineen', description: 'Moavineen-e-Hujjaj guide & test Qs', category: 'Medical', badge: 'NTS EXAM', colorHex: '#3F51B5', screen: 'MoavineenHujjajPrep' },

  // Security Shield Suite
  { id: 'security_hub', title: 'Security Hub', shortTitle: 'Security Hub', description: 'Overall security status & shield hub', category: 'Security', badge: 'SHIELD', colorHex: '#10B981', screen: 'SecurityHub' },
  { id: 'pin_vault', title: 'PIN & Pattern Vault', shortTitle: 'PIN Vault', description: 'Master passcode & pattern lock setup', category: 'Security', badge: 'SECURITY', colorHex: '#6366F1', screen: 'PinVault' },
  { id: 'app_lock', title: 'App Lock Protector', shortTitle: 'App Lock', description: 'Protect sensitive apps with PIN/Bio', category: 'Security', badge: 'APPLOCK', colorHex: '#8B5CF6', screen: 'AppLock' },
  { id: 'calc_vault', title: 'Calculator Vault', shortTitle: 'Calc Vault', description: 'Disguised calculator vault for media', category: 'Security', badge: 'VAULT', colorHex: '#EC407A', screen: 'CalculatorVault' },
  { id: 'photo_vault', title: 'Secret Photo Vault', shortTitle: 'Photo Vault', description: 'AES-256 encrypted hidden gallery', category: 'Security', badge: 'MEDIA', colorHex: '#3B82F6', screen: 'PhotoVault' },
  { id: 'private_notes', title: 'Encrypted Notes', shortTitle: 'Secret Notes', description: 'Locked journal & secure note vault', category: 'Security', badge: 'NOTES', colorHex: '#14B8A6', screen: 'PrivateNotes' },
  { id: 'secure_delete', title: 'Shredder & Delete', shortTitle: 'Shredder', description: 'Permanent multi-pass destruction', category: 'Security', badge: 'SHREDDER', colorHex: '#EF4444', screen: 'SecureDelete' },
  { id: 'perm_auditor', title: 'Permission Auditor', shortTitle: 'Permissions', description: 'Inspect privacy risk & camera permissions', category: 'Security', badge: 'AUDIT', colorHex: '#F59E0B', screen: 'PermissionAuditor' },
  { id: 'wifi_scanner', title: 'Wi-Fi Inspector', shortTitle: 'Wi-Fi Scan', description: 'Scan connected devices & router safety', category: 'Security', badge: 'NETWORK', colorHex: '#06B6D4', screen: 'WifiScanner' },
  { id: 'ussd_check', title: 'USSD Auditor', shortTitle: 'USSD Check', description: 'Scan call forwarding & MMI codes', category: 'Security', badge: 'TELECOM', colorHex: '#8B5CF6', screen: 'UssdCheck' },
  { id: 'thermal_printer', title: 'Thermal Printer', shortTitle: 'Printer', description: 'ESC/POS receipt printing manager', category: 'Security', badge: 'PRINTER', colorHex: '#64748B', screen: 'ThermalPrinterManager' },
  { id: 'biometric_mgr', title: 'Biometric Hardware', shortTitle: 'Biometrics', description: 'Fingerprint & FaceID sensor config', category: 'Security', badge: 'HARDWARE', colorHex: '#10B981', screen: 'BiometricManagerScreen' },
];

export function getModulesForSheet(sheet: CategorySheetType): {
  title: string;
  headerColor: string;
  modules: ModuleItem[];
} {
  switch (sheet) {
    case 'FINANCE':
      return {
        title: 'Finance Suite',
        headerColor: '#00897B',
        modules: ALL_SUITE_MODULES.filter((m) => m.category === 'Finance'),
      };
    case 'DOCS':
      return {
        title: 'Document & OCR Suite',
        headerColor: '#1565C0',
        modules: ALL_SUITE_MODULES.filter((m) => m.category === 'Documents'),
      };
    case 'TOOLS':
      return {
        title: 'Smart Utilities Suite',
        headerColor: '#673AB7',
        modules: ALL_SUITE_MODULES.filter((m) => m.category === 'Utilities'),
      };
    case 'STUDY':
      return {
        title: 'Study & Health Suite',
        headerColor: '#F57C00',
        modules: ALL_SUITE_MODULES.filter((m) => m.category === 'Study' || m.category === 'Medical'),
      };
    case 'SECURITY':
      return {
        title: 'Security Shield Suite',
        headerColor: '#10B981',
        modules: ALL_SUITE_MODULES.filter((m) => m.category === 'Security'),
      };
  }
}

export function getHubCategoryForScreen(screen: ScreenType): 'Finance' | 'Documents' | 'Utilities' | 'Study' | 'Security' | null {
  const found = ALL_SUITE_MODULES.find((m) => m.screen === screen);
  if (!found) return null;
  if (found.category === 'Medical') return 'Study';
  return found.category;
}

export function getScreenMeta(screen: ScreenType): { title: string; hubCategory: 'Finance' | 'Documents' | 'Utilities' | 'Study' | 'Security' | null } {
  const found = ALL_SUITE_MODULES.find((m) => m.screen === screen);
  if (found) {
    return {
      title: found.title,
      hubCategory: found.category === 'Medical' ? 'Study' : found.category,
    };
  }
  switch (screen) {
    case 'QuranMajeed': return { title: 'Quran Majeed Reader', hubCategory: 'Study' };
    case 'ManzilBook': return { title: 'Manzil HD Protection Book', hubCategory: 'Study' };
    case 'HisnulMuslim': return { title: 'Hisnul Muslim Supplications', hubCategory: 'Study' };
    case 'About': return { title: 'About Hikmah Omni Suite', hubCategory: null };
    case 'Settings': return { title: 'Settings & Profile', hubCategory: null };
    default: return { title: 'Hikmah Omni Suite', hubCategory: null };
  }
}
