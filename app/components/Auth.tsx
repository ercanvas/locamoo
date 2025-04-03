"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (data.success) {
            localStorage.setItem('username', data.username);
            router.replace('/');
        }
    };

    const handleSpectatorMode = () => {
        localStorage.setItem('username', 'spectator');
        localStorage.setItem('isSpectator', 'true');
        router.push('/'); // Changed from replace to push
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl w-96 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg"
                    >
                        Login
                    </button>
                </form>

                <div className="border-t border-gray-800 pt-4">
                    <button
                        onClick={handleSpectatorMode}
                        className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-500 p-3 rounded-lg border border-purple-500/20"
                    >
                        👁️ See Through The Eyes of The Audience
                    </button>
                </div>
            </div>
        </div>
    );
}
