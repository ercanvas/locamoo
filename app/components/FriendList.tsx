"use client";
import { useState, useEffect } from 'react';
import { MdPersonAdd, MdCheck, MdClose, MdChat } from 'react-icons/md';
import Image from 'next/image';
import Link from 'next/link';
import Chat from './Chat';

interface Friend {
    username: string;
    photoUrl: string;
    status: 'online' | 'offline' | 'in_game';
}

export default function FriendList({ username }: { username: string }) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<{ username: string, photoUrl: string }[]>([]);
    const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await fetch(`/api/friends/${username}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch friends');
            }

            if (data.success) {
                setFriends(data.friends);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/friends/requests/${username}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch requests');
            }

            if (data.success) {
                setRequests(data.requests);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleRequest = async (requestUsername: string, accept: boolean) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/friends/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, requestUsername, accept })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to process friend request');
            }

            fetchRequests();
            if (accept) fetchFriends();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Friends</h2>
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {requests.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Friend Requests</h3>
                    <div className="space-y-3">
                        {requests.map(request => (
                            <div key={request.username} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        <Image src={request.photoUrl} alt={request.username} width={40} height={40} />
                                    </div>
                                    <span className="text-white">{request.username}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRequest(request.username, true)}
                                        className="p-2 bg-green-600 rounded-lg hover:bg-green-700">
                                        <MdCheck className="text-white" />
                                    </button>
                                    <button onClick={() => handleRequest(request.username, false)}
                                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700">
                                        <MdClose className="text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {friends.map(friend => (
                    <div key={friend.username} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <Link href={`/player/${friend.username}`} className="flex items-center gap-3 hover:opacity-80">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                <Image src={friend.photoUrl} alt={friend.username} width={40} height={40} />
                            </div>
                            <div>
                                <div className="text-white">{friend.username}</div>
                                <div className="text-sm text-gray-400">{friend.status}</div>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' :
                                friend.status === 'in_game' ? 'bg-blue-500' : 'bg-gray-500'
                                }`} />
                            <button
                                onClick={() => setActiveChatUser(friend.username)}
                                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                            >
                                <MdChat />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add chat component */}
            {activeChatUser && (
                <Chat
                    friend={activeChatUser}
                    onClose={() => setActiveChatUser(null)}
                />
            )}
        </div>
    );
}
