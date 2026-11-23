import { SurahMeta } from '../types';

export interface JuzMeta {
  number: number;
  englishName: string;
  arabicName: string;
  startPage: number;
  startSurah: number;
  startAyah: number;
}

export const juzList: JuzMeta[] = [
  { number: 1, englishName: 'Alif Lam Meem', arabicName: 'الم', startPage: 1, startSurah: 1, startAyah: 1 },
  { number: 2, englishName: 'Sayaqool', arabicName: 'سَيَقُولُ', startPage: 22, startSurah: 2, startAyah: 142 },
  { number: 3, englishName: 'Tilkal Rusul', arabicName: 'تِلْكَ الرُّسُلُ', startPage: 42, startSurah: 2, startAyah: 253 },
  { number: 4, englishName: 'Lan Tanaloo', arabicName: 'لَنْ تَنَالُوا', startPage: 62, startSurah: 3, startAyah: 93 },
  { number: 5, englishName: 'Wal Muhsanat', arabicName: 'وَالْمُحْصَنَاتُ', startPage: 82, startSurah: 4, startAyah: 24 },
  { number: 6, englishName: 'La Yuhibbullah', arabicName: 'لَا يُحِبُّ اللَّهُ', startPage: 102, startSurah: 4, startAyah: 148 },
  { number: 7, englishName: "Wa Iza Sami'oo", arabicName: 'وَإِذَا سَمِعُوا', startPage: 121, startSurah: 5, startAyah: 82 },
  { number: 8, englishName: 'Wa Lau Annana', arabicName: 'وَلَوْ أَنَّنَا', startPage: 142, startSurah: 6, startAyah: 111 },
  { number: 9, englishName: "Qal Al-Mala'u", arabicName: 'قَالَ الْمَلَأُ', startPage: 162, startSurah: 7, startAyah: 88 },
  { number: 10, englishName: "Wa'lamoo", arabicName: 'وَاعْلَمُوا', startPage: 182, startSurah: 8, startAyah: 41 },
  { number: 11, englishName: "Ya'tazirun", arabicName: 'يَعْتَذِرُونَ', startPage: 201, startSurah: 9, startAyah: 93 },
  { number: 12, englishName: 'Wa Ma Min Dabbah', arabicName: 'وَمَا مِنْ دَابَّةٍ', startPage: 222, startSurah: 11, startAyah: 6 },
  { number: 13, englishName: "Wa Ma Ubarri'u", arabicName: 'وَمَا أُبَرِّئُ', startPage: 242, startSurah: 12, startAyah: 53 },
  { number: 14, englishName: 'Rubama', arabicName: 'رُبَمَا', startPage: 262, startSurah: 15, startAyah: 1 },
  { number: 15, englishName: 'Subhan Alladhi', arabicName: 'سُبْحَانَ الَّذِي', startPage: 282, startSurah: 17, startAyah: 1 },
  { number: 16, englishName: 'Qala Alam', arabicName: 'قَالَ أَلَمْ', startPage: 302, startSurah: 18, startAyah: 75 },
  { number: 17, englishName: 'Aqtaraba', arabicName: 'اقْتَرَبَ', startPage: 322, startSurah: 21, startAyah: 1 },
  { number: 18, englishName: 'Qad Aflaha', arabicName: 'قَدْ أَفْلَحَ', startPage: 342, startSurah: 23, startAyah: 1 },
  { number: 19, englishName: 'Wa Qalalladhina', arabicName: 'وَقَالَ الَّذِينَ', startPage: 362, startSurah: 25, startAyah: 21 },
  { number: 20, englishName: 'Aman Khalaqa', arabicName: 'أَمَّنْ خَلَقَ', startPage: 382, startSurah: 27, startAyah: 56 },
  { number: 21, englishName: 'Utlu Ma Oohiya', arabicName: 'اتْلُ مَا أُوحِيَ', startPage: 402, startSurah: 29, startAyah: 46 },
  { number: 22, englishName: 'Wa Man Yaqnut', arabicName: 'وَمَنْ يَقْنُتْ', startPage: 422, startSurah: 33, startAyah: 31 },
  { number: 23, englishName: 'Wa Maliya', arabicName: 'وَمَالِيَ', startPage: 442, startSurah: 36, startAyah: 28 },
  { number: 24, englishName: 'Faman Azlamu', arabicName: 'فَمَنْ أَظْلَمُ', startPage: 462, startSurah: 39, startAyah: 32 },
  { number: 25, englishName: 'Ilayhi Yuraddu', arabicName: 'إِلَيْهِ يُرَدُّ', startPage: 482, startSurah: 41, startAyah: 47 },
  { number: 26, englishName: 'Ha Meem', arabicName: 'حم', startPage: 502, startSurah: 46, startAyah: 1 },
  { number: 27, englishName: 'Qala Fama Khatbukum', arabicName: 'قَالَ فَمَا خَطْبُكُمْ', startPage: 522, startSurah: 51, startAyah: 31 },
  { number: 28, englishName: "Qad Sami'allahu", arabicName: 'قَدْ سَمِعَ اللَّهُ', startPage: 542, startSurah: 58, startAyah: 1 },
  { number: 29, englishName: 'Tabarakalladhi', arabicName: 'تَبَارَكَ الَّذِي', startPage: 562, startSurah: 67, startAyah: 1 },
  { number: 30, englishName: "Amma Yatasa'aloon", arabicName: 'عَمَّ', startPage: 582, startSurah: 78, startAyah: 1 }
];

export const surahsList: SurahMeta[] = [
  { number: 1, englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', arabicName: 'الفاتحة', numberOfAyahs: 7, revelationType: 'Meccan', startPage: 1 },
  { number: 2, englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', arabicName: 'البقرة', numberOfAyahs: 286, revelationType: 'Medinan', startPage: 2 },
  { number: 3, englishName: "Ali 'Imran", englishNameTranslation: 'Family of Imran', arabicName: 'آل عمران', numberOfAyahs: 200, revelationType: 'Medinan', startPage: 50 },
  { number: 4, englishName: 'An-Nisa', englishNameTranslation: 'The Women', arabicName: 'النساء', numberOfAyahs: 176, revelationType: 'Medinan', startPage: 77 },
  { number: 5, englishName: "Al-Ma'idah", englishNameTranslation: 'The Table Spread', arabicName: 'المائدة', numberOfAyahs: 120, revelationType: 'Medinan', startPage: 106 },
  { number: 6, englishName: "Al-An'am", englishNameTranslation: 'The Cattle', arabicName: 'الأنعام', numberOfAyahs: 165, revelationType: 'Meccan', startPage: 128 },
  { number: 7, englishName: "Al-A'raf", englishNameTranslation: 'The Heights', arabicName: 'الأعراف', numberOfAyahs: 206, revelationType: 'Meccan', startPage: 151 },
  { number: 8, englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', arabicName: 'الأنفال', numberOfAyahs: 75, revelationType: 'Medinan', startPage: 177 },
  { number: 9, englishName: 'At-Tawbah', englishNameTranslation: 'The Repentance', arabicName: 'التوبة', numberOfAyahs: 129, revelationType: 'Medinan', startPage: 187 },
  { number: 10, englishName: 'Yunus', englishNameTranslation: 'Jonah', arabicName: 'يونس', numberOfAyahs: 109, revelationType: 'Meccan', startPage: 208 },
  { number: 11, englishName: 'Hud', englishNameTranslation: 'Hud', arabicName: 'هود', numberOfAyahs: 123, revelationType: 'Meccan', startPage: 221 },
  { number: 12, englishName: 'Yusuf', englishNameTranslation: 'Joseph', arabicName: 'يوسف', numberOfAyahs: 111, revelationType: 'Meccan', startPage: 235 },
  { number: 13, englishName: "Ar-Ra'd", englishNameTranslation: 'The Thunder', arabicName: 'الرعد', numberOfAyahs: 43, revelationType: 'Medinan', startPage: 249 },
  { number: 14, englishName: 'Ibrahim', englishNameTranslation: 'Abraham', arabicName: 'إبراهيم', numberOfAyahs: 52, revelationType: 'Meccan', startPage: 255 },
  { number: 15, englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', arabicName: 'الحجر', numberOfAyahs: 99, revelationType: 'Meccan', startPage: 262 },
  { number: 16, englishName: 'An-Nahl', englishNameTranslation: 'The Bee', arabicName: 'النحل', numberOfAyahs: 128, revelationType: 'Meccan', startPage: 267 },
  { number: 17, englishName: 'Al-Isra', englishNameTranslation: 'The Night Journey', arabicName: 'الإسراء', numberOfAyahs: 111, revelationType: 'Meccan', startPage: 282 },
  { number: 18, englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', arabicName: 'الكهف', numberOfAyahs: 110, revelationType: 'Meccan', startPage: 293 },
  { number: 19, englishName: 'Maryam', englishNameTranslation: 'Mary', arabicName: 'مريم', numberOfAyahs: 98, revelationType: 'Meccan', startPage: 305 },
  { number: 20, englishName: 'Ta-Ha', englishNameTranslation: 'Ta-Ha', arabicName: 'طه', numberOfAyahs: 135, revelationType: 'Meccan', startPage: 312 },
  { number: 21, englishName: 'Al-Anbiya', englishNameTranslation: 'The Prophets', arabicName: 'الأنبياء', numberOfAyahs: 112, revelationType: 'Meccan', startPage: 322 },
  { number: 22, englishName: 'Al-Hajj', englishNameTranslation: 'The Pilgrimage', arabicName: 'الحج', numberOfAyahs: 78, revelationType: 'Medinan', startPage: 332 },
  { number: 23, englishName: "Al-Mu'minun", englishNameTranslation: 'The Believers', arabicName: 'المؤمنون', numberOfAyahs: 118, revelationType: 'Meccan', startPage: 342 },
  { number: 24, englishName: 'An-Nur', englishNameTranslation: 'The Light', arabicName: 'النور', numberOfAyahs: 64, revelationType: 'Medinan', startPage: 350 },
  { number: 25, englishName: 'Al-Furqan', englishNameTranslation: 'The Criterion', arabicName: 'الفرقان', numberOfAyahs: 77, revelationType: 'Meccan', startPage: 359 },
  { number: 26, englishName: "Ash-Shu'ara", englishNameTranslation: 'The Poets', arabicName: 'الشعراء', numberOfAyahs: 227, revelationType: 'Meccan', startPage: 367 },
  { number: 27, englishName: 'An-Naml', englishNameTranslation: 'The Ant', arabicName: 'النمل', numberOfAyahs: 93, revelationType: 'Meccan', startPage: 377 },
  { number: 28, englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', arabicName: 'القصص', numberOfAyahs: 88, revelationType: 'Meccan', startPage: 385 },
  { number: 29, englishName: 'Al-Ankabut', englishNameTranslation: 'The Spider', arabicName: 'العنكبوت', numberOfAyahs: 69, revelationType: 'Meccan', startPage: 396 },
  { number: 30, englishName: 'Ar-Rum', englishNameTranslation: 'The Romans', arabicName: 'الروم', numberOfAyahs: 60, revelationType: 'Meccan', startPage: 404 },
  { number: 31, englishName: 'Luqman', englishNameTranslation: 'Luqman', arabicName: 'لقمان', numberOfAyahs: 34, revelationType: 'Meccan', startPage: 411 },
  { number: 32, englishName: 'As-Sajdah', englishNameTranslation: 'The Prostration', arabicName: 'السجدة', numberOfAyahs: 30, revelationType: 'Meccan', startPage: 415 },
  { number: 33, englishName: 'Al-Ahzab', englishNameTranslation: 'The Combined Forces', arabicName: 'الأحزاب', numberOfAyahs: 73, revelationType: 'Medinan', startPage: 418 },
  { number: 34, englishName: 'Saba', englishNameTranslation: 'Sheba', arabicName: 'سبأ', numberOfAyahs: 54, revelationType: 'Meccan', startPage: 428 },
  { number: 35, englishName: 'Fatir', englishNameTranslation: 'Originator', arabicName: 'فاطر', numberOfAyahs: 45, revelationType: 'Meccan', startPage: 434 },
  { number: 36, englishName: 'Ya-Sin', englishNameTranslation: 'Ya-Sin', arabicName: 'يس', numberOfAyahs: 83, revelationType: 'Meccan', startPage: 440 },
  { number: 37, englishName: 'As-Saffat', englishNameTranslation: 'Those who set the Ranks', arabicName: 'الصافات', numberOfAyahs: 182, revelationType: 'Meccan', startPage: 446 },
  { number: 38, englishName: 'Sad', englishNameTranslation: 'The Letter Sad', arabicName: 'ص', numberOfAyahs: 88, revelationType: 'Meccan', startPage: 453 },
  { number: 39, englishName: 'Az-Zumar', englishNameTranslation: 'The Troops', arabicName: 'الزمر', numberOfAyahs: 75, revelationType: 'Meccan', startPage: 458 },
  { number: 40, englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', arabicName: 'غافر', numberOfAyahs: 85, revelationType: 'Meccan', startPage: 467 },
  { number: 41, englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', arabicName: 'فصلت', numberOfAyahs: 54, revelationType: 'Meccan', startPage: 477 },
  { number: 42, englishName: 'Ash-Shura', englishNameTranslation: 'The Consultation', arabicName: 'الشورى', numberOfAyahs: 53, revelationType: 'Meccan', startPage: 483 },
  { number: 43, englishName: 'Az-Zukhruf', englishNameTranslation: 'The Ornaments of Gold', arabicName: 'الزخرف', numberOfAyahs: 89, revelationType: 'Meccan', startPage: 489 },
  { number: 44, englishName: 'Ad-Dukhan', englishNameTranslation: 'The Smoke', arabicName: 'الدخان', numberOfAyahs: 59, revelationType: 'Meccan', startPage: 496 },
  { number: 45, englishName: 'Al-Jathiyah', englishNameTranslation: 'The Crouching', arabicName: 'الجاثية', numberOfAyahs: 37, revelationType: 'Meccan', startPage: 499 },
  { number: 46, englishName: 'Al-Ahqaf', englishNameTranslation: 'The Wind-Curved Sandhills', arabicName: 'الأحقاف', numberOfAyahs: 35, revelationType: 'Meccan', startPage: 502 },
  { number: 47, englishName: 'Muhammad', englishNameTranslation: 'Muhammad', arabicName: 'محمد', numberOfAyahs: 38, revelationType: 'Medinan', startPage: 507 },
  { number: 48, englishName: 'Al-Fath', englishNameTranslation: 'The Victory', arabicName: 'الفتح', numberOfAyahs: 29, revelationType: 'Medinan', startPage: 511 },
  { number: 49, englishName: 'Al-Hujurat', englishNameTranslation: 'The Dwellings', arabicName: 'الحجرات', numberOfAyahs: 18, revelationType: 'Medinan', startPage: 515 },
  { number: 50, englishName: 'Qaf', englishNameTranslation: 'The Letter Qaf', arabicName: 'ق', numberOfAyahs: 45, revelationType: 'Meccan', startPage: 518 },
  { number: 51, englishName: 'Adh-Dhariyat', englishNameTranslation: 'The Winnowing Winds', arabicName: 'الذاريات', numberOfAyahs: 60, revelationType: 'Meccan', startPage: 520 },
  { number: 52, englishName: 'At-Tur', englishNameTranslation: 'The Mount', arabicName: 'الطور', numberOfAyahs: 49, revelationType: 'Meccan', startPage: 523 },
  { number: 53, englishName: 'An-Najm', englishNameTranslation: 'The Star', arabicName: 'النجم', numberOfAyahs: 62, revelationType: 'Meccan', startPage: 526 },
  { number: 54, englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', arabicName: 'القمر', numberOfAyahs: 55, revelationType: 'Meccan', startPage: 528 },
  { number: 55, englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', arabicName: 'الرحمن', numberOfAyahs: 78, revelationType: 'Medinan', startPage: 531 },
  { number: 56, englishName: "Al-Waqi'ah", englishNameTranslation: 'The Inevitable', arabicName: 'الواقعة', numberOfAyahs: 96, revelationType: 'Meccan', startPage: 534 },
  { number: 57, englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', arabicName: 'الحديد', numberOfAyahs: 29, revelationType: 'Medinan', startPage: 537 },
  { number: 58, englishName: 'Al-Mujadilah', englishNameTranslation: 'The Pleading Woman', arabicName: 'المجادلة', numberOfAyahs: 22, revelationType: 'Medinan', startPage: 542 },
  { number: 59, englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', arabicName: 'الحشر', numberOfAyahs: 24, revelationType: 'Medinan', startPage: 545 },
  { number: 60, englishName: 'Al-Mumtahanah', englishNameTranslation: 'She that is to be examined', arabicName: 'الممتحنة', numberOfAyahs: 13, revelationType: 'Medinan', startPage: 549 },
  { number: 61, englishName: 'As-Saff', englishNameTranslation: 'The Ranks', arabicName: 'الصف', numberOfAyahs: 14, revelationType: 'Medinan', startPage: 551 },
  { number: 62, englishName: "Al-Jumu'ah", englishNameTranslation: 'The Congregation', arabicName: 'الجمعة', numberOfAyahs: 11, revelationType: 'Medinan', startPage: 553 },
  { number: 63, englishName: 'Al-Munafiqun', englishNameTranslation: 'The Hypocrites', arabicName: 'المنافقون', numberOfAyahs: 11, revelationType: 'Medinan', startPage: 554 },
  { number: 64, englishName: 'At-Taghabun', englishNameTranslation: 'The Mutual Disillusion', arabicName: 'التغابن', numberOfAyahs: 18, revelationType: 'Medinan', startPage: 556 },
  { number: 65, englishName: 'At-Talaq', englishNameTranslation: 'The Divorce', arabicName: 'الطلاق', numberOfAyahs: 12, revelationType: 'Medinan', startPage: 558 },
  { number: 66, englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', arabicName: 'التحريم', numberOfAyahs: 12, revelationType: 'Medinan', startPage: 560 },
  { number: 67, englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', arabicName: 'الملك', numberOfAyahs: 30, revelationType: 'Meccan', startPage: 562 },
  { number: 68, englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', arabicName: 'القلم', numberOfAyahs: 52, revelationType: 'Meccan', startPage: 564 },
  { number: 69, englishName: 'Al-Haqqah', englishNameTranslation: 'The Reality', arabicName: 'الحاقة', numberOfAyahs: 52, revelationType: 'Meccan', startPage: 566 },
  { number: 70, englishName: "Al-Ma'arij", englishNameTranslation: 'The Ascending Stairways', arabicName: 'المعارج', numberOfAyahs: 44, revelationType: 'Meccan', startPage: 568 },
  { number: 71, englishName: 'Nuh', englishNameTranslation: 'Noah', arabicName: 'نوح', numberOfAyahs: 28, revelationType: 'Meccan', startPage: 570 },
  { number: 72, englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', arabicName: 'الجن', numberOfAyahs: 28, revelationType: 'Meccan', startPage: 572 },
  { number: 73, englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', arabicName: 'المزمل', numberOfAyahs: 20, revelationType: 'Meccan', startPage: 574 },
  { number: 74, englishName: 'Al-Muddaththir', englishNameTranslation: 'The Cloaked One', arabicName: 'المدثر', numberOfAyahs: 56, revelationType: 'Meccan', startPage: 575 },
  { number: 75, englishName: 'Al-Qiyamah', englishNameTranslation: 'The Resurrection', arabicName: 'القيامة', numberOfAyahs: 40, revelationType: 'Meccan', startPage: 577 },
  { number: 76, englishName: 'Al-Insan', englishNameTranslation: 'The Man', arabicName: 'الإنسان', numberOfAyahs: 31, revelationType: 'Medinan', startPage: 578 },
  { number: 77, englishName: 'Al-Mursalat', englishNameTranslation: 'Those Sent Forth', arabicName: 'المرسلات', numberOfAyahs: 50, revelationType: 'Meccan', startPage: 580 },
  { number: 78, englishName: 'An-Naba', englishNameTranslation: 'The Great News', arabicName: 'النبأ', numberOfAyahs: 40, revelationType: 'Meccan', startPage: 582 },
  { number: 79, englishName: "An-Nazi'at", englishNameTranslation: 'Those who Drag Forth', arabicName: 'النازعات', numberOfAyahs: 46, revelationType: 'Meccan', startPage: 583 },
  { number: 80, englishName: 'Abasa', englishNameTranslation: 'He Frowned', arabicName: 'عبس', numberOfAyahs: 42, revelationType: 'Meccan', startPage: 585 },
  { number: 81, englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', arabicName: 'التكوير', numberOfAyahs: 29, revelationType: 'Meccan', startPage: 586 },
  { number: 82, englishName: 'Al-Infitar', englishNameTranslation: 'The Cleaving', arabicName: 'الانفطار', numberOfAyahs: 19, revelationType: 'Meccan', startPage: 587 },
  { number: 83, englishName: 'Al-Mutaffifin', englishNameTranslation: 'The Defrauders', arabicName: 'المطففين', numberOfAyahs: 36, revelationType: 'Meccan', startPage: 587 },
  { number: 84, englishName: 'Al-Inshiqaq', englishNameTranslation: 'The Sundering', arabicName: 'الانشقاق', numberOfAyahs: 25, revelationType: 'Meccan', startPage: 589 },
  { number: 85, englishName: 'Al-Buruj', englishNameTranslation: 'The Mansions of the Stars', arabicName: 'البروج', numberOfAyahs: 22, revelationType: 'Meccan', startPage: 590 },
  { number: 86, englishName: 'At-Tariq', englishNameTranslation: 'The Nightcomer', arabicName: 'الطارق', numberOfAyahs: 17, revelationType: 'Meccan', startPage: 591 },
  { number: 87, englishName: "Al-A'la", englishNameTranslation: 'The Most High', arabicName: 'الأعلى', numberOfAyahs: 19, revelationType: 'Meccan', startPage: 591 },
  { number: 88, englishName: 'Al-Ghashiyah', englishNameTranslation: 'The Overwhelming', arabicName: 'الغاشية', numberOfAyahs: 26, revelationType: 'Meccan', startPage: 592 },
  { number: 89, englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', arabicName: 'الفجر', numberOfAyahs: 30, revelationType: 'Meccan', startPage: 593 },
  { number: 90, englishName: 'Al-Balad', englishNameTranslation: 'The City', arabicName: 'البلد', numberOfAyahs: 20, revelationType: 'Meccan', startPage: 594 },
  { number: 91, englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', arabicName: 'الشمس', numberOfAyahs: 15, revelationType: 'Meccan', startPage: 595 },
  { number: 92, englishName: 'Al-Lail', englishNameTranslation: 'The Night', arabicName: 'الليل', numberOfAyahs: 21, revelationType: 'Meccan', startPage: 595 },
  { number: 93, englishName: 'Ad-Duha', englishNameTranslation: 'The Morning Hours', arabicName: 'الضحى', numberOfAyahs: 11, revelationType: 'Meccan', startPage: 596 },
  { number: 94, englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', arabicName: 'الشرح', numberOfAyahs: 8, revelationType: 'Meccan', startPage: 596 },
  { number: 95, englishName: 'At-Tin', englishNameTranslation: 'The Fig', arabicName: 'التين', numberOfAyahs: 8, revelationType: 'Meccan', startPage: 597 },
  { number: 96, englishName: 'Al-Alaq', englishNameTranslation: 'The Clot', arabicName: 'العلق', numberOfAyahs: 19, revelationType: 'Meccan', startPage: 597 },
  { number: 97, englishName: 'Al-Qadr', englishNameTranslation: 'The Power', arabicName: 'القدر', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 598 },
  { number: 98, englishName: 'Al-Bayyinah', englishNameTranslation: 'The Clear Proof', arabicName: 'البينة', numberOfAyahs: 8, revelationType: 'Medinan', startPage: 598 },
  { number: 99, englishName: 'Az-Zalzalah', englishNameTranslation: 'The Earthquake', arabicName: 'الزلزلة', numberOfAyahs: 8, revelationType: 'Medinan', startPage: 599 },
  { number: 100, englishName: 'Al-Adiyat', englishNameTranslation: 'The Courser', arabicName: 'العاديات', numberOfAyahs: 11, revelationType: 'Meccan', startPage: 599 },
  { number: 101, englishName: "Al-Qari'ah", englishNameTranslation: 'The Calamity', arabicName: 'القارعة', numberOfAyahs: 11, revelationType: 'Meccan', startPage: 600 },
  { number: 102, englishName: 'At-Takathur', englishNameTranslation: 'The Rivalry in World Increase', arabicName: 'التكاثر', numberOfAyahs: 8, revelationType: 'Meccan', startPage: 600 },
  { number: 103, englishName: 'Al-Asr', englishNameTranslation: 'The Declining Day', arabicName: 'العصر', numberOfAyahs: 3, revelationType: 'Meccan', startPage: 601 },
  { number: 104, englishName: 'Al-Humazah', englishNameTranslation: 'The Traducer', arabicName: 'الهمزة', numberOfAyahs: 9, revelationType: 'Meccan', startPage: 601 },
  { number: 105, englishName: 'Al-Fil', englishNameTranslation: 'The Elephant', arabicName: 'الفيل', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 601 },
  { number: 106, englishName: 'Quraish', englishNameTranslation: 'Quraish', arabicName: 'قريش', numberOfAyahs: 4, revelationType: 'Meccan', startPage: 602 },
  { number: 107, englishName: "Al-Ma'un", englishNameTranslation: 'The Small Kindnesses', arabicName: 'الماعون', numberOfAyahs: 7, revelationType: 'Meccan', startPage: 602 },
  { number: 108, englishName: 'Al-Kauthar', englishNameTranslation: 'The Abundance', arabicName: 'الكوثر', numberOfAyahs: 3, revelationType: 'Meccan', startPage: 602 },
  { number: 109, englishName: 'Al-Kafirun', englishNameTranslation: 'The Disbelievers', arabicName: 'الكافرون', numberOfAyahs: 6, revelationType: 'Meccan', startPage: 603 },
  { number: 110, englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', arabicName: 'النصر', numberOfAyahs: 3, revelationType: 'Medinan', startPage: 603 },
  { number: 111, englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fiber', arabicName: 'المسد', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 603 },
  { number: 112, englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', arabicName: 'الإخلاص', numberOfAyahs: 4, revelationType: 'Meccan', startPage: 604 },
  { number: 113, englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', arabicName: 'الفلق', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 604 },
  { number: 114, englishName: 'An-Nas', englishNameTranslation: 'Mankind', arabicName: 'الناس', numberOfAyahs: 6, revelationType: 'Meccan', startPage: 604 }
];

export interface AyahItem {
  numberInSurah: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

export const sampleSurahsAyahs: Record<number, AyahItem[]> = {
  1: [
    { numberInSurah: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', transliteration: 'Bismillāhir-raḥmānir-raḥīm', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
    { numberInSurah: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', transliteration: 'Al-ḥamdu lillāhi rabbil-ʿālamīn', translation: '[All] praise is [due] to Allah, Lord of the worlds -' },
    { numberInSurah: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', transliteration: 'Ar-raḥmānir-raḥīm', translation: 'The Entirely Merciful, the Especially Merciful,' },
    { numberInSurah: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', transliteration: 'Māliki yawmid-dīn', translation: 'Sovereign of the Day of Recompense.' },
    { numberInSurah: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', transliteration: 'Iyyāka naʿbudu wa-iyyāka nastaʿīn', translation: 'It is You we worship and You we ask for help.' },
    { numberInSurah: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', transliteration: 'Ihdinaṣ-ṣirāṭal-mustaqīm', translation: 'Guide us to the straight path -' },
    { numberInSurah: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', transliteration: 'Ṣirāṭal-ladhīna anʿamta ʿalayhim ghayril-maghḍūbi ʿalayhim wa-laḍ-ḍāllīn', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' }
  ],
  112: [
    { numberInSurah: 1, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', transliteration: "Qul huwa Allāhu aḥad", translation: 'Say, "He is Allah, [who is] One,' },
    { numberInSurah: 2, arabic: 'اللَّهُ الصَّمَدُ', transliteration: 'Allāhuṣ-ṣamad', translation: 'Allah, the Eternal Refuge.' },
    { numberInSurah: 3, arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', transliteration: 'Lam yalid wa lam yūlad', translation: 'He neither begets nor is born,' },
    { numberInSurah: 4, arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', transliteration: 'Wa lam yakun lahu kufuwan aḥad', translation: 'Nor is there to Him any equivalent."' }
  ],
  113: [
    { numberInSurah: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', transliteration: 'Qul aʿūdhu bi-rabbil-falaq', translation: 'Say, "I seek refuge in the Lord of daybreak' },
    { numberInSurah: 2, arabic: 'مِن شَرِّ مَا خَلَقَ', transliteration: 'Min sharri mā khalaq', translation: 'From the evil of that which He created' },
    { numberInSurah: 3, arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', transliteration: 'Wa min sharri ghāsiqin idhā waqab', translation: 'And from the evil of darkness when it settles' },
    { numberInSurah: 4, arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', transliteration: 'Wa min sharrin-naffāthāti fīl-ʿuqad', translation: 'And from the evil of the blowers in knots' },
    { numberInSurah: 5, arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', transliteration: 'Wa min sharri ḥāsidin idhā ḥasad', translation: 'And from the evil of an envier when he envies."' }
  ],
  114: [
    { numberInSurah: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', transliteration: 'Qul aʿūdhu bi-rabbin-nās', translation: 'Say, "I seek refuge in the Lord of mankind,' },
    { numberInSurah: 2, arabic: 'مَلِكِ النَّاسِ', transliteration: 'Malikin-nās', translation: 'The Sovereign of mankind,' },
    { numberInSurah: 3, arabic: 'إِلَٰهِ النَّاسِ', transliteration: 'Ilāhin-nās', translation: 'The God of mankind,' },
    { numberInSurah: 4, arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', transliteration: 'Min sharril-waswāsil-khannās', translation: 'From the evil of the retreating whisperer -' },
    { numberInSurah: 5, arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', transliteration: 'Alladhī yuwaswisu fī ṣudūrin-nās', translation: 'Who whispers [evil] into the breasts of mankind -' },
    { numberInSurah: 6, arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', transliteration: 'Minal-jinnati wan-nās', translation: 'From among the jinn and mankind."' }
  ]
};

export interface ManzilSection {
  title: string;
  source: string;
  arabic: string;
  translation: string;
}

export const manzilVerses: ManzilSection[] = [
  {
    title: 'Surah Al-Fatihah (Complete)',
    source: 'Surah 1: 1-7',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    translation: 'In the name of Allah, Most Gracious, Most Merciful. All praise is for Allah, Lord of all the worlds. The Entirely Merciful, the Especially Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us on the Straight Path. The path of those on whom You bestowed Your Grace, not of those who earned Your anger, nor of those who went astray.'
  },
  {
    title: 'Ayat al-Kursi (The Throne Verse)',
    source: 'Surah Al-Baqarah 2: 255',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.'
  },
  {
    title: 'Amanar-Rasul (End of Surah Al-Baqarah)',
    source: 'Surah Al-Baqarah 2: 285-286',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allah and His angels and His books and His messengers, [saying], "We make no distinction between any of His messengers." And they say, "We hear and we obey. [We seek] Your forgiveness, our Lord, and to You is the final destination." Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned. "Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people."'
  },
  {
    title: 'Al-Mu’awwidhatayn (The Verses of Protection)',
    source: 'Surah Al-Falaq & Surah An-Nas',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    translation: 'Say: I seek refuge in the Lord of daybreak from the evil of what He created, and from the evil of darkness when it settles, and from the evil of blowers in knots, and from the evil of an envier when he envies. Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers into the hearts of mankind, from among the jinn and mankind.'
  }
];

export interface HisnItem {
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
  benefit: string;
}

export const hisnulMuslimDuas: HisnItem[] = [
  {
    title: 'Morning & Evening Master Supplication (Sayyid al-Istighfar)',
    category: 'Morning & Evening',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allāhumma anta Rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduka, wa anā ʿalā ʿahdika wa waʿdika mastataʿtu, aʿūdhu bika min sharri mā ṣanaʿtu, abū'u laka biniʿmatika ʿalayya, wa abū'u bidhanbī faghfir lī fa'innahu lā yaghfirudh-dhunūba illā anta",
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    benefit: 'Whoever recites this with conviction in the morning and dies that day enters Paradise; and similarly in the evening.'
  },
  {
    title: 'Protection from All Harm (Recited 3 times)',
    category: 'Protection',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillāhil-ladhī lā yaḍurru maʿasmihī shay'un fīl-arḍi wa lā fīs-samā'i wa huwas-Samīʿul-ʿAlīm",
    translation: 'In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.',
    benefit: 'Recited 3 times in morning and evening protects from unexpected affliction and venomous stings.'
  },
  {
    title: 'Dua Before Sleeping',
    category: 'Night & Sleep',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: "Bismikallāhumma amūtu wa aḥyā",
    translation: 'In Your Name, O Allah, I die and I live.',
    benefit: 'Sunnah supplication prior to sleeping on the right side.'
  },
  {
    title: 'Dua When Entering the Hospital / Visiting the Sick',
    category: 'Illness & Healing',
    arabic: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Lā ba’sa ṭahūrun in shā’ Allāh',
    translation: 'No harm, may it be a purification, if Allah wills.',
    benefit: 'Brings comfort, hope, and divine healing to the afflicted patient.'
  }
];

export function getHijriDate(offsetDays: number = 1): { day: number; monthName: string; year: number; formatted: string } {
  const today = new Date();
  const adjusted = new Date(today.getTime() + offsetDays * 86400000);
  
  const islamicMonths = [
    'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
  ];
  
  const diffTime = adjusted.getTime() - new Date('2026-06-16').getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const hijriYear = 1448;
  const daysInYear = Math.floor(diffDays % 354);
  const monthIndex = Math.min(11, Math.max(0, Math.floor((daysInYear + 100) / 29.5) % 12));
  const dayOfMonth = Math.max(1, Math.min(30, Math.floor((daysInYear + 10) % 29.5) + 1));
  
  const formatted = `${dayOfMonth} ${islamicMonths[monthIndex]} ${hijriYear} AH`;
  return {
    day: dayOfMonth,
    monthName: islamicMonths[monthIndex],
    year: hijriYear,
    formatted
  };
}
