"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import TestimonialSection from "@/components/TestimonialSection";

export default function Home() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [checking, setChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    }
  }, [isLoaded, userId, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to sign in, but we can pass the query in the URL for later
      router.push(`/sign-in?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00B140] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-white">
      {/* ── Top Navigation ── */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded-lg bg-[#00B140] flex items-center justify-center text-white font-bold text-xl">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Neurax</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="#how-it-works" className="hover:text-[#00B140] transition-colors">How it works</Link>
          <Link href="#features" className="hover:text-[#00B140] transition-colors">Features</Link>
          <Link href="#testimonials" className="hover:text-[#00B140] transition-colors">Testimonials</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm font-semibold text-slate-700 hover:text-[#00B140]">
            Sign in
          </Link>
          <Link href="/sign-up" className="text-sm font-semibold bg-[#00B140] text-white px-4 py-2 rounded-full hover:bg-[#009935] transition-colors shadow-sm shadow-[#00B140]/20">
            Get started
          </Link>
        </div>
      </header>

      {/* ── Hero Search Section (DxGPT Style) ── */}
      <section className="bg-slate-900 text-white pt-24 pb-32 px-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#00B140] blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
            Enter a brief patient's description and Neurax will provide a list of possible disease diagnoses
          </h1>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto align-middle relative">
            <div className="bg-white rounded-2xl p-2 md:p-3 shadow-2xl flex flex-col md:flex-row gap-3">
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type here patient details (age, gender, symptoms) and when they started. Example: Female, 42, severe headaches for 3 months, dizziness, family history of migraines."
                className="w-full text-slate-800 text-base p-3 md:p-4 outline-none resize-none h-28 md:h-20 rounded-xl"
                required
              />
              <button
                type="submit"
                className="bg-[#00B140] hover:bg-[#009935] text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 whitespace-nowrap h-auto md:h-full self-end md:self-stretch"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Search
              </button>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#00B140]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Powered by Deep Learning & Advanced ML (CNN/XGBoost)
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#00B140]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                505 Diseases Supported
              </span>
            </div>
          </form>
        </div>
      </section>



      {/* ── What is Neurax / How it Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white max-w-5xl mx-auto w-full">
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-6 text-slate-900">What is Neurax?</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-4">
            Neurax is an advanced AI-assisted medical diagnosis platform developed by IBM Team 63. We use advanced Deep Neural Networks and Ensemble Machine Learning Models (CNN/XGBoost) trained on Kaggle/UCI datasets to provide rapid differential analysis from symptom descriptions and clinical histories.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            The goal is to enhance — not replace — clinical judgment: save time, neutralize cognitive biases, and raise the quality of clinical reasoning from the first moment. Key features: intelligent differential diagnosis with prioritized lists of possible diagnoses; 505 disease classes supported; secure architecture with automatic anonymization of sensitive data.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-10 text-slate-900">How does Neurax work?</h2>
          <p className="mb-8 text-slate-600 text-lg">Neurax works in 4 simple steps:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              { num: 1, title: "Describe your symptoms", desc: "Enter a medical description in free text or select from our organized lists." },
              { num: 2, title: "Intelligent processing", desc: "Our Deep Learning and Advanced Machine Learning algorithms analyze the information using CNNs, XGBoost, and Random Forest ensembles, detecting clinical patterns and medical correlations." },
              { num: 3, title: "Differential diagnosis", desc: "You receive a prioritized list of possible diagnoses, each with confidence scores, severity ratings, and matching symptom details." },
              { num: 4, title: "Interactive refinement", desc: "You can answer AI-generated follow-up questions to refine the diagnosis, obtain detailed information about specific diseases, or request recommendations." }
            ].map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-[#00B140] flex items-center justify-center font-bold text-lg border border-emerald-200">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl mb-2">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm italic text-slate-400">Powered by cutting-edge artificial intelligence models and secure local infrastructure by IBM Team 63.</p>
        </div>
      </section>

      {/* ── Dynamic Testimonials Section ── */}
      <TestimonialSection />

      {/* ── Interactive Tags Section ── */}
      <section className="bg-slate-50 py-24 px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Common Symptoms and Diseases You Can Check</h2>
          <p className="text-slate-500 mb-10 text-lg">Select a symptom below to see how our predictive model handles real-world medical cases.</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Fever", "Headache", "Nausea", "Fatigue", "Shortness of breath", "Chest pain", 
              "Dizziness", "Abdominal pain", "Cough", "Joint pain", "Malaria", "Dengue", 
              "Typhoid", "Hypertension", "Migraine", "Diabetes", "Pneumonia", "Allergy"
            ].map((tag) => (
              <button 
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium hover:border-[#00B140] hover:text-[#00B140] hover:shadow-sm transition-all text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#111827] text-slate-400 py-16 px-6 relative mt-auto border-t-[6px] border-[#00B140]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#00B140] flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Neurax</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Advanced ML-powered differential diagnosis platform designed for peak performance and accuracy using real-world clinical datasets.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Project</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Neurax</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Accuracy Metrics</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Evaluation Strategy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Machine Learning Models</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Compliance</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Security</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Medical Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00B140] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                  IBM TEAM 63 PROTOCOL
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Distributed Clinical Intelligence &copy; 2026
              </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right max-w-xl">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.1em] leading-loose">
              Developed by <span className="text-white">Justin Thomas</span>, <span className="text-white">Devika NS</span>, <span className="text-white">Krishnajith Vijay</span>, and <span className="text-white">Sivaranjps</span>
            </p>
            <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-slate-800" />
                <p className="text-[10px] font-black text-[#00B140] uppercase tracking-[0.2em] italic">
                  Lead Engineer: Justin Thomas
                </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
