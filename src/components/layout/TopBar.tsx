"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser, UserButton } from "@clerk/nextjs";
import { Bell, Command, Search, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getUserProfile, type UserProfile } from "@/lib/profile-store";
import { useCatalogSummary } from "@/lib/use-catalog";
export function TopBar() {
  const { user, isLoaded } = useUser();
  const { data: catalogSummary } = useCatalogSummary();
  const top3Value = catalogSummary?.metrics?.top3;
  const [showNotifications, setShowNotifications] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
  const displayName = (
    isLoaded ? user?.firstName || "Doctor" : "Doctor"
  ).toUpperCase();
  const profileLabel = (
    profile.clinicalLevel || "Senior Physician"
  ).toUpperCase();
  useEffect(() => {
    const handleStorageChange = () => {
      setProfile(getUserProfile());
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "neurax_profile_updated",
      handleStorageChange as EventListener,
    );
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "neurax_profile_updated",
        handleStorageChange as EventListener,
      );
    };
  }, []);
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-6 lg:px-8">
      {" "}
      <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-border bg-card px-[20.8px] py-4 shadow-sm backdrop-blur-2xl dark:border-border dark:bg-card">
        {" "}
        <div className="flex min-w-0 items-center gap-4">
          {" "}
          <div className="hidden h-12 w-12 items-center justify-center rounded-[1.3rem] bg-card text-primary shadow-[0_16px_26px_-22px_rgba(37,99,235,0.95)] dark:bg-card sm:flex">
            {" "}
            <Sparkles className="h-5 w-5" />{" "}
          </div>{" "}
          <div className="min-w-0">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <span className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                {" "}
                Neurax Intelligence{" "}
              </span>{" "}
              <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[8px] font-black text-foreground shadow-sm dark:border-border dark:bg-card ">
                {" "}
                v4.1{" "}
              </span>{" "}
            </div>{" "}
            <h1 className="truncate font-display text-xl font-black tracking-tight text-foreground">
              {" "}
              Clinical Decision Workspace{" "}
            </h1>{" "}
          </div>{" "}
        </div>{" "}
        <div className="group hidden min-w-0 flex-1 px-2 lg:flex">
          {" "}
          <div className="flex h-12 w-full max-w-2xl items-center rounded-[1.35rem] border border-border bg-card px-4 shadow-sm transition-all group-focus-within:border-primary/35">
            {" "}
            <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />{" "}
            <input
              type="text"
              placeholder="Search diseases, symptoms, or workflow modules..."
              className="min-w-0 flex-1 truncate bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/80"
            />{" "}
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              {" "}
              <Command className="h-3 w-3 text-muted-foreground/80" />{" "}
              <span className="text-[10px] font-bold text-muted-foreground/80">
                K
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <ThemeToggle />{" "}
          <div className="relative">
            {" "}
            <button
              onClick={() => setShowNotifications((open) => !open)}
              className="group relative flex h-11 w-11 items-center justify-center rounded-[1.25rem] border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary dark:border-border dark:bg-card"
            >
              {" "}
              <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />{" "}
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-card bg-rose-500" />{" "}
            </button>{" "}
            {showNotifications ? (
              <div className="absolute right-0 top-14 z-50 w-84 rounded-[1.8rem] border border-border bg-card p-5 shadow-sm backdrop-blur-2xl dark:border-border dark:bg-[rgba(12,18,34,0.92)]">
                {" "}
                <div className="mb-4 flex items-center justify-between">
                  {" "}
                  <h3 className="text-xs font-black uppercase tracking-[0.22em] text-popover-foreground">
                    {" "}
                    System Alerts{" "}
                  </h3>{" "}
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />{" "}
                </div>{" "}
                <div className="space-y-3">
                  {" "}
                  <div className="rounded-[1.3rem] border border-border bg-card p-4 shadow-sm dark:border-border dark:bg-card">
                    {" "}
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
                      {" "}
                      Generated catalog active{" "}
                    </p>{" "}
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      {" "}
                      {catalogSummary?.counts.diseases ?? 0} diseases and{" "}
                      {catalogSummary?.counts.extendedSymptoms ?? 0} extended
                      symptom markers are available locally.{" "}
                    </p>{" "}
                  </div>{" "}
                  <div className="rounded-[1.3rem] border border-border bg-card p-4 shadow-sm dark:border-border dark:bg-card">
                    {" "}
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
                      {" "}
                      Ranked differential quality{" "}
                    </p>{" "}
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      {" "}
                      Top-3 clinical ranking is currently{" "}
                      {top3Value != null
                        ? `${top3Value.toFixed(2)}%`
                        : "loading..."}
                      .{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ) : null}{" "}
          </div>{" "}
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-sm dark:border-border dark:bg-card">
            {" "}
            <div className="flex flex-col items-end">
              {" "}
              <span className="text-xs font-bold tracking-tight text-foreground">
                {" "}
                {displayName}{" "}
              </span>{" "}
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 italic">
                {" "}
                {profileLabel}{" "}
              </span>{" "}
            </div>{" "}
            {isLoaded && user ? (
              <div className="rounded-full p-0.5 ring-2 ring-primary/15 transition-all hover:ring-primary/35">
                {" "}
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt="Profile"
                    width={36}
                    height={36}
                    unoptimized
                    className="h-9 w-9 rounded-full border border-border object-cover"
                  />
                ) : (
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox:
                          "w-9 h-9 rounded-full grayscale hover:grayscale-0 transition-all duration-500",
                      },
                    }}
                  />
                )}{" "}
              </div>
            ) : (
              <div className="h-9 w-9 rounded-full border border-border bg-card animate-pulse" />
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </header>
  );
}
