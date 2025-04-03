/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                fly: {
                    '0%, 100%': {
                        transform: 'translateX(-100%) translateY(0)',
                    },
                    '50%': {
                        transform: 'translateX(100%) translateY(-10px)',
                    },
                },
            },
            animation: {
                'fly': 'fly 4s ease-in-out infinite',
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
    ],
}
