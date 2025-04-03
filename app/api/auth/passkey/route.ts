import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Passkey attempt:', body);

        if (!body.passkey) {
            return NextResponse.json(
                { message: 'Passkey is required' },
                { status: 400 }
            );
        }

        const passkey = body.passkey.toString().trim();
        console.log('Checking passkey:', passkey);

        const db = await getDb();
        const user = await db.collection('users').findOne({ passkey });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid passkey' },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            status: 'success',
            username: user.username,
            email: user.email
        });

        response.cookies.set('username', user.username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });

        return response;

    } catch (error) {
        console.error('Passkey login error:', error);
        return NextResponse.json(
            { message: 'Authentication failed' },
            { status: 500 }
        );
    }
}
