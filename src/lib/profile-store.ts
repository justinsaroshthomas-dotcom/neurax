"use client";

import { useEffect, useState } from "react";

/**
 * Neurax Profile Store
 * Manages local user clinical metadata.
 */

export interface UserProfile {
    clinicalLevel: string;
    department: string;
    profileImage: string; // Base64 or URL
}

const STORAGE_KEY = "neurax_user_profile";

export function getUserProfile(): UserProfile {
    const defaultProfile = { 
        clinicalLevel: "Senior Physician", 
        department: "Neurology",
        profileImage: "" 
    };

    if (typeof window === "undefined") return defaultProfile;
    
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaultProfile, ...parsed };
        }
    } catch (e) {
        console.error("Failed to parse user profile", e);
    }
    
    return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
