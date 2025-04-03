"use client";
import { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';

interface GameDetails {
    rounds: Array<{
        question: string;
        playerAnswer: string;
        opponentAnswer: string;
        correctAnswer: string;
        winner: 'player' | 'opponent';
    }>;
}

interface GameDetailsProps {
    gameId: string;
    username: string;
    onClose: () => void;
}

export default function GameDetails({ gameId, username, onClose }: GameDetailsProps) {
    const [details, setDetails] = useState<GameDetails | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`/api/player/${username}/games/${gameId}`);
                const data = await response.json();
                setDetails(data);
            } catch (error) {
                console.error('Failed to fetch game details:', error);
            }
        };

        fetchDetails();
    }, [gameId, username]);

    if (!details) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl max-w-2xl w-full mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <MdClose className="text-2xl" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Match Details</h2>

                <div className="space-y-6">
                    {details.rounds.map((round, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4">
                            <div className="text-gray-400 mb-2">Round {index + 1}</div>
                            <div className="text-white mb-4">{round.question}</div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-400 mb-1">Your Answer</div>
                                    <div className="text-white">{round.playerAnswer}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-1">Opponent's Answer</div>
                                    <div className="text-white">{round.opponentAnswer}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-1">Correct Answer</div>
                                    <div className="text-green-500">{round.correctAnswer}</div>
                                </div>
                            </div>

                            <div className={`mt-4 text-sm ${round.winner === 'player' ? 'text-green-500' : 'text-red-500'}`}>
                                Round Winner: {round.winner === 'player' ? 'You' : 'Opponent'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
