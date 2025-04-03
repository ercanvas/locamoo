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

        // Success - return user data
        return NextResponse.json({
            success: true,
            username: user.username,
            message: "Login successful"
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
