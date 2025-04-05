"use client";
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    showText?: boolean;
    className?: string;
}

export default function Logo({ showText = true, className = '' }: LogoProps) {
    return (
        <Link href="/" className={`logo-container ${className}`}>
            <Image
                src="/logo.png"
                alt="Locamoo"
                width={120}
                height={40}
                priority
                className="transition-transform hover:scale-105"
            />
            {showText && (
                <span className="logo-text font-bold text-2xl text-white transition-colors">
                    Locamoo
                </span>
            )}
        </Link>
    );
}
