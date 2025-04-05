import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();
        const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

        const messages = await db.collection('globalChat')
            .find({
                timestamp: { $gte: twentyMinutesAgo }
            })
            .sort({ timestamp: 1 })
            .toArray();

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Fetch global chat error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}
