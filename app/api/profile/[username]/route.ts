import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

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
