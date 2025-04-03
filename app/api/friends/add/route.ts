import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { username, friendUsername } = await request.json();
        const db = await getDb();

        // Create friend request
        await db.collection('friendRequests').insertOne({
            from: username,
            to: friendUsername,
            status: 'pending',
            createdAt: new Date()
        });

        return NextResponse.json({
            message: 'Friend request sent'
        });

    } catch (error) {
        console.error('Add friend error:', error);
        return NextResponse.json(
            { message: 'Failed to send friend request' },
            { status: 500 }
        );
    }
}
