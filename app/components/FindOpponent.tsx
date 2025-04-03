"use client";
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Image from 'next/image';

interface Opponent {
    username: string;
    photoUrl: string;
    level: number;
}

interface FindOpponentProps {
    onAccept: (opponent: Opponent) => void;
    onCancel: () => void;
}

function Globe() {
    return (
        <mesh rotation={[0, 0, 0]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#4299e1" wireframe />
        </mesh>
    );
}

export default function FindOpponent({ onAccept, onCancel }: FindOpponentProps) {
    const [opponent, setOpponent] = useState<Opponent | null>(null);
    const [searchTime, setSearchTime] = useState(0);
    const [onlinePlayers, setOnlinePlayers] = useState<number>(0);
    const [inQueue, setInQueue] = useState<number>(0);
    const wsRef = useRef<WebSocket | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            // Join matchmaking queue
            ws.send(JSON.stringify({
                type: 'JOIN_QUEUE',
                username: localStorage.getItem('username')
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'STATS_UPDATE':
                    setOnlinePlayers(data.onlinePlayers);
                    setInQueue(data.inQueue);
                    break;
                case 'MATCH_FOUND':
                    setOpponent(data.opponent);
                    break;
            }
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        // Start search timer if no opponent found
        if (!opponent) {
            timerRef.current = setInterval(() => {
                setSearchTime(prev => prev + 1);
            }, 1000);
        }

        // Cleanup timer
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [opponent]);

    // Format search time to mm:ss
    const formatSearchTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddFriend = async () => {
        if (!opponent) return;
        try {
            const response = await fetch('/api/friends/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: localStorage.getItem('username'),
                    friendUsername: opponent.username
                })
            });

            if (response.ok) {
                // Show success message
                alert('Friend request sent!');
            }
        } catch (error) {
            console.error('Failed to send friend request:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4">
                {!opponent ? (
                    <>
                        <div className="h-64 mb-6">
                            <Canvas camera={{ position: [0, 0, 3] }}>
                                <ambientLight intensity={0.5} />
                                <pointLight position={[10, 10, 10]} />
                                <OrbitControls
                                    enableZoom={false}
                                    autoRotate
                                    autoRotateSpeed={5}
                                />
                                <Globe />
                            </Canvas>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Finding Opponent
                            </h2>
                            <p className="text-gray-400 mb-4">
                                Search time: {formatSearchTime(searchTime)}
                            </p>
                            <p className="text-gray-400 mb-2">
                                {onlinePlayers} players online • {inQueue} in queue
                            </p>
                            <button
                                onClick={onCancel}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500">
                                <Image
                                    src={opponent.photoUrl}
                                    alt={opponent.username}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 px-2 py-1 rounded text-xs text-white">
                                Level {opponent.level}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-6">
                            {opponent.username}
                        </h2>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={handleAddFriend}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                            >
                                Add Friend
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={onCancel}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => onAccept(opponent)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
