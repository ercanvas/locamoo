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

        // Get requesting user for role check
        const requestingUser = request.headers.get('x-user');
        const isAdmin = requestingUser === 'yasin'; // Hardcode admin check for yasin

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...user,
            isAdmin,
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
