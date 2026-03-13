import React, { useState } from 'react';
import { signOut } from '../firebase';
import AdminUserManagement from './AdminUserManagement';
import LeaderboardView from './LeaderboardView';
import { LogoutIcon, SpinnerIcon } from './icons';

interface AdminContainerProps {
    user: any;
}

const AdminContainer: React.FC<AdminContainerProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'leaderboard'>('users');
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to return to the Main Menu?')) {
            setIsSigningOut(true);
            try {
                await signOut();
                // No reload needed; App.tsx handles the state change
            } catch (error) {
                console.error("Sign out error:", error);
                setIsSigningOut(false);
            }
        }
    };

    const NavButton: React.FC<{ tab: string; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
            <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <img src="https://raw.githubusercontent.com/niwde787/CJF/main/SNAPS_S.svg" alt="Snaps Logo" className="h-10" />
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Portal</h1>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-[var(--text-secondary)] hidden sm:block">Logged in as {user.email}</p>
                    <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--border-primary)] hover:text-white transition-colors disabled:opacity-50"
                    >
                        {isSigningOut ? <SpinnerIcon className="w-4 h-4" /> : <LogoutIcon className="w-4 h-4" />}
                        Main Menu
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex mb-6 border-b border-[var(--border-primary)] pb-1">
                    <NavButton tab="users" label="User Management" />
                    <NavButton tab="leaderboard" label="Global Leaderboard" />
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg shadow-xl border border-[var(--border-primary)] p-6">
                    {activeTab === 'users' && <AdminUserManagement />}
                    {activeTab === 'leaderboard' && <LeaderboardView />}
                </div>
            </div>
        </div>
    );
};

export default AdminContainer;