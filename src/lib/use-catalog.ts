"use client";

import { useEffect, useState } from "react";
import type { CatalogData, CatalogSummary } from "@/lib/catalog-types";

let catalogCache: CatalogData | null = null;
let summaryCache: CatalogSummary | null = null;

export function useCatalog() {
    const [data, setData] = useState<CatalogData | null>(catalogCache);
    const [loading, setLoading] = useState(!catalogCache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (catalogCache) {
            return;
        }

        let active = true;
        fetch("/api/catalog", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Catalog request failed: ${response.status}`);
                }
                return (await response.json()) as CatalogData;
            })
            .then((catalog) => {
                catalogCache = catalog;
                if (active) {
                    setData(catalog);
                    setLoading(false);
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err.message : "Failed to load catalog.");
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    return { data, loading, error };
}

export function useCatalogSummary() {
    const [data, setData] = useState<CatalogSummary | null>(summaryCache);
    const needsRefresh = !summaryCache?.metrics || summaryCache.metrics.top3 == null;
    const [loading, setLoading] = useState(!summaryCache || needsRefresh);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (summaryCache && summaryCache.metrics?.top3 != null) {
            return;
        }

        let active = true;
        fetch("/api/catalog?summary=1", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Catalog summary failed: ${response.status}`);
                }
                return (await response.json()) as CatalogSummary;
            })
            .then((summary) => {
                summaryCache = summary;
                if (active) {
                    setData(summary);
                    setLoading(false);
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err.message : "Failed to load catalog summary.");
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    return { data, loading, error };
}
