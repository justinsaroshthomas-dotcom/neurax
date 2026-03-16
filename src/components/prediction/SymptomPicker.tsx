"use client";
import { useMemo, useState } from "react";
import type { CatalogSymptom } from "@/lib/catalog-types";
import { useCatalog } from "@/lib/use-catalog";
interface SymptomPickerProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}
function groupSymptoms(symptoms: CatalogSymptom[]) {
  const map = new Map<string, CatalogSymptom[]>();
  for (const symptom of symptoms) {
    const category =
      symptom.source === "extended" ? "Extended Library" : symptom.category;
    const group = map.get(category) ?? [];
    group.push(symptom);
    map.set(category, group);
  }
  return Array.from(map.entries()).sort(([left], [right]) =>
    left.localeCompare(right),
  );
}
export function SymptomPicker({
  selectedSymptoms,
  onSymptomsChange,
}: SymptomPickerProps) {
  const { data: catalog, loading } = useCatalog();
  const [search, setSearch] = useState("");
  const filteredSymptoms = useMemo(() => {
    if (!catalog) {
      return [];
    }
    if (!search.trim()) {
      return catalog.coreSymptoms;
    }
    const query = search.toLowerCase();
    const merged = [...catalog.coreSymptoms, ...catalog.extendedSymptoms];
    return merged.filter(
      (symptom) =>
        symptom.name.toLowerCase().includes(query) ||
        symptom.category.toLowerCase().includes(query) ||
        symptom.aliases.some((alias) => alias.toLowerCase().includes(query)),
    );
  }, [catalog, search]);
  const grouped = useMemo(
    () => groupSymptoms(filteredSymptoms),
    [filteredSymptoms],
  );
  const toggleSymptom = (name: string) => {
    onSymptomsChange(
      selectedSymptoms.includes(name)
        ? selectedSymptoms.filter((symptom) => symptom !== name)
        : [...selectedSymptoms, name],
    );
  };
  if (loading && !catalog) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {" "}
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-[1.25rem] border border-border bg-card"
          />
        ))}{" "}
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {" "}
      <div className="group relative max-w-[42rem]">
        {" "}
        <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-border/50 via-background/50 to-border/50 opacity-0 blur-2xl transition-opacity duration-500 group-focus-within:opacity-100" />{" "}
        <div className="relative flex items-center">
          {" "}
          <svg
            className="absolute left-6 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary dark:text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />{" "}
          </svg>{" "}
          <input
            id="symptom-search"
            type="text"
            placeholder="Search symptoms or aliases..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-[1.65rem] border border-border bg-card py-5 pl-14 pr-14 text-sm font-medium text-foreground shadow-sm outline-none transition-all duration-300 placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-[0.22em] placeholder:text-muted-foreground focus:border-primary/35 focus:ring-4 focus:ring-primary/10 dark:border-border dark:bg-card dark:placeholder:text-muted-foreground"
          />{" "}
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-6 rounded-full bg-secondary p-1.5 text-muted-foreground transition-colors hover:text-primary dark:bg-card dark:text-muted-foreground"
            >
              {" "}
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />{" "}
              </svg>{" "}
            </button>
          ) : null}{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex flex-wrap items-center gap-3 px-2">
        {" "}
        <div className="mr-4 flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm dark:border-border dark:bg-card">
          {" "}
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-foreground">
            {" "}
            Active Profile{" "}
          </span>{" "}
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-[10px] font-black text-foreground shadow-sm dark:border-border dark:bg-card ">
            {" "}
            {selectedSymptoms.length}{" "}
          </div>{" "}
        </div>{" "}
        {selectedSymptoms.map((symptom) => (
          <button
            key={symptom}
            onClick={() => toggleSymptom(symptom)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary transition-all duration-300 hover:border-rose-500 hover:bg-rose-500 hover:text-white"
          >
            {" "}
            {symptom}{" "}
            <svg
              className="h-3 w-3 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="3"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />{" "}
            </svg>{" "}
          </button>
        ))}{" "}
        {selectedSymptoms.length > 0 ? (
          <button
            onClick={() => onSymptomsChange([])}
            className="ml-auto px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all duration-300 hover:text-rose-500 hover:underline underline-offset-4"
          >
            {" "}
            Clear Selection{" "}
          </button>
        ) : null}{" "}
      </div>{" "}
      <div className="custom-scrollbar max-h-[520px] space-y-10 overflow-y-auto pr-4 scroll-smooth">
        {" "}
        {grouped.map(([category, symptoms]) => (
          <div key={category} className="space-y-4">
            {" "}
            <div className="flex items-center gap-4 px-2">
              {" "}
              <h3 className="font-display text-[10px] font-black uppercase tracking-[0.35em] text-foreground dark:text-muted-foreground">
                {" "}
                {category}{" "}
              </h3>{" "}
              <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[9px] font-black text-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground">
                {" "}
                {symptoms.length}{" "}
              </span>{" "}
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent " />{" "}
            </div>{" "}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {" "}
              {symptoms.map((symptom) => {
                const isActive = selectedSymptoms.includes(symptom.name);
                return (
                  <button
                    key={symptom.id}
                    id={`symptom-${symptom.id}`}
                    onClick={() => toggleSymptom(symptom.name)}
                    className={`group/btn relative h-[49.6px] rounded-[1rem] border px-4 text-left transition-all duration-300 active:scale-[0.98] ${isActive ? "border-primary/35 bg-primary/10 text-primary shadow-[0_16px_24px_-20px_rgba(37,99,235,0.3)]" : "border-border bg-card text-foreground shadow-sm hover:border-primary/25 hover:bg-card hover:text-foreground dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-card"}`}
                  >
                    {" "}
                    <div className="pointer-events-none flex h-full items-center justify-between gap-3">
                      {" "}
                      <div className="min-w-0">
                        {" "}
                        <span className="block truncate text-[11px] font-semibold tracking-tight">
                          {symptom.name}
                        </span>{" "}
                      </div>{" "}
                      {isActive ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          {" "}
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="4"
                            stroke="currentColor"
                          >
                            {" "}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />{" "}
                          </svg>{" "}
                        </div>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-300 transition-colors group-hover/btn:bg-primary/40 " />
                      )}{" "}
                    </div>{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
          </div>
        ))}{" "}
        {filteredSymptoms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border bg-card py-20 animate-in fade-in duration-500">
            {" "}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
              {" "}
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />{" "}
              </svg>{" "}
            </div>{" "}
            <p className="px-10 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {" "}
              No symptom matches found{" "}
              <span className="mt-2 block text-primary">
                &ldquo;{search}&rdquo;
              </span>{" "}
            </p>{" "}
          </div>
        ) : null}{" "}
      </div>{" "}
    </div>
  );
}
