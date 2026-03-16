import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest, event: any) {
  try {
    // If keys are missing (or Vercel has an old Edge cache), bypass Clerk to prevent 500 error
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
      return NextResponse.next();
    }
    
    // Invoke the official clerk middleware dynamically
    const clerk = clerkMiddleware();
    return await clerk(req, event);
  } catch (error) {
    console.error("Vercel Edge Clerk Error:", error);
    // Graceful fallback so the app continues to load
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
