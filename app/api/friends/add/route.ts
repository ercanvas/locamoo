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

        if (username === friendUsername) {
            return NextResponse.json(
                { success: false, message: 'Cannot add yourself as friend' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Verify both users exist
        const [user, friendUser] = await Promise.all([
            db.collection('users').findOne({ username }),
            db.collection('users').findOne({ username: friendUsername })
        ]);

        if (!user || !friendUser) {
            return NextResponse.json(
                { success: false, message: `User ${!user ? username : friendUsername} not found` },
                { status: 404 }
            );
        }

        // Check existing friendship and requests in both directions
        const [existingFriend, existingRequest] = await Promise.all([
            db.collection('friends').findOne({
                $or: [
                    { user1: username, user2: friendUsername },
                    { user1: friendUsername, user2: username }
                ]
            }),
            db.collection('friendRequests').findOne({
                $or: [
                    { from: username, to: friendUsername },
                    { from: friendUsername, to: username }
                ],
                status: 'pending'
            })
        ]);

        if (existingFriend) {
            return NextResponse.json(
                { success: false, message: 'Already friends' },
                { status: 400 }
            );
        }

        if (existingRequest) {
            return NextResponse.json(
                { success: false, message: 'Friend request already exists' },
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
