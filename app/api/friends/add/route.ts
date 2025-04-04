import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import WebSocket from 'ws';

const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://locamoo.onrender.com';

export async function POST(request: Request) {
    try {
        const { username, friendUsername } = await request.json();
        const db = await getDb();

        // Create friend request
        await db.collection('friendRequests').insertOne({
            from: username,
            to: friendUsername,
            status: 'pending',
            createdAt: new Date()
        });

        // Send WebSocket notification
        const ws = new WebSocket(WS_URL);
        ws.on('open', () => {
            ws.send(JSON.stringify({
                type: 'FRIEND_REQUEST',
                username: username,
                to: friendUsername
            }));
            ws.close();
        });

        return NextResponse.json({
            success: true,
            message: 'Friend request sent'
        });

    } catch (error) {
        console.error('Add friend error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to send friend request' },
            { status: 500 }
        );
    }
}
