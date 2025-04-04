import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const db = await getDb();

        // Get pending friend requests
        const requests = await db.collection('friendRequests')
            .find({
                to: params.username,
                status: 'pending'
            })
            .toArray();

        // Get sender details for each request
        const senderUsernames = requests.map(req => req.from);
        const senderDetails = await db.collection('users')
            .find(
                { username: { $in: senderUsernames } },
                { projection: { username: 1, photoUrl: 1 } }
            )
            .toArray();

        return NextResponse.json({
            success: true,
            requests: senderDetails
        });

    } catch (error) {
        console.error('Fetch requests error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch friend requests' },
            { status: 500 }
        );
    }
}
