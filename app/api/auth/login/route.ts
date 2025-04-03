import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        const db = await getDb();

        const user = await db.collection('users').findOne({ email: email.toLowerCase() });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        return NextResponse.json({ success: true, username: user.username });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
