import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { username, friendUsername } = await request.json();

        if (!username || !friendUsername) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Check if request already exists
        const existingRequest = await db.collection('friendRequests').findOne({
            from: username,
            to: friendUsername,
            status: 'pending'
        });

        if (existingRequest) {
            return NextResponse.json(
                { success: false, message: 'Friend request already sent' },
                { status: 400 }
            );
        }

        // Check if they're already friends
        const existingFriend = await db.collection('friends').findOne({
            $or: [
                { user1: username, user2: friendUsername },
                { user1: friendUsername, user2: username }
            ]
        });

        if (existingFriend) {
            return NextResponse.json(
                { success: false, message: 'Already friends' },
                { status: 400 }
            );
        }

        // Create friend request
        await db.collection('friendRequests').insertOne({
            from: username,
            to: friendUsername,
            status: 'pending',
            createdAt: new Date()
        });

        // Send notification through WebSocket if needed
        // WebSocket notification will be handled by the WebSocket server

        return NextResponse.json({
            success: true,
            message: 'Friend request sent successfully'
        });

    } catch (error) {
        console.error('Add friend error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to send friend request' },
            { status: 500 }
        );
    }
}

// Handle other HTTP methods
export async function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}
