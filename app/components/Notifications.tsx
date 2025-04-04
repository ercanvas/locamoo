"use client";
import { useState, useEffect } from 'react';
import { MdNotifications, MdCheck, MdClose } from 'react-icons/md';

interface Notification {
    type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED';
    from: string;
    timestamp: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        const ws = new WebSocket(WS_URL!);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NOTIFICATION') {
                setNotifications(prev => [{
                    type: data.notificationType,
                    from: data.from,
                    timestamp: new Date().toISOString()
                }, ...prev]);
            }
        };

        return () => ws.close();
    }, []);

    const handleFriendRequest = async (from: string, accept: boolean) => {
        try {
            const res = await fetch('/api/friends/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: localStorage.getItem('username'),
                    requestUsername: from,
                    accept
                })
            });

            if (res.ok) {
                // Remove the notification
                setNotifications(prev =>
                    prev.filter(n => !(n.type === 'FRIEND_REQUEST' && n.from === from))
                );
            }
        } catch (error) {
            console.error('Failed to respond to friend request:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-white"
            >
                <MdNotifications className="text-2xl" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        {notifications.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg p-4 space-y-4 z-50">
                    {notifications.length === 0 ? (
                        <p className="text-gray-400 text-center">No notifications</p>
                    ) : (
                        notifications.map((notif, i) => (
                            <div key={i} className="border-b border-gray-800 pb-4">
                                <p className="text-white">
                                    {notif.type === 'FRIEND_REQUEST' ? (
                                        <div className="flex items-center justify-between">
                                            <span>{notif.from} sent you a friend request</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleFriendRequest(notif.from, true)}
                                                    className="p-1.5 bg-green-600 rounded-lg hover:bg-green-700"
                                                >
                                                    <MdCheck className="text-white" />
                                                </button>
                                                <button
                                                    onClick={() => handleFriendRequest(notif.from, false)}
                                                    className="p-1.5 bg-red-600 rounded-lg hover:bg-red-700"
                                                >
                                                    <MdClose className="text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        `${notif.from} accepted your friend request`
                                    )}
                                </p>
                                <span className="text-xs text-gray-400">
                                    {new Date(notif.timestamp).toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
