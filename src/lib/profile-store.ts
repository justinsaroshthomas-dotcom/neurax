"use client";

import { useEffect, useState } from "react";

/**
 * Neurax Profile Store
 * Manages local user clinical metadata.
 */

export interface UserProfile {
    clinicalLevel: string;
    department: string;
}

const STORAGE_KEY = "neurax_user_profile";

export function getUserProfile(): UserProfile {
    if (typeof window === "undefined") return { clinicalLevel: "Senior Physician", department: "Neurology" };
    
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse user profile", e);
    }
    
    return { clinicalLevel: "Senior Physician", department: "Neurology" };
}

export function saveUserProfile(profile: UserProfile): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
