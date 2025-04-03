import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const username = request.cookies.get('username');
    const isAuthPage = request.nextUrl.pathname === '/auth';
    const isPublicPath = request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api');

    // Let auth page be accessible when not logged in
    if (isAuthPage) {
        return NextResponse.next();
    }

    // Protect other routes
    if (!username && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
