import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password, username } = await request.json();
        console.log('Signup attempt:', { email, username });

        const db = await getDb();

        // Create first user for testing
        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await db.collection('users').insertOne({
            email: email.toLowerCase(),
            password: hashedPassword,
            username,
            createdAt: new Date(),
            status: 'online'
        });

        console.log('User created:', result.insertedId);

        const response = NextResponse.json({
            message: 'User created successfully',
            username
        });

        // Set auth cookie
        response.cookies.set('username', username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });

        return response;

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Failed to create user' },
            { status: 500 }
        );
    }
}
