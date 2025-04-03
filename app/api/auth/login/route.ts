import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        console.log('Login attempt:', { email });

        const db = await getDb();

        // Find user
        const user = await db.collection('users').findOne({
            email: email.toLowerCase().trim()
        });

        console.log('User found:', !!user);

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValid);

        if (!isValid) {
            return NextResponse.json(
                { message: 'Invalid password' },
                { status: 401 }
            );
        }

        // Success response
        const response = NextResponse.json({
            status: 'success',
            username: user.username
        });

        // Set cookie
        response.cookies.set('username', user.username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });

        return response;

    } catch (error: unknown) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { message: 'Login failed', error: errorMessage },
            { status: 500 }
        );
    }
}
