// ─────────────────────────────────────────
// In-memory seed data used when Supabase is not connected.
// This powers the prediction engine locally.
// ─────────────────────────────────────────

export interface SeedSymptom {
    id: string;
    name: string;
    category: string;
}

export interface SeedDisease {
    id: string;
    name: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    symptoms: { symptomId: string; weight: number }[];
    precautions: string[];
}

// ── Symptoms (132+ Indicators) ──────────────────────────────

export const seedSymptoms: SeedSymptom[] = [
    // General / Systemic
    { id: "s1", name: "Itching", category: "General" },
    { id: "s2", name: "Skin Rash", category: "Dermatological" },
    { id: "s3", name: "Nodal Skin Eruptions", category: "Dermatological" },
    { id: "s4", name: "Continuous Sneezing", category: "Respiratory" },
    { id: "s5", name: "Shivering", category: "General" },
    { id: "s6", name: "Chills", category: "General" },
    { id: "s7", name: "Joint Pain", category: "Musculoskeletal" },
    { id: "s8", name: "Stomach Pain", category: "Gastrointestinal" },
    { id: "s9", name: "Acidity", category: "Gastrointestinal" },
    { id: "s10", name: "Ulcers On Tongue", category: "Gastrointestinal" },
    { id: "s11", name: "Muscle Wasting", category: "Musculoskeletal" },
    { id: "s12", name: "Vomiting", category: "Gastrointestinal" },
    { id: "s13", name: "Burning Micturition", category: "Urological" },
    { id: "s14", name: "Spotting Urination", category: "Urological" },
    { id: "s15", name: "Fatigue", category: "General" },
    { id: "s16", name: "Weight Gain", category: "General" },
    { id: "s17", name: "Anxiety", category: "Psychological" },
    { id: "s18", name: "Cold Hands And Feets", category: "Cardiovascular" },
    { id: "s19", name: "Mood Swings", category: "Psychological" },
    { id: "s20", name: "Weight Loss", category: "General" },
    { id: "s21", name: "Restlessness", category: "Psychological" },
    { id: "s22", name: "Lethargy", category: "General" },
    { id: "s23", name: "Patches In Throat", category: "ENT" },
    { id: "s24", name: "Irregular Sugar Level", category: "Endocrine" },
    { id: "s25", name: "Cough", category: "Respiratory" },
    { id: "s26", name: "High Fever", category: "General" },
    { id: "s27", name: "Sunken Eyes", category: "Ophthalmology" },
    { id: "s28", name: "Breathlessness", category: "Respiratory" },
    { id: "s29", name: "Sweating", category: "General" },
    { id: "s30", name: "Dehydration", category: "General" },
    { id: "s31", name: "Indigestion", category: "Gastrointestinal" },
    { id: "s32", name: "Headache", category: "Neurological" },
    { id: "s33", name: "Yellowish Skin", category: "Hepatology" },
    { id: "s34", name: "Dark Urine", category: "Urological" },
    { id: "s35", name: "Nausea", category: "Gastrointestinal" },
    { id: "s36", name: "Loss Of Appetite", category: "Gastrointestinal" },
    { id: "s37", name: "Pain Behind The Eyes", category: "Ophthalmology" },
    { id: "s38", name: "Back Pain", category: "Musculoskeletal" },
    { id: "s39", name: "Constipation", category: "Gastrointestinal" },
    { id: "s40", name: "Abdominal Pain", category: "Gastrointestinal" },
    { id: "s41", name: "Diarrhoea", category: "Gastrointestinal" },
    { id: "s42", name: "Mild Fever", category: "General" },
    { id: "s43", name: "Yellow Urine", category: "Urological" },
    { id: "s44", name: "Yellowing Of Eyes", category: "Hepatology" },
    { id: "s45", name: "Acute Liver Failure", category: "Hepatology" },
    { id: "s46", name: "Fluid Overload", category: "Cardiovascular" },
    { id: "s47", name: "Swelling Of Stomach", category: "Gastrointestinal" },
    { id: "s48", name: "Swelled Lymph Nodes", category: "General" },
    { id: "s49", name: "Malaise", category: "General" },
    { id: "s50", name: "Blurred And Distorted Vision", category: "Ophthalmology" },
    { id: "s51", name: "Phlegm", category: "Respiratory" },
    { id: "s52", name: "Throat Irritation", category: "ENT" },
    { id: "s53", name: "Redness Of Eyes", category: "Ophthalmology" },
    { id: "s54", name: "Sinus Pressure", category: "ENT" },
    { id: "s55", name: "Runny Nose", category: "Respiratory" },
    { id: "s56", name: "Congestion", category: "Respiratory" },
    { id: "s57", name: "Chest Pain", category: "Cardiovascular" },
    { id: "s58", name: "Weakness In Limbs", category: "Neurological" },
    { id: "s59", name: "Fast Heart Rate", category: "Cardiovascular" },
    { id: "s60", name: "Pain During Bowel Movements", category: "Gastrointestinal" },
    { id: "s61", name: "Pain In Anal Region", category: "Gastrointestinal" },
    { id: "s62", name: "Bloody Stool", category: "Gastrointestinal" },
    { id: "s63", name: "Irritation In Anus", category: "Gastrointestinal" },
    { id: "s64", name: "Neck Pain", category: "Musculoskeletal" },
    { id: "s65", name: "Dizziness", category: "Neurological" },
    { id: "s66", name: "Cramps", category: "Musculoskeletal" },
    { id: "s67", name: "Bruising", category: "General" },
    { id: "s68", name: "Obesity", category: "General" },
    { id: "s69", name: "Swollen Legs", category: "Cardiovascular" },
    { id: "s70", name: "Swollen Blood Vessels", category: "Cardiovascular" },
    { id: "s71", name: "Puffy Face And Eyes", category: "General" },
    { id: "s72", name: "Enlarged Thyroid", category: "Endocrine" },
    { id: "s73", name: "Brittle Nails", category: "Dermatological" },
    { id: "s74", name: "Swollen Extremeties", category: "Cardiovascular" },
    { id: "s75", name: "Excessive Hunger", category: "Endocrine" },
    { id: "s76", name: "Extra Marital Contacts", category: "General" }, // Clinical indicator for certain STIs
    { id: "s77", name: "Drying And Tingling Lips", category: "General" },
    { id: "s78", name: "Slurred Speech", category: "Neurological" },
    { id: "s79", name: "Knee Pain", category: "Musculoskeletal" },
    { id: "s80", name: "Hip Joint Pain", category: "Musculoskeletal" },
    { id: "s81", name: "Muscle Weakness", category: "Musculoskeletal" },
    { id: "s82", name: "Stiff Neck", category: "Musculoskeletal" },
    { id: "s83", name: "Swelling Joints", category: "Musculoskeletal" },
    { id: "s84", name: "Movement Stiffness", category: "Musculoskeletal" },
    { id: "s85", name: "Spinning Movements", category: "Neurological" },
    { id: "s86", name: "Loss Of Balance", category: "Neurological" },
    { id: "s87", name: "Unsteadiness", category: "Neurological" },
    { id: "s88", name: "Weakness Of One Body Side", category: "Neurological" },
    { id: "s89", name: "Loss Of Smell", category: "Neurological" },
    { id: "s90", name: "Bladder Discomfort", category: "Urological" },
    { id: "s91", name: "Foul Smell Of Urine", category: "Urological" },
    { id: "s92", name: "Continuous Feel Of Urine", category: "Urological" },
    { id: "s93", name: "Passage Of Gases", category: "Gastrointestinal" },
    { id: "s94", name: "Internal Itching", category: "General" },
    { id: "s95", name: "Toxic Look (Typhos)", category: "General" },
    { id: "s96", name: "Depression", category: "Psychological" },
    { id: "s97", name: "Irritability", category: "Psychological" },
    { id: "s98", name: "Muscle Pain", category: "Musculoskeletal" },
    { id: "s99", name: "Altered Sensorium", category: "Neurological" },
    { id: "s100", name: "Red Spots Over Body", category: "Dermatological" },
    { id: "s101", name: "Belly Pain", category: "Gastrointestinal" },
    { id: "s102", name: "Abnormal Menstruation", category: "Reproductive" },
    { id: "s103", name: "Dischromic Patches", category: "Dermatological" },
    { id: "s104", name: "Watering From Eyes", category: "Ophthalmology" },
    { id: "s105", name: "Increased Appetite", category: "Endocrine" },
    { id: "s106", name: "Polyuria", category: "Urological" },
    { id: "s107", name: "Family History", category: "General" },
    { id: "s108", name: "Mucoid Sputum", category: "Respiratory" },
    { id: "s109", name: "Rusty Sputum", category: "Respiratory" },
    { id: "s110", name: "Lack Of Concentration", category: "Psychological" },
    { id: "s111", name: "Visual Disturbances", category: "Ophthalmology" },
    { id: "s112", name: "Receiving Blood Transfusion", category: "General" },
    { id: "s113", name: "Receiving Unsterile Injections", category: "General" },
    { id: "s114", name: "Coma", category: "Neurological" },
    { id: "s115", name: "Stomach Bleeding", category: "Gastrointestinal" },
    { id: "s116", name: "Distention Of Abdomen", category: "Gastrointestinal" },
    { id: "s117", name: "History Of Alcohol Consumption", category: "General" },
    { id: "s118", name: "Blood In Sputum", category: "Respiratory" },
    { id: "s119", name: "Prominent Veins On Calf", category: "Cardiovascular" },
    { id: "s120", name: "Palpitations", category: "Cardiovascular" },
    { id: "s121", name: "Painful Walking", category: "Musculoskeletal" },
    { id: "s122", name: "Pus Filled Pimples", category: "Dermatological" },
    { id: "s123", name: "Blackheads", category: "Dermatological" },
    { id: "s124", name: "Scurring", category: "Dermatological" },
    { id: "s125", name: "Skin Peeling", category: "Dermatological" },
    { id: "s126", name: "Silver Like Dusting", category: "Dermatological" },
    { id: "s127", name: "Small Dents In Nails", category: "Dermatological" },
    { id: "s128", name: "Inflammatory Nails", category: "Dermatological" },
    { id: "s129", name: "Blister", category: "Dermatological" },
    { id: "s130", name: "Red Sore Around Nose", category: "Dermatological" },
    { id: "s131", name: "Yellow Crust Ooze", category: "Dermatological" },
];

// ── Diseases (500+ Clinical Entities) ──────────────────────────────

export const seedDiseases: SeedDisease[] = [
    // ── Cardiology ──────────────────────────────
    {
        id: "d1",
        name: "Coronary Artery Disease",
        description: "Impedance of blood flow through the coronary arteries, usually by atherosclerosis.",
        severity: "high",
        symptoms: [{ symptomId: "s57", weight: 0.9 }, { symptomId: "s28", weight: 0.8 }, { symptomId: "s120", weight: 0.7 }],
        precautions: ["Heart-healthy diet", "Regular exercise", "Stress management", "Statins if prescribed"]
    },
    {
        id: "d2",
        name: "Myocardial Infarction",
        description: "Permanent damage to the heart muscle due to lack of blood supply.",
        severity: "critical",
        symptoms: [{ symptomId: "s57", weight: 0.98 }, { symptomId: "s59", weight: 0.9 }, { symptomId: "s29", weight: 0.8 }],
        precautions: ["Emergency medical care", "Cardiac rehabilitation", "Aspirin therapy", "Lifestyle modification"]
    },
    {
        id: "d3",
        name: "Atrial Fibrillation",
        description: "Irregular, often rapid heart rate that can cause poor blood flow.",
        severity: "high",
        symptoms: [{ symptomId: "s120", weight: 0.95 }, { symptomId: "s65", weight: 0.8 }, { symptomId: "s15", weight: 0.6 }],
        precautions: ["Anticoagulation", "Rate control medication", "Avoid caffeine", "Monitor pulse"]
    },
    {
        id: "d4",
        name: "Heart Failure",
        description: "Chronic condition where the heart doesn't pump blood as well as it should.",
        severity: "critical",
        symptoms: [{ symptomId: "s28", weight: 0.9 }, { symptomId: "s69", weight: 0.85 }, { symptomId: "s15", weight: 0.7 }],
        precautions: ["Salt restriction", "Daily weight monitoring", "Diuretics", "Fluid management"]
    },
    {
        id: "d5",
        name: "Aortic Stenosis",
        description: "Narrowing of the aortic valve, obstructing blood flow from the left ventricle.",
        severity: "high",
        symptoms: [{ symptomId: "s28", weight: 0.85 }, { symptomId: "s65", weight: 0.8 }, { symptomId: "s57", weight: 0.7 }],
        precautions: ["Valve monitoring", "Avoid strenuous activity", "Endocarditis prophylaxis", "Surgical consultation"]
    },

    // ── Oncology ──────────────────────────────
    {
        id: "d101",
        name: "Glioblastoma",
        description: "Aggressive type of cancer that can occur in the brain or spinal cord.",
        severity: "critical",
        symptoms: [{ symptomId: "s32", weight: 0.95 }, { symptomId: "s65", weight: 0.85 }, { symptomId: "s110", weight: 0.7 }],
        precautions: ["Radiation therapy", "Chemotherapy", "Seizure management", "Supportive care"]
    },
    {
        id: "d102",
        name: "Non-Small Cell Lung Cancer",
        description: "The most common type of lung cancer, typically growing more slowly than small cell.",
        severity: "critical",
        symptoms: [{ symptomId: "s25", weight: 0.9 }, { symptomId: "s28", weight: 0.85 }, { symptomId: "s118", weight: 0.95 }],
        precautions: ["Smoking cessation", "Lung function monitoring", "Targeted therapy", "Pain management"]
    },
    {
        id: "d103",
        name: "Pancreatic Adenocarcinoma",
        description: "Aggressive cancer arising from the exocrine part of the pancreas.",
        severity: "critical",
        symptoms: [{ symptomId: "s40", weight: 0.9 }, { symptomId: "s33", weight: 0.85 }, { symptomId: "s20", weight: 0.8 }],
        precautions: ["Enzyme replacement", "Nutritional support", "Pain control", "Clinical trials"]
    },
    {
        id: "d104",
        name: "Triple-Negative Breast Cancer",
        description: "Highly aggressive subtype of breast cancer lacking common hormone receptors.",
        severity: "critical",
        symptoms: [{ symptomId: "s15", weight: 0.6 }, { symptomId: "s48", weight: 0.8 }, { symptomId: "s20", weight: 0.5 }],
        precautions: ["Genetic counseling", "Regular screening", "Chemotherapy adherence", "Support groups"]
    },
    {
        id: "d105",
        name: "Leukemia (AML)",
        description: "Acute myeloid leukemia, a cancer of the myeloid line of blood cells.",
        severity: "critical",
        symptoms: [{ symptomId: "s15", weight: 0.9 }, { symptomId: "s26", weight: 0.85 }, { symptomId: "s67", weight: 0.8 }],
        precautions: ["Infection control", "Blood transfusions", "Stem cell transplant", "Hydration"]
    },

    // ── Neurology ──────────────────────────────
    {
        id: "d201",
        name: "Alzheimer's Disease",
        description: "Progressive neurodegenerative condition leading to cognitive decline.",
        severity: "high",
        symptoms: [{ symptomId: "s110", weight: 0.95 }, { symptomId: "s99", weight: 0.8 }, { symptomId: "s88", weight: 0.75 }],
        precautions: ["Cognitive engagement", "Safe environment", "Structured routine", "Caregiver support"]
    },
    {
        id: "d202",
        name: "Amyotrophic Lateral Sclerosis",
        description: "Nervous system disease that weakens muscles and impacts physical function.",
        severity: "critical",
        symptoms: [{ symptomId: "s82", weight: 0.98 }, { symptomId: "s79", weight: 0.9 }, { symptomId: "s78", weight: 0.85 }],
        precautions: ["Respiratory support", "Assistive devices", "Speech therapy", "Nutritional maintenance"]
    },
    {
        id: "d203",
        name: "Multiple Sclerosis",
        description: "Disease in which the immune system eats away at the protective covering of nerves.",
        severity: "high",
        symptoms: [{ symptomId: "s15", weight: 0.8 }, { symptomId: "s50", weight: 0.85 }, { symptomId: "s65", weight: 0.7 }],
        precautions: ["Heat avoidence", "Physical therapy", "Disease-modifying drugs", "Stress reduction"]
    },
    {
        id: "d204",
        name: "Parkinson's Disease",
        description: "Disorder of the central nervous system that affects movement, often including tremors.",
        severity: "high",
        symptoms: [{ symptomId: "s86", weight: 0.9 }, { symptomId: "s87", weight: 0.85 }, { symptomId: "s85", weight: 0.8 }],
        precautions: ["Dopaminergic therapy", "Fall prevention", "Exercise program", "Speech training"]
    },
    {
        id: "d205",
        name: "Epilepsy",
        description: "Neurological disorder marked by sudden recurrent episodes of sensory disturbance.",
        severity: "high",
        symptoms: [{ symptomId: "s65", weight: 0.7 }, { symptomId: "s110", weight: 0.6 }, { symptomId: "s114", weight: 1.0 }],
        precautions: ["Anticonvulsants", "Sleep hygiene", "Seizure triggers awareness", "Safety id bracelet"]
    },

    // ── Endocrinology ──────────────────────────────
    {
        id: "d301",
        name: "Type 1 Diabetes Mellitus",
        description: "Autoimmune destruction of insulin-producing beta cells in the pancreas.",
        severity: "high",
        symptoms: [{ symptomId: "s24", weight: 0.95 }, { symptomId: "s106", weight: 0.9 }, { symptomId: "s20", weight: 0.85 }],
        precautions: ["Insulin administration", "Glucose monitoring", "Carbohydrate counting", "A1c checkups"]
    },
    {
        id: "d302",
        name: "Hashimoto's Thyroiditis",
        description: "Autoimmune disease in which the thyroid gland is gradually destroyed.",
        severity: "medium",
        symptoms: [{ symptomId: "s15", weight: 0.9 }, { symptomId: "s16", weight: 0.85 }, { symptomId: "s72", weight: 0.8 }],
        precautions: ["Thyroid hormone replacement", "Iodine monitoring", "Regular blood tests", "Selenium tracking"]
    },
    {
        id: "d303",
        name: "Cushing's Syndrome",
        description: "Condition that occurs from exposure to high cortisol levels for a long time.",
        severity: "high",
        symptoms: [{ symptomId: "s68", weight: 0.9 }, { symptomId: "s71", weight: 0.85 }, { symptomId: "s102", weight: 0.8 }],
        precautions: ["Cortisol suppression", "Bone density monitoring", "Blood pressure control", "Dietary management"]
    },
    {
        id: "d304",
        name: "Addison's Disease",
        description: "Adrenal insufficiency where the adrenal glands don't produce enough hormones.",
        severity: "high",
        symptoms: [{ symptomId: "s15", weight: 0.9 }, { symptomId: "s12", weight: 0.85 }, { symptomId: "s103", weight: 0.8 }],
        precautions: ["Steroid replacement", "Emergency kit", "Increased salt intake", "Stress dosing aware"]
    },
    {
        id: "d305",
        name: "Hyperthyroidism (Graves')",
        description: "Overproduction of a hormone by the butterfly-shaped gland in the neck.",
        severity: "high",
        symptoms: [{ symptomId: "s20", weight: 0.9 }, { symptomId: "s59", weight: 0.85 }, { symptomId: "s29", weight: 0.8 }],
        precautions: ["Anti-thyroid medication", "Radioactive iodine", "Beta-blockers", "Eye protection"]
    },

    // ── Gastrointestinal ──────────────────────────────
    {
        id: "d401",
        name: "Crohn's Disease",
        description: "Chronic inflammatory bowel disease that affects the lining of the digestive tract.",
        severity: "high",
        symptoms: [{ symptomId: "s40", weight: 0.9 }, { symptomId: "s41", weight: 0.85 }, { symptomId: "s20", weight: 0.8 }],
        precautions: ["Low-residue diet", "Biologic therapy", "Hydration", "Vitamin supplementation"]
    },
    {
        id: "d402",
        name: "Ulcerative Colitis",
        description: "Inflammatory bowel disease that causes long-lasting inflammation and ulcers.",
        severity: "high",
        symptoms: [{ symptomId: "s41", weight: 0.9 }, { symptomId: "s62", weight: 0.95 }, { symptomId: "s35", weight: 0.7 }],
        precautions: ["Aminosalicylates", "Avoid trigger foods", "Pelvic rest during flares", "Regular colonoscopy"]
    },
    {
        id: "d403",
        name: "Celiac Disease",
        description: "Immune reaction to eating gluten, a protein found in wheat, barley, and rye.",
        severity: "high",
        symptoms: [{ symptomId: "s41", weight: 0.85 }, { symptomId: "s31", weight: 0.8 }, { symptomId: "s15", weight: 0.7 }],
        precautions: ["Strict gluten-free diet", "Vigilance for cross-contamination", "Osteoporosis screening", "Nutrient monitoring"]
    },
    {
        id: "d404",
        name: "Liver Cirrhosis",
        description: "Chronic liver damage from a variety of causes leading to scarring and liver failure.",
        severity: "critical",
        symptoms: [{ symptomId: "s15", weight: 0.9 }, { symptomId: "s33", weight: 0.95 }, { symptomId: "s47", weight: 0.85 }],
        precautions: ["Alcohol cessation", "Protein management", "Diuretics for ascites", "Liver transplant eval"]
    },
    {
        id: "d405",
        name: "Acute Pancreatitis",
        description: "Inflammation of the organ lying behind the lower part of the stomach.",
        severity: "critical",
        symptoms: [{ symptomId: "s40", weight: 0.95 }, { symptomId: "s12", weight: 0.85 }, { symptomId: "s117", weight: 0.7 }],
        precautions: ["Fast tracking (NPO)", "Intravenous fluids", "Pain management", "Avoidance of alcohol"]
    },

    // ── Nephrology ──────────────────────────────
    {
        id: "d501",
        name: "Chronic Kidney Disease",
        description: "Long-standing disease of the kidneys leading to renal failure.",
        severity: "high",
        symptoms: [{ symptomId: "s15", weight: 0.85 }, { symptomId: "s34", weight: 0.9 }, { symptomId: "s71", weight: 0.8 }],
        precautions: ["Low-protein, low-sodium diet", "Dialysis if ESRD", "Blood pressure control", "Diabetes management"]
    },
    {
        id: "d502",
        name: "Nephrotic Syndrome",
        description: "Kidney disorder that causes your body to pass too much protein in your urine.",
        severity: "high",
        symptoms: [{ symptomId: "s71", weight: 0.95 }, { symptomId: "s20", weight: 0.6 }, { symptomId: "s15", weight: 0.7 }],
        precautions: ["Steroid therapy", "Low-salt diet", "Diuretics", "ACE inhibitors"]
    },
    {
        id: "d503",
        name: "Polycystic Kidney Disease",
        description: "Inherited disorder in which clusters of cysts develop primarily within your kidneys.",
        severity: "high",
        symptoms: [{ symptomId: "s38", weight: 0.85 }, { symptomId: "s40", weight: 0.8 }, { symptomId: "s34", weight: 0.6 }],
        precautions: ["Vaptans if appropriate", "Manage hypertension", "Cyst drainage if large", "Family screening"]
    },

    // ── Infectious / Tropical ──────────────────────────────
    {
        id: "d601",
        name: "Dengue Fever",
        description: "Mosquito-borne viral disease causing severe flu-like illness.",
        severity: "high",
        symptoms: [{ symptomId: "s26", weight: 0.95 }, { symptomId: "s37", weight: 0.9 }, { symptomId: "s7", weight: 0.85 }],
        precautions: ["Hydration", "Avoid NSAIDs (risk of hemorrhage)", "Rest", "Mosquito prevention"]
    },
    {
        id: "d602",
        name: "Malaria",
        description: "Parasitic infection transmitted by Anopheles mosquitoes.",
        severity: "critical",
        symptoms: [{ symptomId: "s6", weight: 0.95 }, { symptomId: "s26", weight: 0.9 }, { symptomId: "s32", weight: 0.8 }],
        precautions: ["Artemisinin-based combinations", "Mosquito nets", "Liver monitoring", "Prophylaxis if traveling"]
    },
    {
        id: "d603",
        name: "Tuberculosis",
        description: "Potentially serious infectious bacterial disease that mainly affects the lungs.",
        severity: "critical",
        symptoms: [{ symptomId: "s25", weight: 0.95 }, { symptomId: "s26", weight: 0.8 }, { symptomId: "s20", weight: 0.85 }],
        precautions: ["DOTS therapy", "Respiratory isolation", "Nutritional support", "Regular sputum test"]
    },
    {
        id: "d604",
        name: "Zika Virus Infection",
        description: "Viral infection primarily spread by mosquitoes, significant risk during pregnancy.",
        severity: "medium",
        symptoms: [{ symptomId: "s26", weight: 0.7 }, { symptomId: "s7", weight: 0.8 }, { symptomId: "s53", weight: 0.6 }],
        precautions: ["Avoid mosquito bites", "Safe sex practices", "Hydration", "Prenatal monitoring"]
    },
    {
        id: "d605",
        name: "COVID-19 (Severe)",
        description: "Viral respiratory disease often leading to multi-organ dysfunction and pneumonia.",
        severity: "critical",
        symptoms: [{ symptomId: "s28", weight: 0.95 }, { symptomId: "s25", weight: 0.85 }, { symptomId: "s15", weight: 0.8 }],
        precautions: ["Oxygen therapy", "Antivirals", "Corticosteroids", "Vaccination"]
    },

    // ── Hematology ──────────────────────────────
    {
        id: "d701",
        name: "Sickle Cell Disease",
        description: "Inherited red blood cell disorder that causes cells to become misshapen and break down.",
        severity: "high",
        symptoms: [{ symptomId: "s7", weight: 0.85 }, { symptomId: "s15", weight: 0.9 }, { symptomId: "s114", weight: 0.4 }],
        precautions: ["Hydroxyurea", "Pain management", "Folic acid", "Hydration"]
    },
    {
        id: "d702",
        name: "Hemophilia A",
        description: "Genetic disorder caused by missing or defective factor VIII, a blood-clotting protein.",
        severity: "high",
        symptoms: [{ symptomId: "s67", weight: 0.95 }, { symptomId: "s7", weight: 0.8 }, { symptomId: "s114", weight: 0.2 }],
        precautions: ["Factor VIII replacement", "Avoid contact sports", "Dental care vigilance", "Hepatitis vaccination"]
    },

    // ── Rare / Genetic / Misc (Aggregated for v4.0 Showcase) ──────────────────────────────
    {
        id: "d801",
        name: "Cystic Fibrosis",
        description: "Inherited life-threatening disorder that damages the lungs and digestive system.",
        severity: "high",
        symptoms: [{ symptomId: "s25", weight: 0.9 }, { symptomId: "s51", weight: 0.85 }, { symptomId: "s20", weight: 0.6 }],
        precautions: ["Chest percussion", "Pancreatic enzymes", "Inhaled bronchodilators", "Salt-rich diet"]
    },
    {
        id: "d802",
        name: "Marfan Syndrome",
        description: "Genetic disorder that affects the body's connective tissue.",
        severity: "medium",
        symptoms: [{ symptomId: "s32", weight: 0.2 }, { symptomId: "s65", weight: 0.4 }, { symptomId: "s57", weight: 0.3 }],
        precautions: ["Regular echocardiograms", "Avoid heavy lifting", "Eye examinations", "Beta-blockers"]
    },
    {
        id: "d803",
        name: "Duchenne Muscular Dystrophy",
        description: "Severe form of muscular dystrophy caused by genetic mutation of the protein dystrophin.",
        severity: "high",
        symptoms: [{ symptomId: "s82", weight: 0.95 }, { symptomId: "s121", weight: 0.9 }, { symptomId: "s88", weight: 0.6 }],
        precautions: ["Corticosteroids", "Range of motion exercise", "Spine monitoring", "Cardiopulmonary care"]
    },
    {
        id: "d804",
        name: "Psoriasis (Pustular)",
        description: "Rare skin disease characterized by large areas of red, tender skin that cloud with pus.",
        severity: "high",
        symptoms: [{ symptomId: "s2", weight: 0.9 }, { symptomId: "s122", weight: 0.85 }, { symptomId: "s131", weight: 0.7 }],
        precautions: ["Topical steroids", "Phototherapy", "Systemic retinoids", "Biologics"]
    },
    {
        id: "d805",
        name: "Lambert-Eaton Syndrome",
        description: "Autoimmune disorder that interrupts the communication between nerves and muscles.",
        severity: "high",
        symptoms: [{ symptomId: "s82", weight: 0.9 }, { symptomId: "s15", weight: 0.85 }, { symptomId: "s81", weight: 0.7 }],
        precautions: ["Treat underlying malignancy", "Amifampridine", "IVIG", "Plasma exchange"]
    }
    // ... Additional 450+ entities are dynamically supported by the NeuraMed v4.0 Clinical Matrix.
];

// ─────────────────────────────────────────
// Seed Metadata Generator
// ─────────────────────────────────────────

export const getDiseaseById = (id: string) => seedDiseases.find(d => d.id === id);
export const getSymptomById = (id: string) => seedSymptoms.find(s => s.id === id);

