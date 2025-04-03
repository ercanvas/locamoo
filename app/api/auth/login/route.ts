import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        console.log('Login attempt:', { email });

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email and password are required"
            }, { status: 400 });
        }

        const db = await getDb();

        const user = await db.collection('users').findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid credentials"
            }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({
                success: false,
                message: "Invalid credentials"
            }, { status: 401 });
        }

        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            username: user.username
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
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        message: "Method not allowed"
    }, { status: 405 });
}
