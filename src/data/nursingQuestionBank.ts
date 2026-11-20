import { QuestionItem } from '../types';

export const nursingQuestions: QuestionItem[] = [
  {
    id: 'nurs-1',
    question: 'A client with heart failure is prescribed Digoxin 0.25 mg daily. Before administering the medication, which assessment finding requires the nurse to withhold the dose and notify the physician immediately?',
    options: [
      'Apical pulse rate of 52 beats per minute',
      'Blood pressure of 136/84 mmHg',
      'Serum potassium level of 4.2 mEq/L',
      'Respiratory rate of 18 breaths per minute'
    ],
    correctIndex: 0,
    explanation: 'Digoxin exerts a negative chronotropic effect. An apical pulse below 60 bpm in an adult indicates impending bradycardia and potential digitalis toxicity. The nurse must withhold the dose and re-check apical pulse.',
    category: 'Cardiovascular Nursing'
  },
  {
    id: 'nurs-2',
    question: 'An adult patient with severe septic shock is admitted to the ICU. The nurse calculates the Mean Arterial Pressure (MAP) for a blood pressure reading of 90/60 mmHg. What is the MAP, and is it adequate for vital organ perfusion?',
    options: [
      '70 mmHg (Adequate, MAP > 65 mmHg)',
      '60 mmHg (Inadequate, requires immediate vasopressor titration)',
      '80 mmHg (Adequate)',
      '50 mmHg (Severely low)'
    ],
    correctIndex: 0,
    explanation: 'MAP = [SBP + (2 x DBP)] / 3 = [90 + (2 x 60)] / 3 = 210 / 3 = 70 mmHg. A minimum MAP of 65 mmHg is necessary to maintain adequate end-organ perfusion (kidneys, brain, coronary).',
    category: 'Critical Care / Shock'
  },
  {
    id: 'nurs-3',
    question: 'A nurse is preparing to administer regular insulin and NPH insulin in a single syringe. In what sequence must the nurse perform the air injection and withdrawal?',
    options: [
      'Inject air into NPH (cloudy), inject air into Regular (clear), withdraw Regular, withdraw NPH',
      'Inject air into Regular, inject air into NPH, withdraw NPH, withdraw Regular',
      'Withdraw NPH first, then withdraw Regular without air injection',
      'Inject air into Regular and withdraw Regular first, then inject air into NPH and withdraw NPH'
    ],
    correctIndex: 0,
    explanation: 'Mnemonic: "Clear before Cloudy" for withdrawal. Inject air into cloudy (NPH) first, inject air into clear (Regular), draw up clear (Regular), then draw up cloudy (NPH). This prevents contamination of fast-acting insulin with intermediate-acting insulin.',
    category: 'Pharmacology Nursing'
  },
  {
    id: 'nurs-4',
    question: 'A patient with chronic obstructive pulmonary disease (COPD) is receiving oxygen via nasal cannula. The nurse notices the flow rate is set at 6 L/min and the patient appears drowsy and bradypneic. What is the pathophysiological cause?',
    options: [
      'Loss of the hypoxic drive to breathe due to hyperoxia and carbon dioxide retention',
      'Development of acute pulmonary embolism',
      'Hypoglycemic episode triggered by beta-agonist inhalers',
      'Severe metabolic alkalosis from hyperventilation'
    ],
    correctIndex: 0,
    explanation: 'In chronic COPD, chronic hypercapnia blunts the central chemoreceptors, making hypoxemia the primary respiratory drive. High-flow oxygen eliminates this hypoxic drive, causing hypoventilation, CO2 narcosis, and respiratory arrest.',
    category: 'Respiratory Nursing'
  },
  {
    id: 'nurs-5',
    question: 'Which sign is elicited by inflating a blood pressure cuff on the upper arm to 20 mmHg above systolic pressure for 3 minutes, producing carpopedal spasm, indicative of hypocalcemia?',
    options: [
      'Trousseau\'s Sign',
      'Chvostek\'s Sign',
      'Kernig\'s Sign',
      'Brudzinski\'s Sign'
    ],
    correctIndex: 0,
    explanation: 'Trousseau\'s sign is latent tetany manifested as carpal spasm when arterial blood flow to the arm is occluded with a sphygmomanometer cuff. It indicates neuromuscular irritability from severe hypocalcemia.',
    category: 'Electrolytes & Fluids'
  },
  {
    id: 'nurs-6',
    question: 'A post-operative thyroidectomy client develops laryngeal stridor and tingling around the lips (perioral paresthesia). What emergency medication should the nurse have immediately available at the bedside?',
    options: [
      '10% Calcium Gluconate IV',
      'Potassium Chloride IV',
      'Sodium Bicarbonate IV',
      'Dextrose 50% IV'
    ],
    correctIndex: 0,
    explanation: 'Accidental parathyroid gland removal or devascularization during thyroid surgery causes acute hypoparathyroidism, leading to life-threatening hypocalcemia and laryngospasm. IV 10% Calcium Gluconate is the immediate reversal agent.',
    category: 'Surgical Nursing'
  }
];
