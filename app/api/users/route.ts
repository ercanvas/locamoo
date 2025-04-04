import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();
        const users = await db.collection('users')
            .find(
                {},
                {
                    projection: {
                        username: 1,
                        photoUrl: 1,
                        status: 1,
                        role: 1,
                        lastStatusUpdate: 1,
                        _id: 0
                    }
                }
            )
            .toArray();

        // Transform data to include admin role and online status
        const transformedUsers = users.map(user => ({
            ...user,
            role: user.username === 'yasin' ? 'admin' : user.role,
            isOnline: user.lastStatusUpdate &&
                (new Date().getTime() - new Date(user.lastStatusUpdate).getTime()) < 5 * 60 * 1000
        }));

        return NextResponse.json({ users: transformedUsers });

    } catch (error) {
        console.error('Fetch users error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
