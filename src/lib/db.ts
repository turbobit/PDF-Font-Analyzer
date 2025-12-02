import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
    if (db) return db;

    const dbPath = path.join(process.cwd(), 'fonts.db');
    db = new Database(dbPath);

    db.exec(`
    CREATE TABLE IF NOT EXISTS font_licenses (
      name TEXT PRIMARY KEY,
      status TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    return db;
}

export function getFontStatusFromDb(fontName: string): string | null {
    const db = getDb();
    const stmt = db.prepare('SELECT status FROM font_licenses WHERE name = ?');
    const result = stmt.get(fontName) as { status: string } | undefined;
    return result ? result.status : null;
}

export function updateFontStatusInDb(fontName: string, status: string): void {
    const db = getDb();
    const stmt = db.prepare(`
    INSERT INTO font_licenses (name, status, updated_at) 
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(name) DO UPDATE SET 
      status = excluded.status,
      updated_at = datetime('now')
  `);
    stmt.run(fontName, status);
}
