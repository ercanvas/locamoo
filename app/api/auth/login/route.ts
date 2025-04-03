import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password required" },
                { status: 400 }
            );
        }

        const db = await getDb();
        const user = await db.collection('users').findOne(
            { email: email.toLowerCase() },
            { projection: { password: 1, username: 1 } }
        );

        // Log authentication attempt
        console.log('Auth attempt:', { email, userFound: !!user });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 401 }
            );
        }

        const isValid = await bcrypt.compare(password.trim(), user.password);
        console.log('Password check:', { isValid });

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Invalid password" },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            success: true,
            username: user.username,
            message: "Login successful"
        });

        // Set auth cookie
        response.cookies.set('username', user.username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
