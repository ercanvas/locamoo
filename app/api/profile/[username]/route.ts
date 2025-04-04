import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import { isAdmin, canModifyUser } from '@/app/lib/auth-helpers';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const db = await getDb();
        const user = await db.collection('users').findOne(
            { username: params.username },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Add admin role if username is yasin
        const isAdmin = params.username === 'yasin';
        const role = isAdmin ? 'admin' : user.role;

        return NextResponse.json({
            ...user,
            role,
            canAssignModerator: isAdmin
        });

    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const { newUsername, actorUsername } = await request.json();
        const db = await getDb();

        const canModify = await canModifyUser(actorUsername, params.username, db);
        if (!canModify) {
            return NextResponse.json(
                { message: 'Unauthorized to modify this user' },
                { status: 403 }
            );
        }

        await db.collection('users').updateOne(
            { username: params.username },
            { $set: { username: newUsername } }
        );

        return NextResponse.json({
            message: 'Username updated successfully'
        });

    } catch (error) {
        console.error('Update username error:', error);
        return NextResponse.json(
            { message: 'Failed to update username' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const { actorUsername } = await request.json();
        const db = await getDb();

        const canModify = await canModifyUser(actorUsername, params.username, db);
        if (!canModify) {
            return NextResponse.json(
                { message: 'Unauthorized to delete this user' },
                { status: 403 }
            );
        }

        await db.collection('users').deleteOne({ username: params.username });

        return NextResponse.json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { message: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
