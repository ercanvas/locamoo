import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import { isAdmin } from '@/app/lib/auth-helpers';

export async function DELETE(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const { feedback, actorUsername } = await request.json();
        const db = await getDb();

        // Allow admin to delete any account
        if (!isAdmin(actorUsername) && actorUsername !== params.username) {
            return NextResponse.json(
                { message: 'Unauthorized to delete this account' },
                { status: 403 }
            );
        }

        // Store feedback if provided
        if (feedback) {
            await db.collection('feedback').insertOne({
                username: params.username,
                feedback,
                type: 'account_deletion',
                createdAt: new Date(),
                deletedBy: actorUsername
            });
        }

        // Delete all user data
        await Promise.all([
            db.collection('users').deleteOne({ username: params.username }),
            db.collection('friends').deleteMany({
                $or: [{ user1: params.username }, { user2: params.username }]
            }),
            db.collection('friendRequests').deleteMany({
                $or: [{ from: params.username }, { to: params.username }]
            }),
            // Add any other collections that need cleanup
        ]);

        return NextResponse.json({
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        return NextResponse.json(
            { message: 'Failed to delete account' },
            { status: 500 }
        );
    }
}
