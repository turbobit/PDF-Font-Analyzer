import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const db = getDb();

        let query = 'SELECT name, status, updated_at FROM font_licenses';
        let params: any[] = [];

        if (search) {
            query += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY updated_at DESC';

        const stmt = db.prepare(query);
        const fonts = stmt.all(...params);

        return NextResponse.json({ fonts });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
