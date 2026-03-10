"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Search, Bell, Settings } from "lucide-react";

export function TopBar() {
    const { user, isLoaded } = useUser();

    return (
        <header className="h-24 bg-[#F8F9FA] px-10 flex items-center justify-between shrink-0">
            {/* Title Area */}
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#7B61FF] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF]" />
                    ASKLEPIOS V1.2
                </p>
                <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    Disease Database Check
                </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl px-12">
                <div className="relative flex items-center w-full h-12 bg-white rounded-full shadow-sm border border-slate-100 px-4 focus-within:ring-2 focus-within:ring-[#7B61FF]/20 focus-within:border-[#7B61FF]/50 transition-all">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search All Diseases..." 
                        className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-[#1A1A1A] placeholder:text-slate-400"
                    />
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer">
                        <Settings className="w-3 h-3 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Right Profile Area */}
            <div className="flex items-center gap-5">
                <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#1A1A1A] transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#FF4D6D] border-2 border-white" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-[#1A1A1A]">
                            Hello, {isLoaded ? user?.firstName || "Doctor" : "Doctor"}!
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Clinical Deck
                        </span>
                    </div>
                    {isLoaded && user ? (
                        <div className="ring-2 ring-white rounded-full shadow-md">
                            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-full" } }} />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                    )}
                </div>
            </div>
        </header>
    );
}
