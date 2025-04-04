"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { MdHistory, MdPerson, MdWorkspacePremium } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UserSearch from './UserSearch';

type Props = {
    gameMode?: 'car' | 'plane' | 'weather';
    city1?: string;
    city2?: string;
    onSubmit: (answer: string) => void;
    opponentHistory?: boolean[];
    correctAnswer?: string;
    onCountdownEnd?: () => void;
    currentTemps?: { city1: number; city2: number }; // Add this prop
    onQuit: () => void;
    username: string; // Add username prop
};

export default function GameInterface({
    gameMode = 'car',
    city1 = 'City 1',
    city2 = 'City 2',
    onSubmit,
    opponentHistory = [],
    correctAnswer = "02:30:00",
    onCountdownEnd,
    currentTemps = { city1: 0, city2: 0 },
    onQuit,
    username,
}: Props) {
    const router = useRouter();
    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');
    const [countdown, setCountdown] = useState(10);
    const [opponentAnswer, setOpponentAnswer] = useState('??:??:??');
    const [shouldSubmit, setShouldSubmit] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const isCountdownEndCalled = useRef(false);
    const [temp1, setTemp1] = useState('');
    const [temp2, setTemp2] = useState(''); // Add temp2 state declaration

    const circumference = 2 * Math.PI * 20;
    const progress = (countdown / 10) * circumference;

    const handleCountdownComplete = useCallback(() => {
        if (!isCountdownEndCalled.current) {
            setShouldSubmit(true);
            setShowCorrectAnswer(true);
            isCountdownEndCalled.current = true;
            // Schedule the onCountdownEnd callback for next tick
            setTimeout(() => {
                onCountdownEnd?.();
            }, 0);
        }
    }, [onCountdownEnd]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleCountdownComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            isCountdownEndCalled.current = false;
        };
    }, [handleCountdownComplete]);

    // Reset the ref when component remounts
    useEffect(() => {
        isCountdownEndCalled.current = false;
    }, []);

    // Handle submission separately
    useEffect(() => {
        if (shouldSubmit) {
            const submitTimer = setTimeout(() => {
                handleSubmit();
                setShouldSubmit(false);
            }, 0);
            return () => clearTimeout(submitTimer);
        }
    }, [shouldSubmit]);

    // Reset countdown and answers when cities change
    useEffect(() => {
        setCountdown(10);
        setOpponentAnswer('??:??:??');
        setShowCorrectAnswer(false);
        setShouldSubmit(false);
        setHours('00');
        setMinutes('00');
        setSeconds('00');
    }, [city1, city2]);

    const handleTimeInput = (value: string, setter: (value: string) => void, max: number) => {
        const num = parseInt(value) || 0;
        if (num >= 0 && num <= max) {
            setter(num.toString().padStart(2, '0'));
        }
    };

    const handleTempInput = (value: string, setter: (value: string) => void) => {
        const num = parseInt(value) || 0;
        if (num >= -50 && num <= 50) {
            setter(value);
        }
    };

    const handleSubmit = () => {
        if (gameMode === 'weather') {
            const temps = { city1: parseInt(temp1), city2: parseInt(temp2) };
            onSubmit(JSON.stringify(temps));
        } else {
            onSubmit(`${hours}:${minutes}:${seconds}`);
        }
        setOpponentAnswer('12:34:56'); // This would be the actual opponent's answer
    };

    return (
        <div className="fixed inset-0 pointer-events-none">
            {/* Navigation Bar */}
            <div className="bg-black/50 backdrop-blur-sm p-4 pointer-events-auto">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Locamoo"
                            width={120}
                            height={40}
                            className="mb-4"
                        />
                    </Link>

                    {/* Add search component */}
                    <div className="flex-1 flex justify-center">
                        <UserSearch />
                    </div>

                    {/* Rest of navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onQuit}
                            className="pointer-events-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Quit Game
                        </button>

                        <button
                            onClick={() => router.push('/premium')}
                            className="pointer-events-auto flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 px-4 py-2 rounded-lg text-sm"
                        >
                            <MdWorkspacePremium className="text-lg" />
                            <span>Get Premium</span>
                        </button>

                        <Link
                            href={`/player/${username}/previous`}
                            className="pointer-events-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
                        >
                            <MdHistory className="text-lg" />
                            <span>History</span>
                        </Link>

                        <Link
                            href={`/player/${username}`}
                            className="pointer-events-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
                        >
                            <MdPerson className="text-lg" />
                            <span>Profile</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 p-6 rounded-lg text-white min-w-[400px] pointer-events-auto">
                {/* Add round counter */}
                <div className="absolute top-4 left-4 text-sm font-mono">
                    Round {opponentHistory.length + 1}/5
                </div>

                {/* Countdown */}
                <div className="absolute top-4 right-4">
                    <svg className="w-12 h-12">
                        <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="#4B5563"
                            strokeWidth="2"
                            fill="none"
                            className="opacity-25"
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - progress}
                            className="transition-all duration-1000 ease-linear"
                            transform="rotate(-90, 20, 20)"
                        />
                        <text
                            x="20"
                            y="20"
                            dy=".3em"
                            textAnchor="middle"
                            fill="white"
                            className="text-sm font-bold"
                        >
                            {countdown}
                        </text>
                    </svg>
                </div>

                {/* Cities */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">
                        {gameMode === 'weather'
                            ? 'Guess current weather of each country:'
                            : `Estimate ${gameMode} travel time between:`}
                    </h2>
                    <p className="text-lg">
                        {city1} → {city2}
                    </p>
                </div>

                {/* Conditional render based on game mode */}
                {gameMode === 'weather' ? (
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="text-center mb-2">
                            <p className="text-sm text-gray-400">Guess the current weather</p>
                            <p className="text-lg mt-1">
                                {city1} → {city2}
                            </p>
                        </div>
                        <div className="flex justify-between items-center gap-8">
                            <div className="flex-1 text-center">
                                <p className="mb-2">{city1}</p>
                                <input
                                    type="number"
                                    value={temp1}
                                    onChange={(e) => handleTempInput(e.target.value, setTemp1)}
                                    className="w-24 bg-gray-800 text-center text-2xl p-2 rounded"
                                    placeholder="°C"
                                    min="-50"
                                    max="50"
                                />
                            </div>
                            <div className="flex-1 text-center">
                                <p className="mb-2">{city2}</p>
                                <input
                                    type="number"
                                    value={temp2}
                                    onChange={(e) => handleTempInput(e.target.value, setTemp2)}
                                    className="w-24 bg-gray-800 text-center text-2xl p-2 rounded"
                                    placeholder="°C"
                                    min="-50"
                                    max="50"
                                />
                            </div>
                        </div>
                        {showCorrectAnswer && (
                            <div className="text-center mt-4">
                                <div className="text-sm text-green-400">Actual Temperatures</div>
                                <div className="flex justify-center gap-8 mt-2">
                                    <div>{currentTemps.city1}°C</div>
                                    <div>{currentTemps.city2}°C</div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Existing time input section */
                    <div className="flex justify-center gap-2 mb-6">
                        <input
                            type="text"
                            value={hours}
                            onChange={(e) => handleTimeInput(e.target.value, setHours, 99)}
                            className="w-16 bg-gray-800 text-center text-2xl p-2 rounded"
                            placeholder="HH"
                        />
                        <span className="text-2xl">:</span>
                        <input
                            type="text"
                            value={minutes}
                            onChange={(e) => handleTimeInput(e.target.value, setMinutes, 59)}
                            className="w-16 bg-gray-800 text-center text-2xl p-2 rounded"
                            placeholder="MM"
                        />
                        <span className="text-2xl">:</span>
                        <input
                            type="text"
                            value={seconds}
                            onChange={(e) => handleTimeInput(e.target.value, setSeconds, 59)}
                            className="w-16 bg-gray-800 text-center text-2xl p-2 rounded"
                            placeholder="SS"
                        />
                    </div>
                )}

                {/* Opponent Section */}
                <div className="flex items-center justify-between mt-4 border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-3">
                        <img
                            src="/opponent-avatar.png"
                            alt="Opponent"
                            className="w-10 h-10 rounded-full bg-gray-700"
                        />
                        <div className="text-sm">
                            <div>Opponent's answer:</div>
                            <div className="font-mono">{opponentAnswer}</div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {opponentHistory.slice(-5).map((result, i) => (
                            result ?
                                <CheckCircleIcon key={i} className="text-green-500" /> :
                                <CancelIcon key={i} className="text-red-500" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
