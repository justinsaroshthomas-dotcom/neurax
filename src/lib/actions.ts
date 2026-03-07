"use server";

import { createServerSupabaseClient } from "./supabase";
import db from "./db";
import { currentUser } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";

export interface Testimonial {
  id: string;
  user_name: string;
  content: string;
  rating: number;
  created_at: string;
}

export async function submitTestimonial(content: string, rating: number) {
  const user = await currentUser();
  
  if (!user) {
    return { success: false, error: "You must be logged in to submit a review." };
  }

  if (!content || content.trim().length < 10) {
    return { success: false, error: "Testimonial must be at least 10 characters long." };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5." };
  }

  const supabase = createServerSupabaseClient();
  const userName = user.fullName || user.username || "User";

  try {
    if (supabase) {
      const { error } = await supabase
        .from("testimonials")
        .insert([{
          user_id: user.id,
          user_name: userName,
          content: content.trim(),
          rating,
          is_approved: true
        }]);
      
      if (error) throw error;
      return { success: true };
    }

    // Fallback to SQLite
    if (!db) {
       console.warn("[NeuraMed] Cloud database failed and no local fallback available.");
       return { success: false, error: "Cloud database is currently unavailable." };
    }

    const id = randomBytes(16).toString("hex");
    const createdAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO testimonials (id, user_id, user_name, content, rating, is_approved, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(id, user.id, userName, content.trim(), rating, createdAt);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit testimonial:", error);
    return { success: false, error: "Failed to submit testimonial. Please try again." };
  }
}

export async function getRecentTestimonials(limit: number = 6): Promise<Testimonial[]> {
  const supabase = createServerSupabaseClient();

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, user_name, content, rating, created_at")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    }

    // Fallback to SQLite
    if (!db) return [];

    const rows = db.prepare(`
        SELECT id, user_name, content, rating, created_at 
        FROM testimonials 
        WHERE is_approved = 1 
        ORDER BY created_at DESC 
        LIMIT ?
    `).all(limit) as Testimonial[];

    return rows || [];
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return [];
  }
}

export async function saveHistoryToCloud(entry: any) {
  const user = await currentUser();
  const supabase = createServerSupabaseClient();

  if (!user || !supabase) return { success: false };

  try {
    const { error } = await supabase
      .from("history")
      .insert([{
        user_id: user.id,
        disease_name: entry.topDisease,
        confidence: entry.topConfidence,
        symptoms: entry.symptoms,
        risk_level: entry.topSeverity,
        ai_summary: entry.aiSummary,
        full_data: entry.predictions // Store the multi-prediction data in a JSONB column
      }]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Failed to save history to cloud:", error);
    return { success: false };
  }
}

export async function getCloudHistory() {
  const user = await currentUser();
  const supabase = createServerSupabaseClient();

  if (!user || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Map Supabase schema back to HistoryEntry interface
    return data.map((d: any) => ({
      id: d.id,
      symptoms: d.symptoms,
      predictions: d.full_data,
      topDisease: d.disease_name,
      topConfidence: d.confidence,
      topSeverity: d.risk_level,
      aiSummary: d.ai_summary,
      timestamp: d.created_at
    }));
  } catch (error) {
    console.error("Failed to fetch cloud history:", error);
    return [];
  }
}
