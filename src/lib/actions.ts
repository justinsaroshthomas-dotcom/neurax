"use server";

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

  try {
    const id = randomBytes(16).toString("hex");
    const createdAt = new Date().toISOString();

    db.prepare(`
        INSERT INTO testimonials (id, user_id, user_name, content, rating, is_approved, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(id, user.id, user.fullName || user.username || "User", content.trim(), rating, createdAt);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit testimonial:", error);
    return { success: false, error: "Failed to submit testimonial. Please try again." };
  }
}

export async function getRecentTestimonials(limit: number = 6): Promise<Testimonial[]> {
  try {
    const rows = db.prepare(`
        SELECT id, user_name, content, rating, created_at 
        FROM testimonials 
        WHERE is_approved = 1 
        ORDER BY created_at DESC 
        LIMIT ?
    `).all(limit) as Testimonial[];

    // If no real testimonials exist, return empty array to avoid showing "fake" ones
    if (rows.length === 0) {
      return [];
    }

    return rows;
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return [];
  }
}
