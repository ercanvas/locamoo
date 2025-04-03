"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface GetStartedProps {
    username: string;
    email: string;
    onComplete: () => void;
}

export default function GetStarted({ username, email, onComplete }: GetStartedProps) {
    const [displayName, setDisplayName] = useState(username);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photo) {
            setError('Please add a profile picture');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('displayName', displayName);
            formData.append('photo', photo);

            const response = await fetch('/api/profile/setup', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to update profile');

            localStorage.removeItem('hasPasskey');
            onComplete();
            router.push('/auth');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Complete Your Profile</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4">
                            <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden border-2 border-blue-500">
                                {photoPreview ? (
                                    <Image
                                        src={photoPreview}
                                        alt="Profile"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Add Photo
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                +
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-gray-800 text-white p-3 rounded-lg mt-1 opacity-50"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                    >
                        Complete Setup
                    </button>
                </form>
            </div>
        </div>
    );
}
