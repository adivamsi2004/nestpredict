import React from 'react';

const Logo = ({ className = "h-8 w-auto" }: { className?: string }) => (
    <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Leaves */}
        <path d="M37 40 C17 25 10 35 15 50 C24 62 43 54 37 40 Z" fill="#BAF7B0" />
        <path d="M52 35 C42 12 25 15 37 34 C43 45 58 43 52 35 Z" fill="#BAF7B0" />
        <path d="M165 67 C185 52 192 62 187 77 C178 89 159 81 165 67 Z" fill="#BAF7B0" />
        <path d="M152 58 C162 35 179 38 167 57 C161 68 146 66 152 58 Z" fill="#BAF7B0" />

        {/* Roof */}
        <path d="M15 80 L65 30 L100 65 L140 25 L185 70" stroke="#1A3B5C" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />

        {/* Left Windows */}
        <rect x="52" y="55" width="10" height="10" fill="#1A3B5C" rx="1" />
        <rect x="66" y="55" width="10" height="10" fill="#1A3B5C" rx="1" />
        <rect x="52" y="69" width="10" height="10" fill="#1A3B5C" rx="1" />
        <rect x="66" y="69" width="10" height="10" fill="#1A3B5C" rx="1" />

        {/* Right Windows */}
        <rect x="124" y="52" width="10" height="10" fill="#1A3B5C" rx="1" />
        <rect x="138" y="52" width="10" height="10" fill="#1A3B5C" rx="1" />
        <rect x="124" y="66" width="10" height="10" fill="#1A3B5C" rx="1" />
        <rect x="138" y="66" width="10" height="10" fill="#1A3B5C" rx="1" />
    </svg>
);

export default Logo;
