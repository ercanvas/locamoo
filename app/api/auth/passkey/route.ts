import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Auth attempt:', { type: 'passkey' });

        if (!body.passkey) {
            return NextResponse.json(
                { success: false, message: 'Passkey is required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const user = await db.collection('users').findOne(
            { passkey: body.passkey.toString() },
            { projection: { username: 1 } }
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid passkey' },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            success: true,
            username: user.username
        });

        response.cookies.set('username', user.username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { success: false, message: 'Authentication failed' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}
