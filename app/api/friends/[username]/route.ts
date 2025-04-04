import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const db = await getDb();
        const friends = await db.collection('friends')
            .find({ $or: [{ user1: params.username }, { user2: params.username }] })
            .toArray();

        // Get friend usernames
        const friendUsernames = friends.map(f =>
            f.user1 === params.username ? f.user2 : f.user1
        );

        // Get friend details
        const friendDetails = await db.collection('users')
            .find(
                { username: { $in: friendUsernames } },
                { projection: { username: 1, photoUrl: 1, status: 1 } }
            )
            .toArray();

        return NextResponse.json({
            success: true,
            friends: friendDetails
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch friends' },
            { status: 500 }
        );
    }
}
