import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const currentUser = request.headers.get('x-user');
        if (!currentUser) {
            return NextResponse.json({ isFriend: false }, { status: 401 });
        }

        const db = await getDb();
        const friend = await db.collection('friends').findOne({
            $or: [
                { user1: currentUser, user2: params.username },
                { user1: params.username, user2: currentUser }
            ]
        });

        return NextResponse.json({
            success: true,
            isFriend: !!friend
        });

    } catch (error) {
        console.error('Check friend error:', error);
        return NextResponse.json(
            { success: false, isFriend: false },
            { status: 500 }
        );
    }
}
