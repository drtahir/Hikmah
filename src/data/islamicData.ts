import { SurahMeta } from '../types';

export const surahsList: SurahMeta[] = [
  { number: 1, englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', arabicName: 'الفاتحة', numberOfAyahs: 7, revelationType: 'Meccan' },
  { number: 2, englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', arabicName: 'البقرة', numberOfAyahs: 286, revelationType: 'Medinan' },
  { number: 3, englishName: "Ali 'Imran", englishNameTranslation: 'Family of Imran', arabicName: 'آل عمران', numberOfAyahs: 200, revelationType: 'Medinan' },
  { number: 4, englishName: 'An-Nisa', englishNameTranslation: 'The Women', arabicName: 'النساء', numberOfAyahs: 176, revelationType: 'Medinan' },
  { number: 5, englishName: "Al-Ma'idah", englishNameTranslation: 'The Table Spread', arabicName: 'المائدة', numberOfAyahs: 120, revelationType: 'Medinan' },
  { number: 6, englishName: "Al-An'am", englishNameTranslation: 'The Cattle', arabicName: 'الأنعام', numberOfAyahs: 165, revelationType: 'Meccan' },
  { number: 7, englishName: "Al-A'raf", englishNameTranslation: 'The Heights', arabicName: 'الأعراف', numberOfAyahs: 206, revelationType: 'Meccan' },
  { number: 8, englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', arabicName: 'الأنفال', numberOfAyahs: 75, revelationType: 'Medinan' },
  { number: 9, englishName: 'At-Tawbah', englishNameTranslation: 'The Repentance', arabicName: 'التوبة', numberOfAyahs: 129, revelationType: 'Medinan' },
  { number: 10, englishName: 'Yunus', englishNameTranslation: 'Jonah', arabicName: 'يونس', numberOfAyahs: 109, revelationType: 'Meccan' },
  { number: 18, englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', arabicName: 'الكهف', numberOfAyahs: 110, revelationType: 'Meccan' },
  { number: 36, englishName: 'Ya-Sin', englishNameTranslation: 'Ya-Sin', arabicName: 'يس', numberOfAyahs: 83, revelationType: 'Meccan' },
  { number: 55, englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', arabicName: 'الرحمن', numberOfAyahs: 78, revelationType: 'Medinan' },
  { number: 56, englishName: "Al-Waqi'ah", englishNameTranslation: 'The Inevitable', arabicName: 'الواقعة', numberOfAyahs: 96, revelationType: 'Meccan' },
  { number: 67, englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', arabicName: 'الملك', numberOfAyahs: 30, revelationType: 'Meccan' },
  { number: 112, englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', arabicName: 'الإخلاص', numberOfAyahs: 4, revelationType: 'Meccan' },
  { number: 113, englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', arabicName: 'الفلق', numberOfAyahs: 5, revelationType: 'Meccan' },
  { number: 114, englishName: 'An-Nas', englishNameTranslation: 'Mankind', arabicName: 'الناس', numberOfAyahs: 6, revelationType: 'Meccan' }
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
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ',
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allah and His angels and His books and His messengers, [saying], "We make no distinction between any of His messengers." And they say, "We hear and we obey. [We seek] Your forgiveness, our Lord, and to You is the final destination."'
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
