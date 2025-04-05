import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const currentUser = request.headers.get('x-user');
        if (!currentUser) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await getDb();
        const messages = await db.collection('privateMessages')
            .find({
                $or: [
                    { from: currentUser, to: params.username },
                    { from: params.username, to: currentUser }
                ]
            })
            .sort({ timestamp: 1 })
            .limit(50)
            .toArray();

        return NextResponse.json({ messages });

    } catch (error) {
        console.error('Fetch chat history error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch chat history' },
            { status: 500 }
        );
    }
}
