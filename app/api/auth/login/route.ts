import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/mongodb';
import bcrypt from 'bcryptjs';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Email and password are required'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const db = await getDb();
        const user = await db.collection('users').findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Invalid credentials'
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Invalid credentials'
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const response = new Response(
            JSON.stringify({
                success: true,
                username: user.username
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'An internal server error occurred'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        success: false,
        message: "Method not allowed"
    }, { status: 405 });
}
