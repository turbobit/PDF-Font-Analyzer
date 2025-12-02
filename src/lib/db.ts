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

  db.exec(`
    CREATE TABLE IF NOT EXISTS pending_fonts (
      name TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Remove from pending if exists
  const deleteStmt = db.prepare('DELETE FROM pending_fonts WHERE name = ?');
  deleteStmt.run(fontName);
}

export function addPendingFont(fontName: string): void {
  const db = getDb();
  // Check if already in font_licenses
  const existsStmt = db.prepare('SELECT 1 FROM font_licenses WHERE name = ?');
  if (existsStmt.get(fontName)) {
    return; // Already registered, don't add to pending
  }

  // Add to pending (ignore if duplicate)
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO pending_fonts (name, created_at) 
    VALUES (?, datetime('now'))
  `);
  stmt.run(fontName);
}

export function getPendingFonts(): Array<{ name: string; created_at: string }> {
  const db = getDb();
  const stmt = db.prepare('SELECT name, created_at FROM pending_fonts ORDER BY created_at DESC');
  return stmt.all() as Array<{ name: string; created_at: string }>;
}

export function deletePendingFont(fontName: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM pending_fonts WHERE name = ?');
  stmt.run(fontName);
}

export function clearAllPendingFonts(): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM pending_fonts');
  stmt.run();
}
