import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const photo = formData.get('photo') as File;

        if (!photo) {
            return NextResponse.json(
                { message: 'No photo provided' },
                { status: 400 }
            );
        }

        // Convert file to Base64 for MongoDB storage
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const photoBase64 = `data:${photo.type};base64,${buffer.toString('base64')}`;

        const db = await getDb();
        await db.collection('users').updateOne(
            { username },
            { $set: { photoUrl: photoBase64 } }
        );

        return NextResponse.json({
            message: 'Profile photo updated',
            photoUrl: photoBase64
        });

    } catch (error) {
        console.error('Update photo error:', error);
        return NextResponse.json(
            { message: 'Failed to update profile photo' },
            { status: 500 }
        );
    }
}
