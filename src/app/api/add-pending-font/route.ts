import { NextRequest, NextResponse } from 'next/server';
import { addPendingFont } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fontName } = body;

        if (!fontName) {
            return NextResponse.json({ error: 'Missing fontName' }, { status: 400 });
        }

        addPendingFont(fontName);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
