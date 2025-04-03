import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email and password are required"
            }, { status: 400 });
        }

        const db = await getDb();
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });

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

        return NextResponse.json({
            success: true,
            username: user.username
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            message: "An error occurred during login"
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        message: "Method not allowed"
    }, { status: 405 });
}
