"use client";
import { useState, useEffect, useRef } from 'react';
import { MdSearch, MdClose, MdVerified, MdCircle } from 'react-icons/md';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
    username: string;
    photoUrl: string;
    status: 'online' | 'offline' | 'in_game';
    role?: 'admin' | 'moderator';
    isOnline?: boolean;
}

export default function UserSearch() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim()) {
                setUsers([]);
                return;
            }

            try {
                const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setUsers(data.users);
            } catch (error) {
                console.error('Search failed:', error);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <div ref={searchRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    className="w-64 bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg"
                />
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {showResults && users.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                    {users.map(user => (
                        <Link
                            key={user.username}
                            href={`/player/${user.username}`}
                            className="flex items-center justify-between p-3 hover:bg-gray-800 transition-colors group"
                            onClick={() => setShowResults(false)}
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
                                    <div className="text-sm text-gray-400">{user.status}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
