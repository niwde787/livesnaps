import React from 'react';

interface SplashScreenProps {
    onProceed: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onProceed }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)] p-4 animate-fade-in">
            <div className="flex flex-col items-center max-w-md w-full text-center space-y-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-50 animate-pulse"></div>
                    <img 
                        src="https://raw.githubusercontent.com/niwde787/CJF/main/SNAPS_S.svg" 
                        alt="Live Snaps Logo" 
                        className="h-40 w-auto relative z-10 drop-shadow-2xl" 
                    />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white tracking-tighter">LIVE SNAPS</h1>
                    <p className="text-[var(--text-secondary)] text-xl font-medium tracking-wide uppercase">2026 Build v3</p>
                </div>
                
                <button 
                    onClick={onProceed}
                    className="flex items-center justify-center gap-3 px-10 py-3 bg-[var(--accent-primary)] text-white font-bold text-xl rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-primary)] shadow-lg"
                >
                    <span>PROCEED</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
            
            <div className="absolute bottom-8 text-[var(--text-secondary)] text-xs opacity-60">
                © 2026 Live Snaps. All rights reserved.
            </div>
        </div>
    );
};

export default SplashScreen;