import { NextRequest, NextResponse } from 'next/server';
import { getPendingFonts, deletePendingFont, clearAllPendingFonts } from '@/lib/db';
import { isAuthorizedIP } from '@/lib/auth';

// Helper to check if IP is authorized
function isAuthorized(req: NextRequest): boolean {
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const host = req.headers.get('host') || '';

    if (host.includes('localhost')) {
        return true;
    }

    return isAuthorizedIP(ip);
}

export async function GET(req: NextRequest) {
    try {
        const fonts = getPendingFonts();
        const canEdit = isAuthorized(req);

        return NextResponse.json({ fonts, canEdit });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { fontName, clearAll } = body;

        if (clearAll) {
            clearAllPendingFonts();
            return NextResponse.json({ success: true, message: 'All pending fonts cleared' });
        }

        if (!fontName) {
            return NextResponse.json({ error: 'Missing fontName' }, { status: 400 });
        }

        deletePendingFont(fontName);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
