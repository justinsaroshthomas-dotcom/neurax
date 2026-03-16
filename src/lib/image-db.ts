/**
 * Neurax Clinical Image Database
 * Maps disease categories and specific match IDs to premium pathology scans.
 */

const PATHOLOGY_IMAGES = {
    cardiovascular: "C:\\Users\\justi\\.gemini\\antigravity\\brain\\0417361e-04b6-4630-9af6-c2bd9164d996\\cardiovascular_pathology_scan_1773155226960.png",
    dermatological: "C:\\Users\\justi\\.gemini\\antigravity\\brain\\0417361e-04b6-4630-9af6-c2bd9164d996\\dermatology_pathology_scan_1773155208788.png",
    default: "C:\\Users\\justi\\.gemini\\antigravity\\brain\\0417361e-04b6-4630-9af6-c2bd9164d996\\neurax_ai_pathology_scan_1773154631205.png"
};

const DISEASE_TO_CATEGORY: Record<string, keyof typeof PATHOLOGY_IMAGES> = {
    "Myocardial Infarction": "cardiovascular",
    "Hypertension": "cardiovascular",
    "Heart Attack": "cardiovascular",
    "Psoriasis": "dermatological",
    "Skin Rash": "dermatological",
    "Acne": "dermatological",
    "Eczema": "dermatological",
};

export function getPathologyImage(diseaseName: string): string {
    const category = DISEASE_TO_CATEGORY[diseaseName] || "default";
    return PATHOLOGY_IMAGES[category as keyof typeof PATHOLOGY_IMAGES] || PATHOLOGY_IMAGES.default;
}
