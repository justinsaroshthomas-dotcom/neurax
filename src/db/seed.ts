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

// ── Symptoms ──────────────────────────────

export const seedSymptoms: SeedSymptom[] = [
    // General
    { id: "s1", name: "Fever", category: "General" },
    { id: "s2", name: "Fatigue", category: "General" },
    { id: "s3", name: "Chills", category: "General" },
    { id: "s4", name: "Weight Loss", category: "General" },
    { id: "s5", name: "Sweating", category: "General" },
    { id: "s6", name: "Malaise", category: "General" },

    // Respiratory
    { id: "s7", name: "Cough", category: "Respiratory" },
    { id: "s8", name: "Shortness of Breath", category: "Respiratory" },
    { id: "s9", name: "Chest Pain", category: "Respiratory" },
    { id: "s10", name: "Sore Throat", category: "Respiratory" },
    { id: "s11", name: "Runny Nose", category: "Respiratory" },
    { id: "s12", name: "Wheezing", category: "Respiratory" },

    // Gastrointestinal
    { id: "s13", name: "Nausea", category: "Gastrointestinal" },
    { id: "s14", name: "Vomiting", category: "Gastrointestinal" },
    { id: "s15", name: "Diarrhea", category: "Gastrointestinal" },
    { id: "s16", name: "Abdominal Pain", category: "Gastrointestinal" },
    { id: "s17", name: "Loss of Appetite", category: "Gastrointestinal" },
    { id: "s18", name: "Bloating", category: "Gastrointestinal" },

    // Neurological
    { id: "s19", name: "Headache", category: "Neurological" },
    { id: "s20", name: "Dizziness", category: "Neurological" },
    { id: "s21", name: "Confusion", category: "Neurological" },
    { id: "s22", name: "Blurred Vision", category: "Neurological" },
    { id: "s23", name: "Seizures", category: "Neurological" },
    { id: "s24", name: "Numbness", category: "Neurological" },

    // Musculoskeletal
    { id: "s25", name: "Joint Pain", category: "Musculoskeletal" },
    { id: "s26", name: "Muscle Pain", category: "Musculoskeletal" },
    { id: "s27", name: "Stiffness", category: "Musculoskeletal" },
    { id: "s28", name: "Swelling", category: "Musculoskeletal" },
    { id: "s29", name: "Back Pain", category: "Musculoskeletal" },

    // Dermatological
    { id: "s30", name: "Rash", category: "Dermatological" },
    { id: "s31", name: "Itching", category: "Dermatological" },
    { id: "s32", name: "Skin Discoloration", category: "Dermatological" },
    { id: "s33", name: "Dry Skin", category: "Dermatological" },
    { id: "s34", name: "Hair Loss", category: "Dermatological" },

    // Cardiovascular
    { id: "s35", name: "Palpitations", category: "Cardiovascular" },
    { id: "s36", name: "High Blood Pressure", category: "Cardiovascular" },
    { id: "s37", name: "Swollen Legs", category: "Cardiovascular" },
    { id: "s38", name: "Rapid Heartbeat", category: "Cardiovascular" },

    // Urological
    { id: "s39", name: "Frequent Urination", category: "Urological" },
    { id: "s40", name: "Painful Urination", category: "Urological" },
    { id: "s41", name: "Blood in Urine", category: "Urological" },

    // ENT
    { id: "s42", name: "Ear Pain", category: "ENT" },
    { id: "s43", name: "Hearing Loss", category: "ENT" },
    { id: "s44", name: "Nasal Congestion", category: "ENT" },

    // Psychological
    { id: "s45", name: "Anxiety", category: "Psychological" },
    { id: "s46", name: "Insomnia", category: "Psychological" },
    { id: "s47", name: "Depression", category: "Psychological" },

    // Other
    { id: "s48", name: "Yellowing of Skin", category: "Other" },
    { id: "s49", name: "Dark Urine", category: "Other" },
    { id: "s50", name: "Excessive Thirst", category: "Other" },
];

// ── Diseases ──────────────────────────────

export const seedDiseases: SeedDisease[] = [
    {
        id: "d1",
        name: "Common Cold",
        description:
            "A viral infection of the upper respiratory tract affecting the nose and throat.",
        severity: "low",
        symptoms: [
            { symptomId: "s7", weight: 0.9 },
            { symptomId: "s10", weight: 0.85 },
            { symptomId: "s11", weight: 0.9 },
            { symptomId: "s44", weight: 0.8 },
            { symptomId: "s19", weight: 0.5 },
            { symptomId: "s2", weight: 0.4 },
        ],
        precautions: [
            "Rest and stay hydrated",
            "Take over-the-counter medication for symptoms",
            "Wash hands frequently",
            "Avoid close contact with others",
        ],
    },
    {
        id: "d2",
        name: "Influenza",
        description:
            "A contagious respiratory illness caused by influenza viruses with sudden onset.",
        severity: "medium",
        symptoms: [
            { symptomId: "s1", weight: 0.95 },
            { symptomId: "s7", weight: 0.8 },
            { symptomId: "s26", weight: 0.85 },
            { symptomId: "s2", weight: 0.9 },
            { symptomId: "s3", weight: 0.8 },
            { symptomId: "s19", weight: 0.7 },
            { symptomId: "s10", weight: 0.5 },
        ],
        precautions: [
            "Get annual flu vaccination",
            "Rest and drink plenty of fluids",
            "Take antiviral medications within 48 hours",
            "Stay home to prevent spreading",
        ],
    },
    {
        id: "d3",
        name: "COVID-19",
        description:
            "An infectious disease caused by the SARS-CoV-2 virus affecting respiratory and other systems.",
        severity: "high",
        symptoms: [
            { symptomId: "s1", weight: 0.8 },
            { symptomId: "s7", weight: 0.85 },
            { symptomId: "s8", weight: 0.9 },
            { symptomId: "s2", weight: 0.85 },
            { symptomId: "s26", weight: 0.6 },
            { symptomId: "s19", weight: 0.6 },
            { symptomId: "s17", weight: 0.5 },
        ],
        precautions: [
            "Isolate for recommended period",
            "Monitor oxygen levels",
            "Seek emergency care if breathing difficulty worsens",
            "Stay up to date with vaccinations",
        ],
    },
    {
        id: "d4",
        name: "Pneumonia",
        description:
            "An infection that inflames the air sacs in one or both lungs, which may fill with fluid.",
        severity: "high",
        symptoms: [
            { symptomId: "s7", weight: 0.9 },
            { symptomId: "s1", weight: 0.85 },
            { symptomId: "s8", weight: 0.9 },
            { symptomId: "s9", weight: 0.8 },
            { symptomId: "s3", weight: 0.7 },
            { symptomId: "s2", weight: 0.75 },
            { symptomId: "s5", weight: 0.6 },
        ],
        precautions: [
            "Complete full course of prescribed antibiotics",
            "Rest and increase fluid intake",
            "Get pneumococcal vaccine",
            "Seek immediate care for worsening symptoms",
        ],
    },
    {
        id: "d5",
        name: "Gastroenteritis",
        description:
            "Inflammation of the stomach and intestines, typically caused by viral or bacterial infection.",
        severity: "medium",
        symptoms: [
            { symptomId: "s15", weight: 0.9 },
            { symptomId: "s14", weight: 0.85 },
            { symptomId: "s13", weight: 0.8 },
            { symptomId: "s16", weight: 0.85 },
            { symptomId: "s1", weight: 0.6 },
            { symptomId: "s2", weight: 0.5 },
        ],
        precautions: [
            "Stay hydrated with electrolyte solutions",
            "Follow BRAT diet (bananas, rice, applesauce, toast)",
            "Practice good hand hygiene",
            "Avoid dairy and fatty foods during recovery",
        ],
    },
    {
        id: "d6",
        name: "Migraine",
        description:
            "A neurological disease causing recurring moderate-to-severe headaches, often with sensory disturbances.",
        severity: "medium",
        symptoms: [
            { symptomId: "s19", weight: 0.95 },
            { symptomId: "s13", weight: 0.7 },
            { symptomId: "s22", weight: 0.65 },
            { symptomId: "s20", weight: 0.6 },
            { symptomId: "s46", weight: 0.4 },
            { symptomId: "s2", weight: 0.5 },
        ],
        precautions: [
            "Identify and avoid personal triggers",
            "Maintain regular sleep schedule",
            "Take prescribed preventive medications",
            "Rest in a dark, quiet room during attacks",
        ],
    },
    {
        id: "d7",
        name: "Type 2 Diabetes",
        description:
            "A chronic metabolic disorder characterized by high blood sugar due to insulin resistance.",
        severity: "high",
        symptoms: [
            { symptomId: "s50", weight: 0.9 },
            { symptomId: "s39", weight: 0.85 },
            { symptomId: "s2", weight: 0.7 },
            { symptomId: "s22", weight: 0.6 },
            { symptomId: "s4", weight: 0.5 },
            { symptomId: "s24", weight: 0.6 },
        ],
        precautions: [
            "Monitor blood sugar regularly",
            "Follow a balanced, low-glycemic diet",
            "Exercise at least 150 minutes per week",
            "Take medications as prescribed",
        ],
    },
    {
        id: "d8",
        name: "Hypertension",
        description:
            "Persistently elevated blood pressure in the arteries, a major risk factor for heart disease.",
        severity: "high",
        symptoms: [
            { symptomId: "s36", weight: 0.95 },
            { symptomId: "s19", weight: 0.6 },
            { symptomId: "s22", weight: 0.5 },
            { symptomId: "s8", weight: 0.5 },
            { symptomId: "s35", weight: 0.55 },
            { symptomId: "s20", weight: 0.4 },
        ],
        precautions: [
            "Reduce sodium intake to less than 2300mg/day",
            "Exercise regularly",
            "Monitor blood pressure at home",
            "Take prescribed antihypertensive medications consistently",
        ],
    },
    {
        id: "d9",
        name: "Rheumatoid Arthritis",
        description:
            "An autoimmune disorder causing chronic joint inflammation, pain, and eventual joint damage.",
        severity: "medium",
        symptoms: [
            { symptomId: "s25", weight: 0.95 },
            { symptomId: "s27", weight: 0.9 },
            { symptomId: "s28", weight: 0.85 },
            { symptomId: "s2", weight: 0.6 },
            { symptomId: "s1", weight: 0.3 },
            { symptomId: "s26", weight: 0.5 },
        ],
        precautions: [
            "Follow prescribed DMARD treatment",
            "Apply hot/cold therapy to affected joints",
            "Maintain gentle exercise routine",
            "Get adequate rest during flare-ups",
        ],
    },
    {
        id: "d10",
        name: "Hepatitis B",
        description:
            "A liver infection caused by the hepatitis B virus that can become chronic.",
        severity: "high",
        symptoms: [
            { symptomId: "s48", weight: 0.9 },
            { symptomId: "s49", weight: 0.85 },
            { symptomId: "s2", weight: 0.7 },
            { symptomId: "s16", weight: 0.65 },
            { symptomId: "s13", weight: 0.6 },
            { symptomId: "s25", weight: 0.4 },
            { symptomId: "s1", weight: 0.5 },
        ],
        precautions: [
            "Get vaccinated if not already immune",
            "Avoid alcohol consumption",
            "Regular liver function monitoring",
            "Avoid sharing personal items that may have blood contact",
        ],
    },
    {
        id: "d11",
        name: "Asthma",
        description:
            "A chronic respiratory condition in which airways narrow and swell, producing extra mucus.",
        severity: "medium",
        symptoms: [
            { symptomId: "s12", weight: 0.95 },
            { symptomId: "s8", weight: 0.9 },
            { symptomId: "s7", weight: 0.7 },
            { symptomId: "s9", weight: 0.5 },
        ],
        precautions: [
            "Always carry rescue inhaler",
            "Identify and avoid triggers",
            "Follow asthma action plan",
            "Use controller medications as prescribed",
        ],
    },
    {
        id: "d12",
        name: "Urinary Tract Infection",
        description:
            "An infection in any part of the urinary system, most commonly the bladder and urethra.",
        severity: "low",
        symptoms: [
            { symptomId: "s40", weight: 0.95 },
            { symptomId: "s39", weight: 0.9 },
            { symptomId: "s41", weight: 0.7 },
            { symptomId: "s16", weight: 0.5 },
            { symptomId: "s1", weight: 0.4 },
        ],
        precautions: [
            "Drink plenty of water",
            "Complete full antibiotic course",
            "Practice proper hygiene",
            "Urinate soon after intercourse",
        ],
    },
    {
        id: "d13",
        name: "Malaria",
        description:
            "A life-threatening disease caused by Plasmodium parasites transmitted through infected mosquitoes.",
        severity: "critical",
        symptoms: [
            { symptomId: "s1", weight: 0.95 },
            { symptomId: "s3", weight: 0.9 },
            { symptomId: "s5", weight: 0.85 },
            { symptomId: "s19", weight: 0.7 },
            { symptomId: "s26", weight: 0.65 },
            { symptomId: "s14", weight: 0.5 },
            { symptomId: "s2", weight: 0.7 },
        ],
        precautions: [
            "Take antimalarial prophylaxis when traveling",
            "Use insect repellent and bed nets",
            "Seek immediate treatment if diagnosed",
            "Eliminate standing water near living areas",
        ],
    },
    {
        id: "d14",
        name: "Dengue Fever",
        description:
            "A mosquito-borne viral infection causing flu-like illness with potential for complications.",
        severity: "high",
        symptoms: [
            { symptomId: "s1", weight: 0.95 },
            { symptomId: "s19", weight: 0.8 },
            { symptomId: "s26", weight: 0.85 },
            { symptomId: "s25", weight: 0.7 },
            { symptomId: "s30", weight: 0.6 },
            { symptomId: "s13", weight: 0.5 },
            { symptomId: "s2", weight: 0.75 },
        ],
        precautions: [
            "Stay hydrated with oral rehydration salts",
            "Avoid aspirin and NSAIDs",
            "Use mosquito control measures",
            "Monitor platelet count closely",
        ],
    },
    {
        id: "d15",
        name: "Anxiety Disorder",
        description:
            "A mental health condition characterized by persistent excessive worry and physical symptoms.",
        severity: "medium",
        symptoms: [
            { symptomId: "s45", weight: 0.95 },
            { symptomId: "s46", weight: 0.8 },
            { symptomId: "s35", weight: 0.7 },
            { symptomId: "s38", weight: 0.65 },
            { symptomId: "s20", weight: 0.5 },
            { symptomId: "s8", weight: 0.4 },
            { symptomId: "s6", weight: 0.5 },
        ],
        precautions: [
            "Practice relaxation techniques and mindfulness",
            "Engage in regular physical exercise",
            "Limit caffeine and alcohol intake",
            "Consider cognitive behavioral therapy (CBT)",
        ],
    },
    {
        id: "d16",
        name: "Eczema",
        description:
            "A chronic skin condition causing inflamed, itchy, cracked, and rough skin patches.",
        severity: "low",
        symptoms: [
            { symptomId: "s31", weight: 0.95 },
            { symptomId: "s30", weight: 0.9 },
            { symptomId: "s33", weight: 0.8 },
            { symptomId: "s32", weight: 0.6 },
        ],
        precautions: [
            "Moisturize skin regularly",
            "Use mild soaps and detergents",
            "Avoid known irritants and allergens",
            "Apply topical corticosteroids as prescribed",
        ],
    },
    {
        id: "d17",
        name: "Meningitis",
        description:
            "A serious infection causing inflammation of the membranes surrounding the brain and spinal cord.",
        severity: "critical",
        symptoms: [
            { symptomId: "s1", weight: 0.9 },
            { symptomId: "s19", weight: 0.9 },
            { symptomId: "s27", weight: 0.85 },
            { symptomId: "s21", weight: 0.8 },
            { symptomId: "s13", weight: 0.6 },
            { symptomId: "s23", weight: 0.7 },
            { symptomId: "s30", weight: 0.5 },
        ],
        precautions: [
            "Seek emergency medical care immediately",
            "Get vaccinated (meningococcal vaccine)",
            "Avoid close contact with infected persons",
            "Complete the full course of antibiotics",
        ],
    },
    {
        id: "d18",
        name: "Chronic Kidney Disease",
        description:
            "A gradual loss of kidney function over time, affecting waste filtration from blood.",
        severity: "high",
        symptoms: [
            { symptomId: "s2", weight: 0.7 },
            { symptomId: "s37", weight: 0.8 },
            { symptomId: "s13", weight: 0.6 },
            { symptomId: "s39", weight: 0.65 },
            { symptomId: "s36", weight: 0.6 },
            { symptomId: "s17", weight: 0.55 },
            { symptomId: "s24", weight: 0.5 },
        ],
        precautions: [
            "Control blood pressure and blood sugar",
            "Limit protein and sodium in diet",
            "Avoid nephrotoxic drugs (NSAIDs)",
            "Regular renal function monitoring",
        ],
    },
];
