"use client";
import Auth from '@/app/components/Auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
    const router = useRouter();

    useEffect(() => {
        // Clear any stale auth data
        localStorage.removeItem('username');
    }, []);

    const handleAuthSuccess = (user: { username: string }) => {
        localStorage.setItem('username', user.username);
        router.replace('/');
    };

    return (
        <div className="min-h-screen bg-black">
            <Auth onAuthSuccess={handleAuthSuccess} />
        </div>
    );
}
