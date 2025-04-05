import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import { isAdmin, isModerator } from '@/app/lib/auth-helpers';

export async function GET() {
    try {
        const db = await getDb();
        const words = await db.collection('hiddenWords')
            .find({})
            .sort({ addedAt: -1 })
            .toArray();

        return NextResponse.json({ words });

    } catch (error) {
        console.error('Fetch hidden words error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch hidden words' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { word } = await request.json();
        const username = request.headers.get('x-user');

        if (!username) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await getDb();
        const canModify = await isModerator(username, db);

        if (!canModify) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 403 }
            );
        }

        await db.collection('hiddenWords').insertOne({
            word: word.toLowerCase(),
            addedBy: username,
            addedAt: new Date()
        });

        return NextResponse.json({
            message: 'Word added successfully'
        });

    } catch (error) {
        console.error('Add hidden word error:', error);
        return NextResponse.json(
            { message: 'Failed to add word' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { word } = await request.json();
        const username = request.headers.get('x-user');

        if (!username) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await getDb();
        const canModify = await isModerator(username, db);

        if (!canModify) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 403 }
            );
        }

        await db.collection('hiddenWords').deleteOne({ word });

        return NextResponse.json({
            message: 'Word deleted successfully'
        });

    } catch (error) {
        console.error('Delete hidden word error:', error);
        return NextResponse.json(
            { message: 'Failed to delete word' },
            { status: 500 }
        );
    }
}
