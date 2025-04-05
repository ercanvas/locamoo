import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();
        const rooms = await db.collection('voiceRooms')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ rooms });
    } catch (error) {
        console.error('Fetch voice rooms error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch rooms' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { name, createdBy } = await request.json();

        if (!name || !createdBy) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const result = await db.collection('voiceRooms').insertOne({
            name,
            createdBy,
            participants: [createdBy],
            createdAt: new Date()
        });

        return NextResponse.json({
            id: result.insertedId,
            message: 'Room created successfully'
        });
    } catch (error) {
        console.error('Create voice room error:', error);
        return NextResponse.json(
            { message: 'Failed to create room' },
            { status: 500 }
        );
    }
}
