"use client";

import { useState } from "react";
import { submitTestimonial } from "@/lib/actions";

export default function TestimonialForm() {
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        const res = await submitTestimonial(content, rating);
        if (res.success) {
            setStatus("success");
            setMessage("Thank you! Your testimonial has been submitted.");
            setContent("");
            setRating(5);
        } else {
            setStatus("error");
            setMessage(res.error || "Failed to submit.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>
            
            {status === "success" && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    {message}
                </div>
            )}
            
            {status === "error" && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {message}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-2xl transition-colors ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Experience</label>
                <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B140] focus:border-transparent outline-none resize-none"
                    placeholder="How did NeuraMed assist in your diagnosis?"
                />
            </div>

            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto px-6 py-2 bg-[#00B140] text-white rounded-lg font-medium hover:bg-[#009935] disabled:opacity-50 transition-colors"
            >
                {status === "loading" ? "Submitting..." : "Submit Testimonial"}
            </button>
        </form>
    );
}
