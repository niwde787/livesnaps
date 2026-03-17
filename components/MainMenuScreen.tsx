import React, { useState } from 'react';
import { db, firestore } from '../firebase';
import { Icon } from './icons';

interface MainMenuScreenProps {
    setAuthPath: (path: 'coach' | 'viewer' | 'admin', initialMode: 'login' | 'signup', marketingConsent: boolean, email: string) => void;
    onShowLeaderboard: () => void;
}

const MenuCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    size?: 'large' | 'small';
}> = ({ title, description, icon, onClick, size = 'large' }) => {
    const baseClasses = "group w-full h-full text-left rounded-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50";
    const styleClasses = "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 focus:ring-white/50";

    if (size === 'large') {
        return (
            <button
                onClick={onClick}
                className={`${baseClasses} ${styleClasses} p-6`}
            >
                <div className="flex items-start gap-6">
                    <div className="text-[var(--accent-primary)] flex-shrink-0 mt-1">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-[var(--text-primary)]">{title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
                    </div>
                </div>
            </button>
        );
    }

    // Small size card
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${styleClasses} p-4`}
        >
            <div className="flex items-center gap-4">
                <div className="text-[var(--accent-primary)] flex-shrink-0">
                    {icon}
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
                </div>
            </div>
        </button>
    );
};


const CoachPortalIcon: React.FC = () => (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67 80.21" className="h-10 w-10" fill="currentColor">
        <g id="Layer_2-2" data-name="Layer 2"><g>
            <path d="M32.22,76.66c-.05-.08-1.24-.58-1.57-.81-3.08-2.12-3.02-6.87-.08-9.07v-.19s-9.51-17.43-9.51-17.43c-.31-.19-3.02.69-3.58.87-7.8,2.47-10.95,4.93-14.3,12.38-.87,1.92-2.31,5.05-2.88,6.98-.14.47-.4,1.25-.26,1.72.21.66,5.35,2.66,6.31,3.04,5.98,2.35,12.39,4.41,18.75,5.38,2.52.38,5.06.52,7.6.68.62-.31.04-.68-.05-1.09-.09-.45-.27-2.22-.43-2.46Z"></path>
            <path d="M27.88,54.91l5.63,10.52h.48s5.62-10.86,5.62-10.86c-.85.32-1.6.91-2.46,1.2-3.05,1.03-6.43.55-9.27-.86Z"></path>
            <path d="M62.62,59.94c-2.91-5.51-5.91-7.38-11.71-9.45-.63-.23-4.51-1.53-4.82-1.33l-9.04,17.23c-.03.3.36.34.61.58.66.63,1.41,1.51,1.69,2.39.55,1.71.33,7.04.26,9.09-.01.44-.2.83-.17,1.27,4.44-.26,8.8-1.38,13.04-2.67,4.18-1.27,9.05-3,12.99-4.85,1.32-.62,1.77-.7,1.41-2.34-.51-2.37-3.09-7.69-4.26-9.92Z"></path>
            <path d="M35.35,69.11c-2.58-1.55-5.17,1.82-3.22,3.9.47.52,1.56.71,2.1,1.13,1.27.98,1.29,3.74,1.49,3.86.17.1.6-.01.83.02v-7.22c0-.4-.82-1.47-1.2-1.69Z"></path>
            <path d="M14.46,17.02c-2.05.82-3.75,1.72-3.57,4.33.07,1.09,1.15,4.83,1.67,5.81.71,1.33,1.44,1.94,2.92,2.26.77.17,1.45.32,2.21-.09-1.47-4.04-2.56-8.32-2.55-12.65-.42-.18-.62.31-.68.34Z"></path>
            <path d="M33.58,43.2c3.44.04,6.89-3.7,8.57-6.39-.74.4-3.25.39-3.74.68-.1.06-.71,1.2-1.03,1.51-1.23,1.2-3.53,1.31-5.17,1.13-3.81-.41-5.15-5.37-1.94-7.55,1.69-1.15,5.28-1.06,6.87.24.61.51.84,1.17,1.36,1.55.99-.16,1.98-.37,2.94-.66.52-.15,2.96-1.01,3.22-1.28.26-.26,1.11-2.34,1.31-2.84,1.4-3.41,2.39-7.2,2.74-10.87-.11-.21-1.32-.95-1.62-1.11-5.77-3.09-20.15-3-26.12-.45-.35.15-2.48,1.26-2.57,1.42-.33.57.96,5.8,1.24,6.76,1.62,5.64,7,17.78,13.94,17.86Z"></path>
            <path d="M40.97,43.19l-2.27,1.55c-4.53,2.65-8.64,1.61-12.52-1.55-.29,2.72-.72,4.43.95,6.78,3.14,4.41,10.16,4.28,13.02-.38,1.38-2.25.98-3.9.82-6.4Z"></path>
            <path d="M44.71,13.36c1.33.36,2.56.95,3.9,1.28.16-4-1.86-8.36-4.83-10.98-6.91-6.09-19.07-4.42-23.54,3.8-1.17,2.15-1.67,4.93-1.87,7.35,4.47-2.23,9.27-2.47,14.18-2.55,4.1-.07,8.14,0,12.16,1.1Z"></path>
            <path d="M50.99,29.59c3.29-.24,4.08-3.43,4.71-6.08.32-1.35.78-2.53.26-3.9-.5-1.3-2.15-2.34-3.44-2.76-.15-.05-.28-.23-.51-.17-.11,3.29-.72,6.52-1.61,9.68-.14.49-1.09,2.86-.93,3.05.52.1.98.22,1.52.18Z"></path>
        </g></g>
    </svg>
);


const CreateTeamIcon = () => (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 69.33 59.02" className="h-10 w-10" fill="currentColor">
        <g id="Layer_2-2" data-name="Layer 2">
            <path d="M68.73,41.78c-.03-.88-.77-1.59-1.65-1.56l-10.49.2c-.56-3.37-1.07-6.96-1.49-10.44,1.87-.05,3.43-.15,3.76-.33.9-.5.32-9.45-1.01-10.28-.45-.28-1.77-.39-3.33-.41C50.75,7.93,40.32,0,28.01,0,12.54,0,0,12.54,0,28.01c0,6.58,1.07,17,4.87,21.78,2.75,3.46,9.94-.32,14.34.36,3.8.59,4.68,5.86,8.79,5.86,6.8,0,13.02-2.42,17.87-6.44.94-.78,3.96-2.63,4.66-5.78l3.27-.06c2.78,15.29,5.49,15.29,6.51,15.29h7.4c.44,0,.86-.18,1.17-.5s.47-.75,.45-1.19l-.61-15.54h.01ZM32.56,47.98c-1.74,0-3.16-1.41-3.16-3.16s1.42-3.16,3.16,3.16,3.16,1.41,3.16,3.16-1.41,3.16-3.16,3.16ZM50.46,40.53c-.9-4.2-3.86-9.94.29-10.49h1.09c.47,4,.94,7.47,1.42,10.45l-2.8.05h0ZM60.61,55.76c-1.04-1.1-2.3-5.97-3.45-12.1l8.39-.16.48,12.26h-5.42Z"></path>
        </g>
    </svg>
);

const FollowTeamIcon = () => (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 89.16 89.21" className="h-10 w-10" fill="currentColor"><g id="Layer_2-2" data-name="Layer 2"><g><path d="M36.73,9.44c.29-.25-3.79-5.56-4-6.38-.5-1.91,1.29-3.34,3.15-2.92,1.56.36,5.23,7.51,5.63,7.24,1.28-1.78,2.78-5.11,4.24-6.58,1.78-1.8,4.71-.4,4.18,2.36-.26,1.37-3.45,4.73-4.09,6.28h32.7c1.34,0,4.25,2.96,4.16,4.5l.06,28.31c2.92,0,5.85,2.98,6.15,5.81,2.67,24.61-16.3,43.56-40.9,40.9-3.29-.35-5.75-3.55-6.03-6.73-.49-5.45.4-11.57,2.05-16.74-1.83.54-3.61.02-5.34-.01-6.88-.13-15.37.07-22.09-1.16-1.21-.22-2.15-.46-2.58-1.74-.5-1.47-.8-5.48-.97-7.23-.89-9.31-1.26-23.46.75-32.52.73-3.32,3.29-2.82,6.2-3.14,13.66-1.47,31.5-1.62,45.11.23,1.71.23,3.18.32,3.7,2.22.81,2.95,1.71,11.46,1.62,14.53-.08,2.75-3.96,3.4-4.87.8l-1.24-12.77-17.88-1.15c-9.33-.15-18.61.39-27.9,1.17-1.71,11.5-1.52,23.3,0,34.82,9.17,1.01,18.39,1.27,27.63,1.17,6.24-11.57,18.57-18.91,31.82-18.69V15.03c0-.06-.35-.62-.46-.68l-71.44-.13-1.24.24v55.26s.32.34.34.34h31.67c.27,0,1.36.63,1.61.9,1.6,1.74.11,4.14-2.05,4.12H15.09c-.33,2.31-1.19,7.96-4.73,5.74-2.02-1.27-.34-3.94-.29-5.75h-5.35c-1.39,0-4.03-2.15-4.39-3.58C-.33,52.35.24,33.07.04,13.88c.11-1.65,2.64-4.44,4.22-4.44h32.47ZM84.13,54.1v-5.35c0-.44-1.07-1.71-1.48-1.71h-5.58c1.35,3.06,4.04,5.69,7.06,7.06ZM71.8,47.51c-12.24,2.02-22.31,12.11-24.34,24.34,5.32,2.13,9.61,6.5,11.82,11.77,12.16-2.02,22.27-12.13,24.3-24.3-5.28-2.21-9.64-6.48-11.77-11.82ZM54.05,84.18c-1.38-3.01-4.01-5.73-7.06-7.06v5.58c0,.42,1.27,1.48,1.71,1.48h5.35Z"></path><path d="M44.66,29.33c1.77-.14,4.45.04,4.3,2.52-.17,2.79-3.26,2.21-4.99,2.48-6.34,1.01-11.88,5.92-13.28,12.24-.47,2.14.09,6.07-2.79,6.33-3.57.33-2.5-5.26-2.04-7.29,1.95-8.69,9.9-15.58,18.8-16.29Z"></path><path d="M34.07,52.2c-1.77-1.77.06-6.67,1.19-8.56,2.1-3.48,7.17-6.82,11.35-6.38,2.89.3,3.13,4.4.2,4.95-3.78.71-6.76,1.23-8.14,5.53-.4,1.25-.16,2.54-.56,3.54-.64,1.63-2.75,2.22-4.04.93Z"></path><circle cx="45.72" cy="49.67" r="3.09"></circle><path d="M74.48,63.59c-.7.74-1.67.89-2.62.61-.58-.17-.71-.72-1.3-.32-.19.13-1.42,1.4-1.45,1.55-.15.61,1.54,1.99-.1,3.64s-3.03-.05-3.64.1c-.14.03-1.58,1.43-1.66,1.58-.22.45,1.35,1.82.1,3.49-1.44,1.93-3.06.29-3.69.41-.26.05-1.09.96-1.58,1.15-1.96.75-3.93-1.21-3.18-3.18.18-.47,1.13-1.37,1.16-1.58.06-.35-1.29-1.41-.4-3.13.3-.57,1.34-1.18,1.96-1.24.92-.08,1.87.83,2,.83.14,0,1.92-1.78,1.85-2.02-.08-.29-.49-.55-.58-1.02-.38-1.98.82-3.34,2.85-3.08.68.09.87.5,1.23.61.24.07,2.02-1.71,2.02-1.85,0-.1-.84-1.08-.84-1.82,0-.64.57-1.7,1.13-2.03,1.78-1.06,2.89.37,3.25.3.28-.05.79-.88,1.2-1.09,2.31-1.19,4.57,1.25,3.24,3.47-.2.33-1.07,1.04-1.07,1.17,0,.54,1.73,1.74.11,3.46Z"></path></g></g></svg>
);

const AdminPortalIcon = () => (
    <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.38 126.64" className="h-10 w-10" fill="currentColor">
      <g id="Layer_1-2" data-name="Layer 1">
        <g>
          <path fill="none" d="M24.55,16c-1.6,2.73-1.6,6.12,0,8.86,1.6,2.73,4.56,4.39,7.72,4.33,4.77-.09,8.6-3.98,8.6-8.76,0-4.77-3.82-8.67-8.6-8.76-3.17-.06-6.12,1.6-7.72,4.33Z"/>
          <path d="M32.27,0C-.03.02-12.22,41.58,15.08,59.46c.63.42,2.26,1.05,2.48,1.65v51.38s.21,1.17.21,1.17l12.71,12.71c.69.29.99.27,1.66.28.58,0,.94,0,1.52-.14l12.84-12.84c.37-2.08.6-5.15.35-7.25-.34-2.92-2.94-3.29-4.63-5.32,1.29-1.65,4.74-4.53,4.59-6.7-.15-2.05-3.28-4.49-4.39-6.21,1.03-2.06,4.51-2.7,4.43-5.39,0-.26-.29-1.39-.41-1.52l-4.35-4.35,4.35-4.35c.92-.92.12-9.94.46-11.72,8.58-4.51,14.77-12.5,16.78-21.97C67.89,18.95,52.74-.01,32.27,0ZM40.87,20.43c0,4.77-3.82,8.67-8.6,8.76-3.17-.06-6.12,1.6-7.72-4.33-1.6-2.73-1.6-6.12,0-8.86,1.6-2.73,4.56-4.39,7.72-4.33,4.77.09,8.6,3.99,8.6,8.76Z"/>
        </g>
      </g>
    </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ setAuthPath, onShowLeaderboard }) => {
    const [marketingConsent, setMarketingConsent] = useState(true);
    const [subscriptionEmail, setSubscriptionEmail] = useState('');
    const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'subscribing' | 'success' | 'error'>('idle');
    const [subscriptionMessage, setSubscriptionMessage] = useState('');

    const handlePathSelection = (path: 'coach' | 'viewer', mode: 'login' | 'signup') => {
        setAuthPath(path, mode, false, '');
    };
    
    const handleSubscriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subscriptionEmail || !subscriptionEmail.includes('@')) {
            setSubscriptionStatus('error');
            setSubscriptionMessage('Please enter a valid email address.');
            const emailInput = document.getElementById('subscription-email-input');
            if (emailInput) {
                emailInput.classList.add('animate-shake');
                setTimeout(() => emailInput.classList.remove('animate-shake'), 500);
            }
            return;
        }
        setSubscriptionStatus('subscribing');
        setSubscriptionMessage('');

        try {
            await db.collection('marketing_subscribers').add({
                email: subscriptionEmail,
                consent: marketingConsent,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
    
            setSubscriptionStatus('success');
            setSubscriptionMessage(`Thank you for subscribing! We'll keep ${subscriptionEmail} updated.`);
        } catch (error) {
            console.error("Subscription error:", error);
            setSubscriptionStatus('error');
            setSubscriptionMessage('Could not subscribe. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen main-menu-background flex flex-col justify-center items-center p-4 sm:p-6">
            <style>{`
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
            <div className="relative z-10 w-full max-w-5xl text-center">
                <img src="https://raw.githubusercontent.com/niwde787/CJF/main/SNAPS_S.svg" alt="Snaps Logo" className="h-20 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to Live Snaps</h1>
                <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
                    The all-in-one digital toolkit for modern football coaching. Track plays, analyze players, and generate AI-powered insights.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MenuCard
                        title="Coach Portal"
                        description="Manage teams, track player performance, build depth charts, and access real-time game insights—all in one place."
                        icon={<CoachPortalIcon />}
                        onClick={() => handlePathSelection('coach', 'login')}
                        size="large"
                    />
                    <MenuCard
                        title="Create a Team"
                        description="For new coaches setting up their team for the first time."
                        icon={<CreateTeamIcon />}
                        onClick={() => handlePathSelection('coach', 'signup')}
                        size="large"
                    />
                    <MenuCard
                        title="Follow a Team"
                        description="Track every snap with real-time recaps showing drives, downs, and key plays—passes, runs, tackles, and touchdowns—all in one clear visual timeline."
                        icon={<FollowTeamIcon />}
                        onClick={() => handlePathSelection('viewer', 'login')}
                        size="large"
                    />
                    <MenuCard
                        title="Admin Portal"
                        description="For system administrators to manage users and data."
                        icon={<AdminPortalIcon />}
                        onClick={() => setAuthPath('admin', 'login', false, 'admin')}
                        size="large"
                    />
                    <MenuCard
                        title="Global Leaderboards"
                        description="View top performing players and teams across the entire league."
                        icon={<Icon name="global-leaderboard" className="w-10 h-10" />}
                        onClick={onShowLeaderboard}
                        size="large"
                    />
                </div>
                
                <div className="mt-12">
                    <h2 className="text-lg font-semibold text-white">Follow us to be updated in the latest news from LiveSnaps.</h2>
                    {subscriptionStatus === 'success' ? (
                        <p className="mt-4 text-green-300 bg-green-500/20 p-3 rounded-lg max-w-lg mx-auto">{subscriptionMessage}</p>
                    ) : (
                        <form onSubmit={handleSubscriptionSubmit} className="mt-4 max-w-lg mx-auto">
                            <div className="flex items-center gap-2">
                                <input
                                    id="subscription-email-input"
                                    type="email"
                                    value={subscriptionEmail}
                                    onChange={e => setSubscriptionEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="flex-grow bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] focus:bg-white/5 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={subscriptionStatus === 'subscribing'}
                                    className="flex-shrink-0 px-6 py-2 bg-[var(--accent-primary)] text-white font-bold text-base rounded-lg hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-[var(--accent-primary)] disabled:bg-gray-500 disabled:cursor-wait"
                                >
                                    {subscriptionStatus === 'subscribing' ? <SpinnerIcon className="w-5 h-5" /> : 'Subscribe'}
                                </button>
                            </div>
                            {subscriptionStatus === 'error' && (
                                <p className="mt-2 text-sm text-red-400 text-left">{subscriptionMessage}</p>
                            )}
                            <div className="mt-4 text-center">
                                <label className="flex items-center justify-center gap-2 text-sm text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={marketingConsent}
                                        onChange={(e) => setMarketingConsent(e.target.checked)}
                                        className="h-4 w-4 rounded bg-white/10 border-white/20 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                                    />
                                    I would like to receive news, feature updates, and special offers.
                                </label>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainMenuScreen;