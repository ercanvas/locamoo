"use client";
import { useState, useEffect } from 'react';
import { MdCircle, MdVerified } from 'react-icons/md';
import Image from 'next/image';
import Link from 'next/link';

interface User {
    username: string;
    photoUrl: string;
    status: 'online' | 'offline' | 'in_game';
    role?: 'admin' | 'moderator';
    isOnline?: boolean;
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();

                // Sort users: online first, then by role (admin > moderator > user)
                const sortedUsers = data.users.sort((a: User, b: User) => {
                    if (a.isOnline && !b.isOnline) return -1;
                    if (!a.isOnline && b.isOnline) return 1;
                    if (a.role === 'admin') return -1;
                    if (b.role === 'admin') return 1;
                    if (a.role === 'moderator') return -1;
                    if (b.role === 'moderator') return 1;
                    return 0;
                });

                setUsers(sortedUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (isLoading) {
        return <div className="text-gray-400 text-center py-4">Loading users...</div>;
    }

    return (
        <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">All Users</h2>
            <div className="space-y-3">
                {users.map(user => (
                    <Link
                        key={user.username}
                        href={`/player/${user.username}`}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image
                                    src={user.photoUrl || '/default-avatar.png'}
                                    alt={user.username}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-white flex items-center gap-2 ${user.role === 'admin'
                                            ? 'bg-red-500/10 text-red-500 px-2 py-0.5 rounded'
                                            : user.role === 'moderator'
                                                ? 'bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded'
                                                : ''
                                        }`}>
                                        {user.username}
                                        {(user.role === 'admin' || user.role === 'moderator') && (
                                            <MdVerified className="inline" />
                                        )}
                                    </span>
                                    <MdCircle
                                        className={user.isOnline ? "text-green-500" : "text-gray-500"}
                                        size={8}
                                    />
                                </div>
                                <div className="text-sm text-gray-400">
                                    {user.status}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
