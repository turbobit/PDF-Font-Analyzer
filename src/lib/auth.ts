// Utility function to check if IP is authorized
export function isAuthorizedIP(ip: string): boolean {
    const authorizedIPs = process.env.AUTHORIZED_IPS?.split(',').map(ip => ip.trim()) || [];

    // Always allow localhost
    if (ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost')) {
        return true;
    }

    // Check against authorized IPs from env
    return authorizedIPs.some(authorizedIP => ip.includes(authorizedIP));
}

// Helper to get client IP from request
export function getClientIP(req: Request): string {
    const headers = req.headers as any;
    return headers.get?.('x-forwarded-for') || headers['x-forwarded-for'] || 'unknown';
}
