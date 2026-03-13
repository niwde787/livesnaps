import React from 'react';
import LeaderboardView from './LeaderboardView';
import { ChevronLeftIcon } from './icons';

interface PublicLeaderboardContainerProps {
  onBack: () => void;
}

const PublicLeaderboardContainer: React.FC<PublicLeaderboardContainerProps> = ({ onBack }) => {
  return (
    <div className="font-sans min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Simplified Header */}
      <div className="fixed top-0 left-0 right-0 z-40 h-14 glass-effect border-b border-[var(--border-primary)] px-4 flex items-center">
        <div className="flex-1">
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-[var(--text-secondary)] hover:text-white p-2 -ml-2 rounded-lg">
            <ChevronLeftIcon className="w-6 h-6" />
            <span>Back</span>
          </button>
        </div>
        <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-[var(--text-primary)]">Global Leaderboards</h1>
        </div>
        <div className="flex-1"></div> {/* Spacer */}
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 pt-20">
        <LeaderboardView />
      </div>
    </div>
  );
};

export default PublicLeaderboardContainer;
