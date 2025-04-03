"use client";
import { useState, useEffect } from 'react';

interface AuthProps {
    onAuthSuccess: (user: { username: string }) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [passkey, setPasskey] = useState('');
    const [signupPasskey, setSignupPasskey] = useState('');
    const [passwordRules, setPasswordRules] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const handlePasskeyInput = (value: string) => {
        // Only allow exactly 6 digits
        if (/^\d{0,6}$/.test(value)) {
            setPasskey(value);
            setError(''); // Clear error when input changes
        }
    };

    const handleSignupPasskeyInput = (value: string) => {
        // Only allow 6 digits
        if (/^\d{0,6}$/.test(value)) {
            setSignupPasskey(value);
        }
    };

    const validatePassword = (value: string) => {
        setPassword(value);
        setPasswordRules({
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success) {
                localStorage.setItem('username', data.username);
                onAuthSuccess({ username: data.username });
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
            console.error('Login error:', err);
        }
    };

    const handlePasskeySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!passkey) {
            setError('Passkey is required');
            return;
        }

        try {
            const response = await fetch('/api/auth/passkey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passkey }),
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Authentication failed');
            }

            const data = await response.json();
            if (data.success && data.username) {
                localStorage.setItem('hasPasskey', 'true');
                localStorage.setItem('username', data.username);
                onAuthSuccess({ username: data.username });
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            console.error('Auth error:', err);
        }
    };

    // Check if user has passkey
    useEffect(() => {
        const hasPasskey = localStorage.getItem('hasPasskey');
        setIsFirstTime(!hasPasskey);
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    Welcome to Locamoo
                </h1>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {!isFirstTime ? (
                    // Passkey login form
                    <form onSubmit={handlePasskeySubmit} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm">Enter your 6-digit passkey</label>
                            <input
                                type="number"
                                value={passkey}
                                onChange={(e) => handlePasskeyInput(e.target.value)}
                                className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1 text-center text-2xl tracking-widest"
                                placeholder="000000"
                                required
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                        >
                            Login with Passkey
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('hasPasskey');
                                setIsFirstTime(true);
                            }}
                            className="w-full text-gray-400 hover:text-white text-sm"
                        >
                            Use email login instead
                        </button>
                    </form>
                ) : (
                    // Email registration/login form
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="text-gray-400 text-sm">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">Choose your 6-digit passkey</label>
                                    <div className="flex justify-between mt-1">
                                        <input
                                            type="number"
                                            value={signupPasskey}
                                            onChange={(e) => handleSignupPasskeyInput(e.target.value)}
                                            className="w-full bg-gray-800 text-white p-3 rounded-lg text-center tracking-[1em] text-2xl"
                                            placeholder="000000"
                                            required
                                            maxLength={6}
                                            pattern="\d{6}"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        You'll use this passkey for future logins
                                    </p>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-gray-400 text-sm">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-gray-400 text-sm">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => validatePassword(e.target.value)}
                                className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1"
                                required
                            />
                            {!isLogin && (
                                <div className="mt-2 space-y-1 text-sm">
                                    <div className={`flex items-center gap-2 ${passwordRules.length ? 'text-green-500' : 'text-gray-400'}`}>
                                        <span>{passwordRules.length ? '✓' : '○'}</span>
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRules.uppercase ? 'text-green-500' : 'text-gray-400'}`}>
                                        <span>{passwordRules.uppercase ? '✓' : '○'}</span>
                                        <span>One uppercase letter</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRules.lowercase ? 'text-green-500' : 'text-gray-400'}`}>
                                        <span>{passwordRules.lowercase ? '✓' : '○'}</span>
                                        <span>One lowercase letter</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRules.number ? 'text-green-500' : 'text-gray-400'}`}>
                                        <span>{passwordRules.number ? '✓' : '○'}</span>
                                        <span>One number</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRules.special ? 'text-green-500' : 'text-gray-400'}`}>
                                        <span>{passwordRules.special ? '✓' : '○'}</span>
                                        <span>One special character (!@#$%^&*)</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                        >
                            {isLogin ? 'Login' : 'Sign Up'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="w-full text-gray-400 hover:text-white text-sm"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
