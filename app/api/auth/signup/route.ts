import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password, username } = await request.json();
        console.log('Signup attempt:', { email, username });

        // Username validation
        if (!username || username.length < 3) {
            return NextResponse.json(
                { success: false, message: 'Username must be at least 3 characters long' },
                { status: 400 }
            );
        }

        // Sanitize username - only allow alphanumeric and underscore
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json(
                { success: false, message: 'Username can only contain letters, numbers, and underscores' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Check for similar usernames (case insensitive)
        const similarUsers = await db.collection('users').find({
            username: { $regex: new RegExp(`^${username}$`, 'i') }
        }).toArray();

        if (similarUsers.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Username already taken' },
                { status: 400 }
            );
        }

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
            { success: false, message: 'Failed to create account' },
            { status: 500 }
        );
    }
}
