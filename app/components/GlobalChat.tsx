"use client";
import { useState, useEffect, useRef } from 'react';
import { MdSend, MdClose, MdChat, MdVerified, MdVoiceChat } from 'react-icons/md';
import Image from 'next/image';
import Link from 'next/link';
import VoiceChat from './VoiceChat';

interface ChatMessage {
    username: string;
    message: string;
    timestamp: string;
    photoUrl: string;
    role?: 'admin' | 'moderator';
}

export default function GlobalChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showVoiceChat, setShowVoiceChat] = useState(false);
    const [wsReady, setWsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/chat/global');
                const data = await res.json();
                if (data.messages) {
                    const messagesWithUserData = await Promise.all(
                        data.messages.map(async (msg: ChatMessage) => {
                            const userRes = await fetch(`/api/profile/${msg.username}`);
                            const userData = await userRes.json();
                            return {
                                ...msg,
                                photoUrl: userData.photoUrl || '/default-avatar.png',
                                isOnline: userData.isOnline
                            };
                        })
                    );
                    setMessages(messagesWithUserData);
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        // Connect to WebSocket
        const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        ws.current = new WebSocket(WS_URL!);

        ws.current.onopen = () => {
            setWsReady(true);
            console.log('WebSocket connected');
        };

        ws.current.onclose = () => {
            setWsReady(false);
            console.log('WebSocket disconnected');
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'GLOBAL_CHAT') {
                setMessages(prev => {
                    // Keep only messages from last 20 minutes
                    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
                    const filteredMessages = prev.filter(msg =>
                        new Date(msg.timestamp) >= twentyMinutesAgo
                    );
                    return [...filteredMessages, data.message];
                });
            }
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    const sendMessage = () => {
        if (!message.trim() || !wsReady) return;

        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'GLOBAL_CHAT',
                username: localStorage.getItem('username'),
                message: message.trim()
            }));
            setMessage('');
        } else {
            console.warn('WebSocket not ready, message not sent');
        }
    };

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    if (isLoading) {
        return (
            <button
                className="fixed bottom-4 right-4 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors animate-pulse"
            >
                <MdChat className="text-white text-2xl" />
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
                <MdChat className="text-white text-2xl" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 w-full max-w-2xl rounded-lg shadow-xl">
                        <div className="flex justify-between items-center p-4 border-b border-gray-800">
                            <h3 className="text-white font-medium text-lg">Global Chat</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowVoiceChat(true)}
                                    className="bg-green-600 hover:bg-green-700 p-2 rounded-lg text-white"
                                >
                                    <MdVoiceChat size={20} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <MdClose size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Link href={`/player/${msg.username}`} className="shrink-0">
                                        <div className="relative w-10 h-10">
                                            <Image
                                                src={msg.photoUrl || '/default-avatar.png'}
                                                alt={msg.username}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </Link>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/player/${msg.username}`}
                                                className={`font-medium ${msg.role === 'admin'
                                                    ? 'text-red-500'
                                                    : msg.role === 'moderator'
                                                        ? 'text-blue-500'
                                                        : 'text-white'
                                                    }`}
                                            >
                                                {msg.username}
                                                {msg.role && <MdVerified className="inline ml-1" />}
                                            </Link>
                                            <span className="text-xs text-gray-500">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-300">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-800 flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-800 text-white p-2 rounded-lg"
                            />
                            <button
                                onClick={sendMessage}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <MdSend size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showVoiceChat && (
                <VoiceChat onClose={() => setShowVoiceChat(false)} />
            )}
        </>
    );
}
