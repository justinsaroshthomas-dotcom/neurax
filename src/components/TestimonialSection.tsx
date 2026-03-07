"use client";

import { useEffect, useState } from "react";
import { getRecentTestimonials } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import type { Testimonial } from "@/lib/actions";
import TestimonialForm from "./TestimonialForm";
import Link from "next/link";

export default function TestimonialSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const { isLoaded, userId } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const tData = await getRecentTestimonials(6);
            setTestimonials(tData);
            setLoading(false);
        };
        if (isLoaded) load();
    }, [isLoaded]);

    return (
        <section className="bg-white py-24 px-6 border-t border-slate-200 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4 text-slate-900">Trusted by Professionals</h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        See how NeuraMed's Deep Learning models are assisting accurate medical correlations in real-world scenarios.
                    </p>
                </div>

                {/* Submission Form for Authenticated Users */}
                {loading || !isLoaded ? (
                    <div className="flex justify-center mb-16">
                        <div className="w-8 h-8 border-2 border-[#00B140] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : userId ? (
                    <TestimonialForm />
                ) : (
                    <div className="mb-16 text-center text-slate-500 bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-2xl mx-auto">
                        Want to share your experience? <Link href="/sign-in" className="text-[#00B140] font-medium hover:underline">Log in to leave a review</Link>.
                    </div>
                )}

                {/* Testimonial Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.length > 0 ? (
                        testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-1 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={`text-lg ${i < testimonial.rating ? "text-amber-400" : "text-gray-200"}`}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className="text-slate-700 leading-relaxed mb-6 flex-grow">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-200">
                                    <div className="w-10 h-10 rounded-full bg-[#00B140]/10 flex items-center justify-center text-[#00B140] font-bold">
                                        {testimonial.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold text-slate-900">{testimonial.user_name}</p>
                                        <p className="text-slate-500 text-xs text-nowrap">Verified User</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 grayscale">
                                💬
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No Clinical Reviews Yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                We are currently collecting verified feedback from our clinical partners. 
                                Be the first to share your experience with NeuraMed.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
