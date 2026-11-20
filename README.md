# StudentKit Buner (Hikmah Omni Suite)

> **Native Android Kotlin + Jetpack Compose Application**
> Application ID: `com.studentkit.buner`
> Source Package: `com.drtahir.studentkit`

Comprehensive all-in-one clinical, financial, administrative, and Islamic productivity platform developed for doctors, medical students, nursing staff, and hospital administration in District Buner, Khyber Pakhtunkhwa.

---

## 🛠️ Architecture & Technology Stack

- **Platform**: Native Android (Kotlin + Jetpack Compose)
- **Minimum SDK**: 24 (Android 7.0 Nougat)
- **Target / Compile SDK**: 36 (Android 16)
- **Build System**: Gradle 9.3.1 (Kotlin DSL `build.gradle.kts`)
- **Android Gradle Plugin (AGP)**: 9.1.1
- **UI Architecture**: Jetpack Compose Material 3 with Single-Activity StateFlow Architecture (`MainActivity.kt` + `StudentKitViewModel.kt`)
- **Database**: Room Database (`AppDatabase.kt`, SQLCipher, SQLite)
- **CI / CD**: Automated GitHub Actions (`.github/workflows/build.yml`) generating debug and release signed APKs

---

## 📱 Modules & Features

### 1. Financial Suite
- **Expense Tracker**: Categorized daily cash outflows with receipt details.
- **Income Tracker**: Monitor salary, clinic revenues, honorariums, and investments.
- **Utility Bills Ledger**: Track WAPDA PESCO, Sui Gas (SNGPL), PTCL Broadband, and Water Supply with due-date reminders.
- **Zakat Calculator**: Obligatory 2.5% wealth Zakat calculation for Gold, Silver, Cash, and Receivables against Silver Nisab (612.36g).
- **BC Kommittees (Kameti)**: Member payout roster and monthly lucky-draw generator.
- **Loan & Debt Ledger**: Double-entry ledger tracking *I Lent* vs *I Borrowed* with borrower names and settlement status.
- **Savings Goals**: Milestone funds tracking with deposit progress bars.

### 2. Clinical & Medical Practice
- **Human Anatomy Atlas & Quiz**: High-yield clinical organ explorer across 12 body systems (Skeletal, Cardiovascular, Respiratory, Digestive, Nervous, Endocrine, etc.) with clinical pearls, pharmacology drug target notes, and interactive quiz.
- **Nursing Exam Kit**: DHA, Saudi Prometric, NCLEX-RN, HAAD, and MOH exam prep bank.
- **Pharmacy Exam Kit**: Pakistan Category B Pharmacy Assistant prep covering pharmaceutical jurisprudence, posology, and drug calculations.
- **Hajj Medical Mission Prep**: Emergency heatstroke triage, mass casualty management (START protocol), and Saudi Ministry of Health regulations.
- **Clinical Calculators**:
  - *IV Infusion Rate*: Drops/min (`gtt/min`) and pump flow rate (`mL/hr`).
  - *Drug Dosage Calculator*: Weight-based pediatric dosing (`mg/kg`) to exact volume in `mL` and tablets.
  - *Cockcroft-Gault GFR Solver*: Estimate creatinine clearance and Chronic Kidney Disease (CKD) staging.

### 3. Islamic Knowledge Hub
- **Quran Majeed Reader**: 114 Surahs with Arabic calligraphy, transliteration, English translation, and copy capabilities.
- **Manzil HD Book**: 33 protective Quranic verses for spiritual healing and protection against afflictions.
- **Hisnul Muslim (Fortress of the Muslim)**: Authenticated daily supplications for morning, evening, sleep, travel, and illness.
- **Hijri Lunar Calendar**: Algorithmic Islamic calendar with user-adjustable offset for regional lunar sightings.

### 4. Document & Hospital Clerical Studio
- **CV Resume Builder**: Print-ready A4 resume creator with live preview, experience/academic sections, and instant export.
- **Professional Invoice Maker**: Itemized GST/KPRA tax invoices with tax computations, banking instructions, and printable layout.
- **Duty Rota Creator**: Hospital OPD and emergency shift roster generator for Cat-D Hospital Pacha Kalay Buner with official seal.
- **Hospital Clerk & MS Kit**: Official government Khyber Pakhtunkhwa templates including Show Cause Notices, Internal Posting Orders, and Consumable Sanctions.
- **ID Card Scanner (2-in-1 A4)**: Composite dual-side ID card scanner layout with high-contrast document and grayscale filters.
- **Handwritten Assignment OCR Studio**: Render text onto realistic ruled notebook paper with red margin styling.
- **Digital Signature & Stamp Pad**: Smooth canvas for signing documents and exporting transparent high-res PNG signatures.

### 5. Utilities & Security Suite
- **Scientific Calculator**: Full scientific formula solver (trigonometry, logarithms, powers, roots, parentheses).
- **Universal Unit Converter**: Length, weight (including Tola), digital data storage, speed, and temperature.
- **Age & Milestone Calculator**: Exact age in years, months, and days with next birthday countdown.
- **Pomodoro Focus Timer**: 25m work / 5m short break / 15m long break intervals with session counting.
- **Password Vault**: Encrypted credential keeper with random password generator.
- **Image Steganography Studio**: Embed and extract confidential text from image pixels using Least Significant Bit (LSB) encoding.
- **Teleprompter Pro**: Presentation prompter with speed controls, font resizing, and mirror mode for glass rigs.
- **Lesson & Duty Timetable**: Weekly class and clinic schedule grid.
- **BMI & Hydration Tracker**: Body Mass Index calculator with healthy weight benchmarks and 8-glass water tracker.
- **GPA & CGPA Calculator**: Semester quality points and credit hours calculation.

---

## 🚀 Building the APK in Termux / Android

To build locally using Gradle wrapper:
```bash
chmod +x ./gradlew
./gradlew assembleDebug
```
The resulting debug APK will be at:
`app/build/outputs/apk/debug/app-debug.apk`

To push updates from Termux and trigger the automated GitHub Actions APK builder:
```bash
git add -A && git commit -m "feat: [description]" && git push
```
