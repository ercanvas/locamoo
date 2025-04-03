import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { username } = await request.json();
        const db = await getDb();

        await db.collection('users').updateOne(
            { username },
            { $set: { status: 'online' } }
        );

        return NextResponse.json({ message: 'Matchmaking cancelled' });
    } catch (error) {
        console.error('Cancel matchmaking error:', error);
        return NextResponse.json(
            { message: 'Failed to cancel matchmaking' },
            { status: 500 }
        );
    }
}
