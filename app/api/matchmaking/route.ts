import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

const MATCHMAKING_TIMEOUT = 30000; // 30 seconds

export async function POST(request: Request) {
    try {
        const { username } = await request.json();
        const db = await getDb();

        // Update player status to 'finding_match'
        await db.collection('users').updateOne(
            { username },
            { $set: { status: 'finding_match', lastStatusUpdate: new Date() } }
        );

        // Find another player who is also looking for a match
        const opponent = await db.collection('users').findOne({
            username: { $ne: username },
            status: 'finding_match',
            lastStatusUpdate: { 
                $gt: new Date(Date.now() - MATCHMAKING_TIMEOUT) 
            }
        });

        if (opponent) {
            // Create a match and update both players' status
            const match = {
                players: [username, opponent.username],
                status: 'ready',
                createdAt: new Date()
            };

            await db.collection('matches').insertOne(match);
            
            // Update both players' status to 'in_game'
            await db.collection('users').updateMany(
                { username: { $in: [username, opponent.username] } },
                { $set: { status: 'in_game' } }
            );

            return NextResponse.json({
                matched: true,
                opponent: {
                    username: opponent.username,
                    photoUrl: opponent.photoUrl,
                    level: opponent.level
                }
            });
        }

        return NextResponse.json({ matched: false });

    } catch (error) {
        console.error('Matchmaking error:', error);
        return NextResponse.json(
            { message: 'Matchmaking failed' },
            { status: 500 }
        );
    }
}
