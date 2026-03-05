import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

const clerkConfigured =
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY;

// When Clerk is configured, protect dashboard routes
// When Clerk is NOT configured, skip auth (local mode)
const handler = clerkConfigured
    ? clerkMiddleware(async (auth, req) => {
        if (isProtectedRoute(req)) {
            await auth.protect();
        }
    })
    : (_req: NextRequest) => NextResponse.next();

export default handler;

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
