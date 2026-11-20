import { QuestionItem } from '../types';

export const hajjQuestions: QuestionItem[] = [
  {
    id: 'hajj-1',
    question: 'During Hajj in Mina/Arafat, a pilgrim collapses with a core body temperature of 41.5°C (106.7°F), hot dry skin, altered sensorium, and confusion. What is the emergency medical diagnosis and immediate management?',
    options: [
      'Heat Stroke: Immediate rapid evaporative cooling with cool water spray, fanning, ice to axillae/groin, and IV Normal Saline',
      'Heat Exhaustion: Administer oral ORS and rest in tent',
      'Acute Meningococcemia: Administer IV Ceftriaxone immediately without cooling',
      'Hypoglycemic Coma: Give oral fruit juice'
    ],
    correctIndex: 0,
    explanation: 'Heat stroke is a medical emergency with core temperature > 40°C and CNS dysfunction. Without immediate rapid cooling, multi-organ failure and cerebral edema ensue within minutes.',
    category: 'Hajj Emergency Medicine'
  },
  {
    id: 'hajj-2',
    question: 'Which mandatory vaccine is required by the Kingdom of Saudi Arabia (KSA) Ministry of Health for all international pilgrims performing Hajj & Umrah at least 10 days before arrival?',
    options: [
      'Quadrivalent Meningococcal Conjugate Vaccine (ACWY)',
      'Hepatitis A & B combined',
      'Typhoid Vi Polysaccharide',
      'Varicella Zoster Vaccine'
    ],
    correctIndex: 0,
    explanation: 'Quadrivalent meningococcal vaccine (ACYW135) is legally mandatory to prevent catastrophic epidemic outbreaks of Neisseria meningitidis during the mass religious gathering.',
    category: 'Saudi Health Regulations'
  },
  {
    id: 'hajj-3',
    question: 'Under START triage protocol during mass gathering crowd stampedes or incidents in Jamarat, a patient who is not breathing after simple airway positioning should be categorized with which triage color tag?',
    options: ['Black (Deceased / Expectant)', 'Red (Immediate)', 'Yellow (Delayed)', 'Green (Minor)', 'White'],
    correctIndex: 0,
    explanation: 'In mass casualty incidents (MCI), a casualty who does not resume spontaneous respiration after airway opening is assigned a BLACK tag (expectant/deceased) to conserve limited medical resources for salvageable victims.',
    category: 'Mass Casualty Triage'
  },
  {
    id: 'hajj-4',
    question: 'What is the most prevalent infectious complaint treated at Pakistan Hajj Medical Mission (PHMM) dispensaries in Makkah and Madinah?',
    options: [
      'Upper Respiratory Tract Infections (Hajj Cough / Viral Bronchitis)',
      'Gastroenteritis & Food Poisoning',
      'Malaria & Dengue',
      'Cutaneous Leishmaniasis'
    ],
    correctIndex: 0,
    explanation: 'Upper respiratory infections ("Hajj Cough") affect up to 80% of pilgrims due to extreme crowd density, sharing tents in Mina, dust, air conditioning shifts, and airborne viral transmission.',
    category: 'Epidemiology'
  }
];
