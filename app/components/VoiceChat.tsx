"use client";
import { useState, useEffect, useRef } from 'react';
import { MdMic, MdMicOff, MdAdd, MdClose, MdPeople } from 'react-icons/md';

interface VoiceRoom {
    id: string;
    name: string;
    createdBy: string;
    participants: string[];
}

interface WebSocketMessage {
    type: string;
    username?: string;
    from?: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:your-turn-server.com:3478',
            username: 'your-username',
            credential: 'your-password'
        }
    ]
};

export default function VoiceChat({ onClose }: { onClose: () => void }) {
    const [rooms, setRooms] = useState<VoiceRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const mediaStream = useRef<MediaStream | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const audioElements = useRef<Map<string, HTMLAudioElement>>(new Map());
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        fetchRooms();
        // Initialize WebSocket connection
        const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        ws.current = new WebSocket(WS_URL!);

        return () => {
            cleanupVoiceChat();
            ws.current?.close();
        };
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/voice/rooms');
            const data = await res.json();
            if (data.rooms) {
                setRooms(data.rooms);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        }
    };

    const createRoom = async () => {
        if (!newRoomName.trim()) return;

        try {
            const res = await fetch('/api/voice/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newRoomName,
                    createdBy: localStorage.getItem('username')
                })
            });

            if (res.ok) {
                fetchRooms();
                setShowCreateRoom(false);
                setNewRoomName('');
            }
        } catch (error) {
            console.error('Failed to create room:', error);
        }
    };

    const joinRoom = async (roomId: string) => {
        try {
            await initializeAudio();
            setActiveRoom(roomId);

            // Join room via WebSocket
            ws.current?.send(JSON.stringify({
                type: 'VOICE_JOIN',
                roomId,
                username: localStorage.getItem('username')
            }));

            // Handle WebSocket messages
            if (ws.current) {
                ws.current.onmessage = async (event: MessageEvent) => {
                    const data = JSON.parse(event.data) as WebSocketMessage;
                    switch (data.type) {
                        case 'VOICE_USER_JOINED':
                            if (data.username && data.username !== localStorage.getItem('username')) {
                                const pc = await setupPeerConnection(data.username);
                                const offer = await pc.createOffer();
                                await pc.setLocalDescription(offer);
                                ws.current?.send(JSON.stringify({
                                    type: 'VOICE_OFFER',
                                    to: data.username,
                                    offer
                                }));
                            }
                            break;

                        case 'VOICE_USER_LEFT':
                            if (data.username) {
                                const connection = peerConnections.current.get(data.username);
                                if (connection) {
                                    connection.close();
                                    peerConnections.current.delete(data.username);
                                }
                                const audio = audioElements.current.get(data.username);
                                if (audio) {
                                    audio.remove();
                                    audioElements.current.delete(data.username);
                                }
                            }
                            break;

                        case 'VOICE_OFFER':
                            if (data.from && data.offer) {
                                await handleIncomingOffer(data.from, data.offer);
                            }
                            break;

                        case 'VOICE_ANSWER':
                            if (data.from && data.answer) {
                                await handleIncomingAnswer(data.from, data.answer);
                            }
                            break;

                        case 'VOICE_ICE':
                            if (data.from && data.candidate) {
                                await handleIncomingICE(data.from, data.candidate);
                            }
                            break;
                    }
                };
            }
        } catch (error) {
            console.error('Failed to join room:', error);
        }
    };

    const initializeAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.current = stream;
            audioContext.current = new AudioContext();
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    };

    const setupPeerConnection = async (username: string) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnections.current.set(username, pc);

        // Add local tracks
        mediaStream.current?.getTracks().forEach(track => {
            pc.addTrack(track, mediaStream.current!);
        });

        // Handle incoming tracks
        pc.ontrack = (event) => {
            const audio = new Audio();
            audio.srcObject = event.streams[0];
            audio.autoplay = true;
            audioElements.current.set(username, audio);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                ws.current?.send(JSON.stringify({
                    type: 'VOICE_ICE',
                    to: username,
                    candidate: event.candidate
                }));
            }
        };

        return pc;
    };

    const handleIncomingOffer = async (from: string, offer: RTCSessionDescriptionInit) => {
        const pc = await setupPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        ws.current?.send(JSON.stringify({
            type: 'VOICE_ANSWER',
            to: from,
            answer
        }));
    };

    const handleIncomingAnswer = async (from: string, answer: RTCSessionDescriptionInit) => {
        const pc = peerConnections.current.get(from);
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleIncomingICE = async (from: string, candidate: RTCIceCandidateInit) => {
        const pc = peerConnections.current.get(from);
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const leaveRoom = (roomId: string) => {
        ws.current?.send(JSON.stringify({
            type: 'VOICE_LEAVE',
            roomId,
            username: localStorage.getItem('username')
        }));
        cleanupVoiceChat();
        setActiveRoom(null);
    };

    const cleanupVoiceChat = () => {
        if (activeRoom) {
            leaveRoom(activeRoom);
        }
        mediaStream.current?.getTracks().forEach(track => track.stop());
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        audioElements.current.forEach(audio => audio.remove());
        audioElements.current.clear();
    };

    const toggleMute = () => {
        if (mediaStream.current) {
            mediaStream.current.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-md rounded-lg shadow-xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h3 className="text-white font-medium text-lg">Voice Chat</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-4">
                    {!activeRoom ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white">Available Rooms</h4>
                                <button
                                    onClick={() => setShowCreateRoom(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                >
                                    <MdAdd size={20} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {rooms.map(room => (
                                    <div
                                        key={room.id}
                                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                                    >
                                        <div>
                                            <p className="text-white font-medium">{room.name}</p>
                                            <p className="text-sm text-gray-400">
                                                <MdPeople className="inline mr-1" />
                                                {room.participants.length} participants
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => joinRoom(room.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <h4 className="text-white mb-4">Connected to voice chat</h4>
                            <button
                                onClick={toggleMute}
                                className={`p-4 rounded-full ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                    } text-white mx-auto`}
                            >
                                {isMuted ? <MdMicOff size={24} /> : <MdMic size={24} />}
                            </button>
                        </div>
                    )}
                </div>

                {showCreateRoom && (
                    <div className="p-4 border-t border-gray-800">
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Room name..."
                            className="w-full bg-gray-800 text-white p-2 rounded-lg mb-2"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateRoom(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createRoom}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                            >
                                Create Room
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
