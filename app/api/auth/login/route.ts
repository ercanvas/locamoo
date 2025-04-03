import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const user = await db.collection('users').findOne(
            { email: email.toLowerCase().trim() },
            {
                maxTimeMS: 10000,
                projection: { password: 1, username: 1 }  // Only fetch needed fields
            }
        );

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            username: user.username
        });

    } catch (error: any) {
        console.error('Login error:', error);

        if (error.name === 'MongoTimeoutError') {
            return NextResponse.json(
                { success: false, message: 'Database timeout. Please try again.' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'An internal server error occurred' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        message: "Method not allowed"
    }, { status: 405 });
}
