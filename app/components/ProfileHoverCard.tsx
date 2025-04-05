"use client";
import { useEffect, useState } from 'react';
import { MdVerified } from 'react-icons/md';
import Image from 'next/image';

interface UserInfo {
    photoUrl: string;
    username: string;
    role?: 'admin' | 'moderator';
    createdAt: string;
    isOnline: boolean;
}

interface ProfileHoverCardProps {
    username: string;
    position: {
        x: number;
        y: number;
    };
}

export default function ProfileHoverCard({ username, position }: ProfileHoverCardProps) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await fetch(`/api/profile/${username}`);
                const data = await res.json();
                setUserInfo({
                    photoUrl: data.photoUrl,
                    username: data.username,
                    role: data.role,
                    createdAt: new Date(data.createdAt).toLocaleDateString(),
                    isOnline: data.isOnline
                });
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };
        fetchUserInfo();
    }, [username]);

    if (!userInfo) return null;

    return (
        <div
            className="absolute z-50 bg-gray-900 rounded-lg shadow-xl p-4 w-64 animate-fade-in"
            style={{
                top: `${position.y + 10}px`,
                left: `${position.x + 10}px`
            }}
        >
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                    <Image
                        src={userInfo.photoUrl || '/default-avatar.png'}
                        alt={username}
                        fill
                        className="rounded-full object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-900 
                        ${userInfo.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`font-medium ${userInfo.role === 'admin' ? 'text-red-500' :
                            userInfo.role === 'moderator' ? 'text-blue-500' :
                                'text-white'
                            }`}>
                            {userInfo.username}
                            {userInfo.role && <MdVerified className="inline ml-1" />}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">Member since {userInfo.createdAt}</p>
                </div>
            </div>
        </div>
    );
}
