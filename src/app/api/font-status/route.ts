import { NextRequest, NextResponse } from 'next/server';
import { getFontStatusFromDb, updateFontStatusInDb } from '@/lib/db';
import { checkFontLicense } from '@/utils/font-db';
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
    const { searchParams } = new URL(req.url);
    const fontName = searchParams.get('name');

    if (!fontName) {
        return NextResponse.json({ error: 'Font name required' }, { status: 400 });
    }

    // 1. Check DB
    const dbStatus = getFontStatusFromDb(fontName);

    // 2. If not in DB, check static list
    let status = dbStatus;
    let source = 'db';

    if (!status) {
        const staticInfo = checkFontLicense(fontName);
        status = staticInfo.status;
        source = 'static';
    }

    const canEdit = isAuthorized(req);

    return NextResponse.json({
        fontName,
        status,
        source,
        canEdit
    });
}

export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { fontName, status } = body;

        if (!fontName || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        updateFontStatusInDb(fontName, status);

        return NextResponse.json({ success: true, fontName, status });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
