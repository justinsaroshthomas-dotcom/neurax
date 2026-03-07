import Database from 'better-sqlite3';
import path from 'path';

// Define the absolute path to the database file in the root directory
const dbPath = path.join(process.cwd(), 'neuramed.db');

// Initialize the database (creates the file if it doesn't exist)
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('journal_mode = WAL');

// ── Define Database Schema ──

// Create Users Table
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

// Create Sessions Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`).run();

// Create Testimonials Table
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

export default db;
