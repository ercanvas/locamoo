import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { adminUsername, targetUsername } = await request.json();

        if (adminUsername !== 'yasin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        const db = await getDb();

        await db.collection('users').updateOne(
            { username: targetUsername },
            { $set: { role: 'moderator' } }
        );

        return NextResponse.json({
            success: true,
            message: 'Moderator role assigned successfully'
        });

    } catch (error) {
        console.error('Assign moderator error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to assign moderator role' },
            { status: 500 }
        );
    }
}
