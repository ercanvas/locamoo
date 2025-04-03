import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const maxDuration = 30; // Increased from 15 to 30 seconds

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
                maxTimeMS: 3000, // Reduced from 5000 to 3000ms
                projection: { password: 1, username: 1 }  // Only fetch needed fields
            }
        );

        console.log('Login attempt:', { email, foundUser: !!user });

        if (!user || !user.password) {
            console.log('User not found or missing password');
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        try {
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('Password check result:', { isValid: isValidPassword });

            if (!isValidPassword) {
                return NextResponse.json(
                    { success: false, message: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        } catch (bcryptError) {
            console.error('bcrypt compare error:', bcryptError);
            return NextResponse.json(
                { success: false, message: 'Authentication error' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            username: user.username
        });

    } catch (error: any) {
        console.error('Login error:', error);

        if (error.name === 'MongoTimeoutError' || error.code === 'ETIMEDOUT') {
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
