"use client";
import { useState } from 'react';

export default function ChangePasskey({ onClose, onConfirm }: { onClose: () => void; onConfirm: (oldPasskey: string, newPasskey: string) => void }) {
    const [oldPasskey, setOldPasskey] = useState('');
    const [newPasskey, setNewPasskey] = useState('');
    const [error, setError] = useState('');

    const handlePasskeyInput = (value: string, setter: (value: string) => void) => {
        if (/^\d{0,6}$/.test(value)) {
            setter(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(oldPasskey) || !/^\d{6}$/.test(newPasskey)) {
            setError('Passkey must be exactly 6 digits');
            return;
        }
        onConfirm(oldPasskey, newPasskey);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-white mb-6">Change Passkey</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="text-gray-400 text-sm">Current Passkey</label>
                        <input
                            type="number"
                            value={oldPasskey}
                            onChange={(e) => handlePasskeyInput(e.target.value, setOldPasskey)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1 text-center text-2xl tracking-widest"
                            placeholder="000000"
                            required
                            maxLength={6}
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm">New Passkey</label>
                        <input
                            type="number"
                            value={newPasskey}
                            onChange={(e) => handlePasskeyInput(e.target.value, setNewPasskey)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1 text-center text-2xl tracking-widest"
                            placeholder="000000"
                            required
                            maxLength={6}
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
