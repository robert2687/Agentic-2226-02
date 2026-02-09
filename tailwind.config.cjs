module.exports = {
    content: [
        './index.html',
        './index.tsx',
        './App.tsx',
        './components/**/*.{ts,tsx}',
        './hooks/**/*.{ts,tsx}',
        './lib/**/*.{ts,tsx}',
        './services/**/*.{ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f1419',
                surface: '#1a1f2e',
                border: '#2a3441',
                primary: '#3b82f6',
                accent: '#f59e0b'
            },
            animation: {
                'zoom-in': 'zoom-in 0.3s ease-out',
            },
            keyframes: {
                'zoom-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        }
    },
    plugins: []
};
