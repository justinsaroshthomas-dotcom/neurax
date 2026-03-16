import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
    conn: null,
    promise: null,
};
global.mongooseCache = cached;

export async function connectMongoDB(): Promise<typeof mongoose | null> {
    if (!MONGODB_URI) {
        console.warn("[MongoDB] No MONGODB_URI — audit logging disabled");
        return null;
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("[MongoDB] Connected successfully");
        return cached.conn;
    } catch (err) {
        cached.promise = null;
        console.error("[MongoDB] Connection failed:", err);
        return null;
    }
}
