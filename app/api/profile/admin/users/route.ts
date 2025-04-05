import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import { isAdmin } from '@/app/lib/auth-helpers';

export async function GET(request: Request) {
    try {
        const adminUsername = request.headers.get('x-admin-user');

        if (!adminUsername || !isAdmin(adminUsername)) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 403 }
            );
        }

        const db = await getDb();
        const users = await db.collection('users').aggregate([
            {
                $lookup: {
                    from: 'friends',
                    let: { username: '$username' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$user1', '$$username'] },
                                        { $eq: ['$user2', '$$username'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'friends'
                }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    photoUrl: 1,
                    role: 1,
                    status: 1,
                    lastStatusUpdate: 1,
                    createdAt: 1,
                    friendCount: { $size: '$friends' },
                    _id: 0
                }
            }
        ]).toArray();

        const transformedUsers = users.map(user => ({
            ...user,
            isOnline: user.lastStatusUpdate &&
                (new Date().getTime() - new Date(user.lastStatusUpdate).getTime()) < 5 * 60 * 1000
        }));

        return NextResponse.json({ users: transformedUsers });

    } catch (error) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
