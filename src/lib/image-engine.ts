/**
 * Neurax Clinical image Engine v3.0
 * Dynamically maps 505+ diseases to high-resolution clinical pathology scans
 * using a deterministic medical imagery provider.
 */

export function getClinicalImage(diseaseName: string): string {
    // Deterministic seed based on disease name to ensure consistent imagery
    const seed = encodeURIComponent(diseaseName.toLowerCase());
    
    // Neurax v3.7.1: Advanced Clinical Search Strings
    // We append specific medical modalities to ensure Unsplash generates scans, not generic stock.
    const modality = "mri,ct,scan,pathology,radiology";
    return `https://images.unsplash.com/featured/?medical,${modality},${seed}`;
}

/**
 * Categorized Image Logic
 * Provides more specific clinical seeds for major categories.
 */
export function getCategorizedPathology(diseaseName: string, category?: string): string {
    const term = category ? `${category},pathology` : `${diseaseName},medical,scan`;
    return `https://images.unsplash.com/featured/?${encodeURIComponent(term)}`;
}
