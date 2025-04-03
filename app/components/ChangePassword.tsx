"use client";
import { useState } from 'react';

export default function ChangePassword({ onClose, onConfirm }: { onClose: () => void; onConfirm: (oldPassword: string, newPassword: string) => void }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) {
            setError('Please fill in all fields');
            return;
        }
        onConfirm(oldPassword, newPassword);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="text-gray-400 text-sm">Current Password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1"
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
