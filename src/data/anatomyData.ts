import { AnatomySystem, QuestionItem } from '../types';

export const anatomySystems: AnatomySystem[] = [
  {
    id: 'skeletal',
    name: 'Skeletal System',
    image: '/assets/img_anatomy_skeletal.jpg',
    themeColor: '#854d0e',
    overview: 'The human skeletal framework contains 206 bones that provide rigid support, vital organ shielding, calcium homeostasis reservoir, and active red blood cell hematopoiesis within specialized marrow cavities.',
    parts: [
      {
        name: 'Femur',
        scientificName: 'Os femoris',
        description: 'The longest, strongest, and heaviest bone in the entire human body, carrying axial gravity weight.',
        clinicalNotes: 'Femoral neck fractures in elderly patients can cause avascular necrosis of the femoral head due to medial circumflex artery damage.',
        drugTargetNotes: 'Bisphosphonates (Alendronate, Zoledronic acid) selectively bind hydroxyapatite to inhibit osteoclast bone resorption.',
        funFact: 'Femur bone is 4 times stronger than concrete of equivalent dimensions!'
      },
      {
        name: 'Cranium (Skull)',
        scientificName: 'Ossa cranii',
        description: 'Composed of 22 flat bones fused by fibrous sutures protecting the cerebral cortex.',
        clinicalNotes: 'Persistent fontanelles in neonates provide vital clinical indicators of dehydration (sunken) or raised ICP (bulging).',
        drugTargetNotes: 'Mannitol 20% osmotic diuretic rapidly draws fluid across the blood-brain barrier to alleviate acute intracranial pressure.',
        funFact: 'The stapes inside the temporal bone of the skull is the smallest bone in the human body, measuring only 3 mm.'
      },
      {
        name: 'Clavicle',
        scientificName: 'Clavicula',
        description: 'An S-shaped long bone acting as a horizontal strut connecting the sternum to the scapula.',
        clinicalNotes: 'Most commonly fractured bone in the body, typically at the junction of the middle and outer thirds from a fall on an outstretched hand (FOOSH).',
        drugTargetNotes: 'NSAIDs (Naproxen, Ibuprofen) provide first-line analgesia; avoid prolonged excessive doses during early fracture callus healing.',
        funFact: 'It is the first bone in the human embryo to begin ossification (around the 5th week of gestation).'
      }
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    image: '/assets/img_anatomy_cardiovascular.jpg',
    themeColor: '#dc2626',
    overview: 'Composed of the muscular heart and a 60,000-mile vascular network circulating 5 liters of blood per minute to distribute oxygen, electrolytes, hormones, and immune cells.',
    parts: [
      {
        name: 'Left Ventricle',
        scientificName: 'Ventriculus sinister',
        description: 'Thick muscular chamber (3x thicker than right ventricle) generating systolic pressure (120 mmHg) to pump blood into systemic circulation.',
        clinicalNotes: 'Chronic hypertension leads to concentric left ventricular hypertrophy (LVH), predisposing to diastolic heart failure and arrhythmias.',
        drugTargetNotes: 'ACE inhibitors (Ramipril, Enalapril) and ARBs block the renin-angiotensin-aldosterone axis, reversing maladaptive ventricular remodeling.',
        funFact: 'The left ventricle generates enough pressure to squirt blood across a room up to 30 feet!'
      },
      {
        name: 'Coronary Arteries',
        scientificName: 'Arteriae coronariae',
        description: 'Left and right coronary arteries arising directly from the aortic sinus supplying oxygenated blood to the contracting myocardium.',
        clinicalNotes: 'Acute occlusion of the Left Anterior Descending (LAD) artery causes anterior wall myocardial infarction ("The Widowmaker").',
        drugTargetNotes: 'Sublingual Nitroglycerin rapidly generates nitric oxide (NO) causing venous and coronary vasodilation, easing cardiac preload and angina.',
        funFact: 'Coronary blood flow to the left ventricle occurs predominantly during cardiac diastole, not systole.'
      }
    ]
  },
  {
    id: 'respiratory',
    name: 'Respiratory System',
    image: '/assets/img_anatomy_respiratory.jpg',
    themeColor: '#0284c7',
    overview: 'Conducts atmospheric air through the trachea and bronchial tree to 300 million pulmonary alveoli where passive gas exchange diffuses O2 into capillary hemoglobin and removes CO2.',
    parts: [
      {
        name: 'Pulmonary Alveoli',
        scientificName: 'Alveoli pulmonis',
        description: 'Microscopic spherical sacs lined by Type I and Type II pneumocytes creating a massive 100 square meter surface area for gas diffusion.',
        clinicalNotes: 'Deficiency of pulmonary surfactant produced by Type II pneumocytes causes Infant Respiratory Distress Syndrome (IRDS) in pre-term neonates.',
        drugTargetNotes: 'Inhaled corticosteroids (Budesonide, Fluticasone) suppress eosinophilic airway inflammation and bronchoconstriction in asthma.',
        funFact: 'If all alveoli were unfolded flat, they would cover the entire surface area of a singles tennis court!'
      },
      {
        name: 'Trachea (Windpipe)',
        scientificName: 'Trachea',
        description: 'A 10-12 cm flexible tube reinforced by 16-20 C-shaped hyaline cartilage rings preventing collapse during negative intrathoracic inhalation pressure.',
        clinicalNotes: 'Emergency cricothyroidotomy is performed through the cricothyroid membrane when upper airway obstruction prevents endotracheal intubation.',
        drugTargetNotes: 'Beta-2 agonists (Salbutamol) stimulate Gs-coupled adenylyl cyclase to relax tracheobronchial smooth muscle.',
        funFact: 'The ciliated pseudostratified columnar epithelium beats 1,000 times per minute in a coordinated upward escalator to clear debris.'
      }
    ]
  },
  {
    id: 'digestive',
    name: 'Digestive System',
    image: '/assets/img_anatomy_digestive.jpg',
    themeColor: '#d97706',
    overview: 'Gastrointestinal tract spanning from mouth to anus, breaking down macronutrients through mechanical peristalsis, gastric acid, pancreatic enzymes, and hepatic bile.',
    parts: [
      {
        name: 'Liver',
        scientificName: 'Hepar',
        description: 'The largest internal organ (1.5 kg) performing over 500 metabolic functions, including bile production, glycogen storage, and xenobiotic detoxification.',
        clinicalNotes: 'Acetaminophen (Paracetamol) overdose exhausts hepatic glutathione stores, causing toxic NAPQI metabolite accumulation and acute hepatic necrosis.',
        drugTargetNotes: 'N-acetylcysteine (NAC) acts as a glutathione precursor and antidote if administered within 8-10 hours of paracetamol poisoning.',
        funFact: 'The liver is the only human internal organ capable of full biological regeneration from as little as 25% of remaining tissue.'
      },
      {
        name: 'Stomach',
        scientificName: 'Gaster / Ventriculus',
        description: 'J-shaped muscular organ secreting 2 liters of gastric juice per day with a pH of 1.5 to 2.0 via parietal cell H+/K+ ATPase pumps.',
        clinicalNotes: 'Helicobacter pylori colonization disrupts the mucosal bicarbonate barrier, leading to peptic ulcer disease and gastric adenocarcinoma.',
        drugTargetNotes: 'Proton Pump Inhibitors (Omeprazole, Esomeprazole) irreversibly bind the active H+/K+ ATPase pump to achieve profound acid suppression.',
        funFact: 'The stomach produces a brand new epithelial mucosal lining every 3 to 4 days to prevent auto-digestion from its own concentrated hydrochloric acid.'
      }
    ]
  },
  {
    id: 'nervous',
    name: 'Nervous System',
    image: '/assets/img_anatomy_nervous.jpg',
    themeColor: '#7c3aed',
    overview: 'Comprising the central nervous system (brain and spinal cord) and peripheral nerves, coordinating sensations, motor reflexes, cognitive thought, and autonomic homeostasis.',
    parts: [
      {
        name: 'Cerebral Cortex',
        scientificName: 'Cortex cerebri',
        description: 'The outer folded gray matter layer of the brain responsible for conscious thought, memory, voluntary movement, speech, and sensory processing.',
        clinicalNotes: 'Ischemic stroke in the middle cerebral artery (MCA) territory results in contralateral hemiparesis and aphasia (Broca or Wernicke).',
        drugTargetNotes: 'Intravenous tissue Plasminogen Activator (Alteplase / IV tPA) dissolves fibrin clots when administered within 4.5 hours of acute ischemic stroke onset.',
        funFact: 'The brain accounts for only 2% of total human body weight yet consumes over 20% of resting oxygen and glucose intake.'
      }
    ]
  },
  {
    id: 'endocrine',
    name: 'Endocrine System',
    image: '/assets/img_anatomy_endocrine.jpg',
    themeColor: '#059669',
    overview: 'Ductless glands releasing specialized hormones directly into capillary bloodstream to regulate metabolic rate, electrolyte balance, blood glucose, and growth.',
    parts: [
      {
        name: 'Pancreatic Islets of Langerhans',
        scientificName: 'Insulae pancreaticae',
        description: 'Micro-clusters of endocrine cells: Beta cells synthesize insulin, Alpha cells secrete glucagon, and Delta cells produce somatostatin.',
        clinicalNotes: 'Autoimmune destruction of pancreatic beta cells leads to absolute insulin deficiency in Type 1 Diabetes Mellitus, risking Diabetic Ketoacidosis (DKA).',
        drugTargetNotes: 'Metformin decreases hepatic gluconeogenesis via AMPK activation; SGLT-2 inhibitors (Empagliflozin) promote renal glucose excretion.',
        funFact: 'The islets of Langerhans constitute only 1 to 2% of total pancreatic mass, yet receive 10 to 15% of pancreatic blood flow.'
      }
    ]
  }
];

export const anatomyQuizQuestions: QuestionItem[] = [
  {
    id: 'anat-1',
    question: 'Which artery is commonly known as "The Widowmaker" due to the catastrophic consequences of its acute occlusion?',
    options: ['Left Anterior Descending (LAD) Artery', 'Right Coronary Artery (RCA)', 'Circumflex Artery', 'Posterior Descending Artery (PDA)'],
    correctIndex: 0,
    explanation: 'The Left Anterior Descending (LAD) artery supplies the anterior wall of the left ventricle and the majority of the interventricular septum.',
    category: 'Cardiovascular'
  },
  {
    id: 'anat-2',
    question: 'Which cells in the pulmonary alveoli are primarily responsible for producing surfactant to lower surface tension?',
    options: ['Type I Pneumocytes', 'Type II Pneumocytes', 'Alveolar Macrophages', 'Goblet Cells'],
    correctIndex: 1,
    explanation: 'Type II pneumocytes synthesize and secrete dipalmitoylphosphatidylcholine (surfactant), which prevents alveolar collapse at end-expiration.',
    category: 'Respiratory'
  },
  {
    id: 'anat-3',
    question: 'Which bone is the longest and strongest bone in the human skeleton?',
    options: ['Tibia', 'Humerus', 'Femur', 'Fibula'],
    correctIndex: 2,
    explanation: 'The femur (thigh bone) is the longest and heaviest bone, engineered to withstand axial compressive forces up to 30 times human body weight.',
    category: 'Skeletal'
  },
  {
    id: 'anat-4',
    question: 'What is the specific biochemical antidote administered for acute Acetaminophen (Paracetamol) hepatotoxicity?',
    options: ['Flumazenil', 'N-acetylcysteine (NAC)', 'Naloxone', 'Atropine Sulfate'],
    correctIndex: 1,
    explanation: 'N-acetylcysteine restores hepatic glutathione reserves, allowing safe detoxification of the reactive metabolite NAPQI into non-toxic mercapturic acid.',
    category: 'Digestive & Clinical'
  },
  {
    id: 'anat-5',
    question: 'Which cranial nerve is responsible for parasympathetic innervation to the heart, lungs, and gastrointestinal tract up to the splenic flexure?',
    options: ['Cranial Nerve X (Vagus Nerve)', 'Cranial Nerve VII (Facial Nerve)', 'Cranial Nerve IX (Glossopharyngeal)', 'Cranial Nerve III (Oculomotor)'],
    correctIndex: 0,
    explanation: 'The Vagus nerve (CN X) provides extensive parasympathetic control over heart rate (slowing it down) and digestive motility and secretions.',
    category: 'Nervous'
  }
];
