import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { username, requestUsername, accept } = await request.json();

        if (!username || !requestUsername) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // First verify both users exist
        const [user, friendUser] = await Promise.all([
            db.collection('users').findOne({ username }),
            db.collection('users').findOne({ username: requestUsername })
        ]);

        if (!user || !friendUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if friend request exists
        const existingRequest = await db.collection('friendRequests').findOne({
            from: requestUsername,
            to: username,
            status: 'pending'
        });

        if (!existingRequest) {
            return NextResponse.json(
                { success: false, message: 'Friend request not found' },
                { status: 404 }
            );
        }

        if (accept) {
            // Create friend relationship
            await db.collection('friends').insertOne({
                user1: username,
                user2: requestUsername,
                createdAt: new Date()
            });
        }

        // Update request status
        await db.collection('friendRequests').updateOne(
            { _id: existingRequest._id },
            { $set: { status: accept ? 'accepted' : 'rejected' } }
        );

        return NextResponse.json({
            success: true,
            message: accept ? 'Friend request accepted' : 'Friend request rejected'
        });

    } catch (error) {
        console.error('Friend request response error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process friend request' },
            { status: 500 }
        );
    }
}
