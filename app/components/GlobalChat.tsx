"use client";
import { useState, useEffect, useRef } from 'react';
import { MdSend, MdClose, MdChat, MdVerified } from 'react-icons/md';
import Image from 'next/image';
import Link from 'next/link';

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
    const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        ws.current = new WebSocket(WS_URL!);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'GLOBAL_CHAT') {
                setMessages(prev => [...prev, data.message]);
            }
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    const sendMessage = () => {
        if (!message.trim() || !ws.current) return;

        ws.current.send(JSON.stringify({
            type: 'GLOBAL_CHAT',
            username: localStorage.getItem('username'),
            message: message.trim()
        }));

        setMessage('');
    };

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

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
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <MdClose size={24} />
                            </button>
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
        </>
    );
}
