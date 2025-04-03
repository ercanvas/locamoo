import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    request: Request,
    { params }: { params: { username: string; gameId: string } }
) {
    try {
        const db = await getDb();
        const gameDetails = await db.collection('gameDetails').findOne({
            gameId: new ObjectId(params.gameId),
            'player.username': params.username
        });

        if (!gameDetails) {
            return NextResponse.json(
                { message: 'Game details not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(gameDetails);
    } catch (error) {
        console.error('Failed to fetch game details:', error);
        return NextResponse.json(
            { message: 'Failed to fetch game details' },
            { status: 500 }
        );
    }
}
