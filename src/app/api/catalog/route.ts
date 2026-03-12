import { NextRequest, NextResponse } from "next/server";
import { loadCatalog, loadCatalogSummary } from "@/lib/catalog.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
    const summaryOnly = request.nextUrl.searchParams.get("summary") === "1";

    if (summaryOnly) {
        const summary = await loadCatalogSummary();
        return NextResponse.json(summary, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });
    }

    const catalog = await loadCatalog();
    return NextResponse.json(catalog, {
        headers: {
            "Cache-Control": "no-store, max-age=0",
        },
    });
}
