import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const db = await getDb();
        const games = await db.collection('games')
            .find({ 'player.username': params.username })
            .sort({ date: -1 })
            .toArray();

        return NextResponse.json({ games });
    } catch (error) {
        console.error('Failed to fetch games:', error);
        return NextResponse.json(
            { message: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}
