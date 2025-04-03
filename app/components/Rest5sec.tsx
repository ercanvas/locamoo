"use client";
import { useEffect, useState, useRef } from 'react';

interface Rest5secProps {
    onComplete: () => void;
    winner: 'opponent' | 'you';
    correctAnswer: string;  // Add this prop
}

export default function Rest5sec({ onComplete, winner, correctAnswer }: Rest5secProps) {
    const [countdown, setCountdown] = useState(5);
    const timeEndCalled = useRef(false);
    const circumference = 2 * Math.PI * 20;
    const progress = (countdown / 5) * circumference;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1 && !timeEndCalled.current) {
                    clearInterval(timer);
                    timeEndCalled.current = true;
                    setTimeout(() => onComplete(), 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            timeEndCalled.current = false;
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm z-40 flex">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-black p-12 rounded-2xl text-center relative border border-gray-800">
                    {/* Countdown Circle */}
                    <div className="absolute top-6 right-6">
                        <svg className="w-16 h-16">
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

                    <h1 className="text-5xl font-extrabold text-white mb-6">
                        {winner === 'you' ? '🎉 You win!' : '🤖 Opponent wins!'}
                    </h1>

                    {/* Add Correct Answer Display */}
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <div className="text-lg text-green-400 mb-2">Correct Answer</div>
                        <div className="text-3xl font-mono font-bold text-green-500">{correctAnswer}</div>
                    </div>

                    <p className="text-2xl font-medium text-gray-400">Wait for next round...</p>
                </div>
            </div>

            {/* Ad Section */}
            <div className="w-96 bg-black/50 backdrop-blur p-8 flex flex-col gap-6">
                <div className="bg-gray-800 rounded-xl p-6 h-64 flex items-center justify-center">
                    <span className="text-gray-400">Advertisement</span>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 h-64 flex items-center justify-center">
                    <span className="text-gray-400">Advertisement</span>
                </div>
            </div>
        </div>
    );
}
