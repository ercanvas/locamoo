import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ users: [] });
        }

        const db = await getDb();
        const users = await db.collection('users')
            .find(
                {
                    username: {
                        $regex: query,
                        $options: 'i'
                    }
                },
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
            .limit(10)
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
        console.error('Search error:', error);
        return NextResponse.json(
            { message: 'Search failed' },
            { status: 500 }
        );
    }
}
