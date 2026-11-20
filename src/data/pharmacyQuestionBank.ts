import { QuestionItem } from '../types';

export const pharmacyQuestions: QuestionItem[] = [
  {
    id: 'pharm-1',
    question: 'According to the Pakistan Pharmacy Act 1967 and standard dispensing protocols, which schedule governs prescription-only narcotics and controlled psychotropic substances?',
    options: ['Schedule B', 'Schedule G & D', 'Schedule E', 'Schedule X'],
    correctIndex: 1,
    explanation: 'Controlled substances, sedatives, and narcotics require strict register logs, verified doctor PMDC/PMC registration numbers, and sealed storage under Schedule G/D.',
    category: 'Pharmacy Jurisprudence'
  },
  {
    id: 'pharm-2',
    question: 'A doctor prescribes Amoxicillin Suspension 250 mg TID for 7 days to a child weighing 20 kg. The available bottle has a concentration of 125 mg / 5 mL. How many mL should be given per dose?',
    options: ['10 mL', '5 mL', '15 mL', '7.5 mL'],
    correctIndex: 0,
    explanation: 'Dose required = 250 mg. Concentration = 125 mg in 5 mL. Required Volume = (250 mg / 125 mg) * 5 mL = 2 * 5 mL = 10 mL per dose.',
    category: 'Pharmaceutical Calculations'
  },
  {
    id: 'pharm-3',
    question: 'Which class of antibiotics is contraindicated in children under 8 years of age due to permanent yellow-brown dental enamel discoloration and bone growth impairment?',
    options: ['Tetracyclines (e.g. Doxycycline)', 'Macrolides (e.g. Azithromycin)', 'Cephalosporins (e.g. Cefixime)', 'Penicillins (e.g. Amoxicillin)'],
    correctIndex: 0,
    explanation: 'Tetracyclines chelate divalent calcium ions in developing teeth and bones, leading to permanent enamel hypoplasia and brown staining in young children.',
    category: 'Pharmacology'
  },
  {
    id: 'pharm-4',
    question: 'What is the primary dangerous drug interaction when a patient taking Warfarin is concurrently started on Ciprofloxacin?',
    options: [
      'Inhibition of CYP2C9 and CYP1A2 leading to markedly elevated INR and severe hemorrhage risk',
      'Loss of ciprofloxacin antibacterial efficacy',
      'Acute renal tubular necrosis',
      'Rapid clearance of warfarin causing thromboembolism'
    ],
    correctIndex: 0,
    explanation: 'Fluoroquinolones like Ciprofloxacin strongly inhibit hepatic cytochrome P450 enzymes that metabolize Warfarin, causing toxic warfarin accumulation and dangerous bleeding.',
    category: 'Clinical Drug Interactions'
  },
  {
    id: 'pharm-5',
    question: 'What is the optimum cold-chain storage temperature range for human insulin vials and live-attenuated vaccines?',
    options: ['+2°C to +8°C', '-10°C to -2°C', '+15°C to +25°C', '0°C to +2°C'],
    correctIndex: 0,
    explanation: 'Standard biological cold-chain refrigeration requires 2°C to 8°C. Freezing (below 0°C) denatures the tertiary polypeptide structure of insulin and inactivates vaccines.',
    category: 'Storage & Dispensing'
  }
];
