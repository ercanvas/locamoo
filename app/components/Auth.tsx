"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Image from 'next/image';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: ''
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            if (data.success) {
                localStorage.setItem('username', data.username);
                router.push('/');
            } else {
                throw new Error(data.message || 'Authentication failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            console.error('Auth error:', err);
        }
    };

    const handleSpectatorMode = () => {
        localStorage.setItem('username', 'spectator');
        localStorage.setItem('isSpectator', 'true');
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md space-y-6">
                <div className="text-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="Locamoo"
                        width={150}
                        height={50}
                        className="mx-auto mb-6"
                    />
                    <h1 className="text-2xl font-bold text-white">
                        {isLogin ? 'Welcome Back!' : 'Create Account'}
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Username"
                                className="w-full bg-gray-800 text-white pl-10 p-3 rounded-lg"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Email"
                            className="w-full bg-gray-800 text-white pl-10 p-3 rounded-lg"
                        />
                    </div>

                    <div className="relative">
                        <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Password"
                            className="w-full bg-gray-800 text-white pl-10 p-3 rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-900 text-gray-500">OR</span>
                    </div>
                </div>

                <button
                    onClick={handleSpectatorMode}
                    className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-500 p-3 rounded-lg border border-purple-500/20 transition-colors"
                >
                    👁️ See Through The Eyes of The Audience
                </button>
            </div>
        </div>
    );
}
