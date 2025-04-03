"use client";
import { useState } from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';

interface DeleteAccountConfirmationProps {
    onConfirm: (feedback?: string) => void;
    onCancel: () => void;
}

export default function DeleteAccountConfirmation({ onConfirm, onCancel }: DeleteAccountConfirmationProps) {
    const [confirmText, setConfirmText] = useState('');
    const [rating, setRating] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmText === 'DELETE') {
            onConfirm(feedback);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-red-500 mb-4">⚠️ Delete Account</h2>
                <p className="text-white mb-6">
                    This process cannot be reversed. All your data will be permanently deleted.
                </p>

                <div className="mb-6">
                    <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="text-2xl text-yellow-500"
                            >
                                {star <= rating ? <MdStar /> : <MdStarBorder />}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowFeedback(!showFeedback)}
                        className="text-blue-400 text-sm hover:underline w-full text-center"
                    >
                        Share your thoughts
                    </button>
                </div>

                {showFeedback && (
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us why you're leaving..."
                        className="w-full bg-gray-800 text-white p-3 rounded-lg mb-6 min-h-[100px]"
                    />
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm">
                            Type DELETE to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1"
                            placeholder="DELETE"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 ${confirmText === 'DELETE'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-gray-600 cursor-not-allowed'
                                } text-white py-3 rounded-lg`}
                            disabled={confirmText !== 'DELETE'}
                        >
                            Delete Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
