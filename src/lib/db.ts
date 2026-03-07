import path from 'path';

// ── Database Initialization (Resilient) ────────────────
let db: any = null;

// Only initialize SQLite if we are NOT on Vercel or in a serverless environment
// Vercel does not support native better-sqlite3 in serverless functions easily
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

if (!isServerless) {
  try {
    const Database = require('better-sqlite3');
    const dbPath = path.join(process.cwd(), 'neurax.db');
    db = new Database(dbPath, { verbose: console.log });
    db.pragma('journal_mode = WAL');

    // Schema Setup
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        otp_code TEXT,
        otp_expiry INTEGER,
        created_at TEXT NOT NULL
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        is_approved INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run();
  } catch (err) {
    console.warn("[SQLite] Failed to initialize local database. Falling back to Cloud-only mode.", err);
  }
}

export default db;
