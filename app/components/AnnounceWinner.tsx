"use client";
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface AnnounceWinnerProps {
    winner: 'you' | 'opponent';
    points?: number;
    onNewMatch: () => void;
}

export default function AnnounceWinner({ winner, points = 2000, onNewMatch }: AnnounceWinnerProps) {
    useEffect(() => {
        if (winner === 'you') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [winner]);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-lg text-center max-w-md w-full mx-4">
                <div className="text-6xl mb-4">
                    {winner === 'you' ? '🎉' : '🤖'}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                    {winner === 'you' ? 'Congratulations!' : 'Better luck next time!'}
                </h2>
                {winner === 'you' && (
                    <div className="text-2xl font-mono text-green-400 mb-6">
                        +{points} points
                    </div>
                )}
                <button
                    onClick={onNewMatch}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors w-full"
                >
                    Next Match
                </button>
            </div>
        </div>
    );
}
