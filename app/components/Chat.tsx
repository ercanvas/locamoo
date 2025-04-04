"use client";
import { useState, useEffect, useRef } from 'react';
import { MdSend, MdClose } from 'react-icons/md';

interface Message {
    from: string;
    message: string;
    timestamp: string;
}

export default function Chat({ friend, onClose }: { friend: string; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        ws.current = new WebSocket(WS_URL!);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'CHAT_MESSAGE' && data.from === friend) {
                setMessages(prev => [...prev, data]);
            }
        };

        return () => {
            ws.current?.close();
        };
    }, [friend]);

    const sendMessage = () => {
        if (!newMessage.trim() || !ws.current) return;

        const message = {
            type: 'CHAT_MESSAGE',
            username: localStorage.getItem('username'),
            to: friend,
            message: newMessage
        };

        ws.current.send(JSON.stringify(message));
        setMessages(prev => [...prev, {
            from: message.username!,
            message: newMessage,
            timestamp: new Date().toISOString()
        }]);
        setNewMessage('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-gray-900 rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h3 className="text-white font-medium">{friend}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <MdClose />
                </button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.from === friend ? 'items-start' : 'items-end'
                        }`}>
                        <div className={`p-3 rounded-lg max-w-[80%] ${msg.from === friend ? 'bg-gray-800' : 'bg-blue-600'
                            }`}>
                            <p className="text-white">{msg.message}</p>
                            <span className="text-xs text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white p-2 rounded-lg"
                />
                <button
                    onClick={sendMessage}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <MdSend />
                </button>
            </div>
        </div>
    );
}
