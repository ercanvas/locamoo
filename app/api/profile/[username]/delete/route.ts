import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function DELETE(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const { feedback } = await request.json();
        const db = await getDb();

        // Store feedback if provided
        if (feedback) {
            await db.collection('feedback').insertOne({
                username: params.username,
                feedback,
                type: 'account_deletion',
                createdAt: new Date()
            });
        }

        // Delete user
        const result = await db.collection('users').deleteOne({
            username: params.username
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

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
