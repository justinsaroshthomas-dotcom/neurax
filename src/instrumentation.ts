export async function register() {
    // Sentry integration is optional — only loads when SENTRY_DSN is configured
    if (process.env.SENTRY_DSN) {
        try {
            const Sentry = await import("@sentry/nextjs");
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                tracesSampleRate: 1.0,
                debug: false,
            });
        } catch {
            // Sentry not available, skip silently
        }
    }
}
