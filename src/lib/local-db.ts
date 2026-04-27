import Database from 'better-sqlite3';
import path from 'path';

// Define the path to the local database file
const dbPath = path.resolve(process.cwd(), 'iist_local.db');

// Initialize the database
const db = new Database(dbPath);

// Create tables if they don't exist
export function initLocalDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pre_authorized_users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      department TEXT,
      year TEXT
    );

    CREATE TABLE IF NOT EXISTS profiles (
      identity_code TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      full_name TEXT,
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'Open',
      priority TEXT DEFAULT 'Medium',
      reporter_id TEXT REFERENCES profiles(identity_code),
      assignee_id TEXT REFERENCES profiles(identity_code),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES profiles(identity_code),
      type TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Local SQLite Database initialized at:', dbPath);
}

export default db;
