import React, { useMemo } from 'react';
import { Player, QuarterSummaryData, PlayerStats, FormationStats } from '../types';
import { getLastName, formatTime } from '../utils';
import Scoreboard from './Scoreboard';
import { useGameState } from '../contexts/GameStateContext';
import { SpinnerIcon, CalendarIcon, Icon } from './icons';
import { DEFAULT_PLAYER_IMAGE } from '../constants';

const getParticipationGroup = (percentage: number) => {
    if (percentage >= 100) return { borderColor: 'border-emerald-400', bgColor: 'bg-emerald-500/10', progressColor: 'bg-emerald-400' };
    if (percentage >= 75) return { borderColor: 'border-green-400', bgColor: 'bg-green-500/10', progressColor: 'bg-green-400' };
    if (percentage >= 50) return { borderColor: 'border-yellow-400', bgColor: 'bg-yellow-500/10', progressColor: 'bg-yellow-400' };
    if (percentage >= 25) return { borderColor: 'border-orange-400', bgColor: 'bg-orange-500/10', progressColor: 'bg-orange-400' };
    return { borderColor: 'border-red-400', bgColor: 'bg-red-500/10', progressColor: 'bg-red-400' };
};

export const SnapsRankingCard: React.FC<{ players: Player[]; totalPlays: number; }> = ({ players, totalPlays }) => {
    const rankedPlayers = useMemo(() => {
        return [...players]
            .map(p => {
                const playerTotalPlays = p.offensePlayCount + p.defensePlayCount + p.specialTeamsPlayCount;
                const participation = totalPlays > 0 ? Math.round((playerTotalPlays / totalPlays) * 100) : 0;
                return { ...p, totalPlays: playerTotalPlays, participation };
            })
            .filter(p => p.totalPlays > 0)
            .sort((a, b) => b.totalPlays - a.totalPlays);
    }, [players, totalPlays]);

    return (
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 h-[248px] flex flex-col shadow-sm">
            <h3 className="text-lg font-bold text-[var(--logo-color)] border-b border-[var(--border-primary)] pb-2 mb-3 flex-shrink-0">Snaps Ranking</h3>
            {rankedPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-grow text-center text-[var(--text-secondary)]">
                    <Icon name="trophy" className="h-12 w-12 mb-2" />
                    <p className="text-sm">No plays run yet to rank.</p>
                </div>
            ) : (
                <ul className="space-y-2 flex-grow overflow-y-auto -mr-2 pr-2 no-scrollbar">
                    {rankedPlayers.map((player, index) => {
                        const group = getParticipationGroup(player.participation);
                        return (
                             <li key={player.id} className={`flex items-center gap-3 p-2 rounded-md border-l-4 ${group.borderColor} ${group.bgColor}`}>
                                <span className="font-bold text-lg text-[var(--text-secondary)] w-6 text-center">{index + 1}</span>
                                <img className="h-10 w-10 rounded-full object-cover" src={player.imageUrl || DEFAULT_PLAYER_IMAGE} alt={`Photo of ${player.name}`} />
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-semibold truncate text-sm text-[var(--text-primary)]">#{player.jerseyNumber} {getLastName(player.name)}</p>
                                        <span className="font-mono font-bold text-base text-[var(--text-primary)]">{player.totalPlays}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-full bg-black/20 rounded-full h-2">
                                            <div className={`${group.progressColor} h-2 rounded-full`} style={{ width: `${player.participation}%` }}></div>
                                        </div>
                                        <span className="font-mono text-xs w-10 text-right text-[var(--text-secondary)]">{player.participation}%</span>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    );
};

export const FormationEfficiencyCard: React.FC<{ formationStats: Record<string, FormationStats> }> = ({ formationStats }) => {
    const sortedFormations = (Object.entries(formationStats) as [string, FormationStats][]).sort(([, a], [, b]) => b.playCount - a.playCount);
    return (
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 h-[248px] flex flex-col shadow-sm">
            <h3 className="text-lg font-bold text-[var(--logo-color)] border-b border-[var(--border-primary)] pb-2 mb-3 flex-shrink-0">Formation Efficiency</h3>
            {sortedFormations.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-grow text-center text-[var(--text-secondary)]">
                    <Icon name="formation" className="h-12 w-12 mb-2" />
                    <p className="text-sm">No plays run yet to analyze efficiency.</p>
                </div>
            ) : (
                <ul className="space-y-2 flex-grow overflow-y-auto -mr-2 pr-2 no-scrollbar">
                    {sortedFormations.map(([name, stats]) => {
                        const isKickingFormation = name.toLowerCase().includes('pat') || name.toLowerCase().includes('p.a.t') || name.toLowerCase().includes('field goal');
                        
                        if (isKickingFormation && stats.attempts && stats.attempts > 0) {
                            const successRate = Math.round(((stats.makes || 0) / stats.attempts) * 100);
                            return (
                                <li key={name} className="bg-[var(--bg-secondary)] p-2 rounded-md">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-[var(--text-primary)] truncate pr-2">{name}</span>
                                        <div className="text-right flex items-center gap-2 flex-shrink-0">
                                            <span className={`font-mono text-sm font-bold text-green-400`}>+{stats.pointsScored} pts</span>
                                            <span className="text-xs text-[var(--text-secondary)] font-mono">({stats.attempts} attempts)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 mr-2"><div className="bg-[var(--accent-primary)] h-1.5 rounded-full" style={{ width: `${successRate}%` }}></div></div>
                                        <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">{`${stats.makes || 0}/${stats.attempts} (${successRate}%)`}</span>
                                    </div>
                                </li>
                            );
                        }

                        const successRate = stats.playCount > 0 ? Math.round((stats.positivePlays / stats.playCount) * 100) : 0;
                        const yardsColor = stats.totalYards > 0 ? 'text-green-400' : stats.totalYards < 0 ? 'text-red-400' : 'text-gray-300';
                        return (
                            <li key={name} className="bg-[var(--bg-secondary)] p-2 rounded-md">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-[var(--text-primary)] truncate pr-2">{name}</span>
                                    <div className="text-right flex items-center gap-2 flex-shrink-0">
                                        <span className={`font-mono text-sm font-bold ${yardsColor}`}>{stats.totalYards > 0 ? `+${stats.totalYards}` : stats.totalYards} yds</span>
                                        <span className="text-xs text-[var(--text-secondary)] font-mono">({stats.playCount} plays)</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 mr-2"><div className="bg-[var(--accent-primary)] h-1.5 rounded-full" style={{ width: `${successRate}%` }}></div></div>
                                    <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">{successRate}%</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

const TeamStatRow: React.FC<{ label: string; ourValue: string | number; oppValue: string | number; invertColors?: boolean }> = ({ label, ourValue, oppValue, invertColors = false }) => {
    const ourValNum = typeof ourValue === 'number' ? ourValue : parseFloat(ourValue as string) || 0;
    const oppValNum = typeof oppValue === 'number' ? oppValue : parseFloat(oppValue as string) || 0;
    const total = ourValNum + oppValNum;
    
    const ourWidth = total > 0 ? (ourValNum / total) * 100 : (ourValNum > 0 ? 100 : (oppValNum > 0 ? 0 : 50));
    
    const isOurBetter = invertColors ? ourValNum < oppValNum : ourValNum > oppValNum;
    const isOppBetter = invertColors ? ourValNum > oppValNum : ourValNum < oppValNum;
    const isEqual = ourValNum === oppValNum;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className={`font-mono font-bold text-base ${isOurBetter ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{ourValue}</span>
                <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                <span className={`font-mono font-bold text-base ${isOppBetter ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{oppValue}</span>
            </div>
            <div className="flex h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div className={`transition-all duration-500 ${isOurBetter && !isEqual ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-primary)]'}`} style={{ width: `${ourWidth}%` }}></div>
                <div className={`transition-all duration-500 ${isOppBetter && !isEqual ? 'bg-[var(--accent-special)]' : 'bg-[var(--border-primary)]'}`} style={{ width: `${100 - ourWidth}%` }}></div>
            </div>
        </div>
    );
};

export const TeamStatsComparisonCard: React.FC<{ ourStats: any; opponentStats: any; opponentName: string; teamName: string; }> = ({ ourStats, opponentStats, opponentName, teamName }) => {
    const formatEfficiency = (conversions: number, attempts: number) => {
        const conv = conversions || 0;
        const att = attempts || 0;
        if (att === 0) return '0/0 (0%)';
        const percent = Math.round((conv / att) * 100);
        return `${conv}/${att} (${percent}%)`;
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 h-[248px] shadow-sm flex flex-col">
            <div className="flex justify-between items-baseline mb-3 border-b border-[var(--border-primary)] pb-2 flex-shrink-0">
                <h3 className="text-lg font-bold text-[var(--logo-color)]">Team Comparison</h3>
                <div className="flex gap-4 text-xs font-bold text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"></span>
                        <span className="text-[var(--text-primary)] truncate max-w-[80px]">{teamName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-special)]"></span>
                        <span className="truncate max-w-[80px]">{opponentName}</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3 flex-grow overflow-y-auto no-scrollbar">
                <TeamStatRow label="First Downs" ourValue={ourStats.firstDowns} oppValue={opponentStats.firstDowns} />
                <TeamStatRow label="Total Yards" ourValue={ourStats.totalYards} oppValue={opponentStats.totalYards} />
                <TeamStatRow label="Turnovers" ourValue={ourStats.turnovers} oppValue={opponentStats.turnovers} invertColors={true} />
                <TeamStatRow label="3rd Down" ourValue={formatEfficiency(ourStats.thirdDownConversions, ourStats.thirdDownAttempts)} oppValue={formatEfficiency(opponentStats.thirdDownConversions, opponentStats.thirdDownAttempts)} />
                <TeamStatRow label="4th Down" ourValue={formatEfficiency(ourStats.fourthDownConversions, ourStats.fourthDownAttempts)} oppValue={formatEfficiency(opponentStats.fourthDownConversions, opponentStats.fourthDownAttempts)} />
                <TeamStatRow label="PAT" ourValue={formatEfficiency(ourStats.patConversions, ourStats.patAttempts)} oppValue={formatEfficiency(opponentStats.patConversions, opponentStats.patAttempts)} />
            </div>
        </div>
    );
};

const StatLeaderItem: React.FC<{ player: Player; value: number | string; subLabel?: string; rank: number }> = ({ player, value, subLabel, rank }) => (
    <li className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-md">
        <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-[var(--text-secondary)] text-sm w-4">{rank}</span>
            <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">#{player.jerseyNumber} {getLastName(player.name)}</p>
                {subLabel && <p className="text-[10px] text-[var(--text-secondary)]">{subLabel}</p>}
            </div>
        </div>
        <div className="text-right">
            <p className="font-mono font-bold text-base text-[var(--accent-secondary)]">{value}</p>
        </div>
    </li>
);

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 h-[248px] flex flex-col shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-2 mb-3 flex-shrink-0">{title}</h3>
        <div className="flex-grow overflow-y-auto -mr-2 pr-2 no-scrollbar">
            {children}
        </div>
    </div>
);

export const PassingStatsCard: React.FC<{ topPerformers: QuarterSummaryData['topPerformers']; playerMap: Map<string, Player> }> = ({ topPerformers, playerMap }) => {
    const passers = (Object.entries(topPerformers.passers) as [string, PlayerStats][]).sort(([, a], [, b]) => b.yards - a.yards);
    return (
        <StatCard title="Passing Game">
            {passers.length > 0 ? (
                <ul className="space-y-2">
                    {passers.slice(0, 5).map(([id, stats], index) => {
                        const player = playerMap.get(id);
                        if (!player) return null;
                        return <StatLeaderItem key={id} player={player} value={`${stats.yards} yds`} subLabel={`${stats.count} completions`} rank={index + 1} />;
                    })}
                </ul>
            ) : <div className="h-full flex items-center justify-center"><p className="text-sm text-[var(--text-secondary)]">No passing stats recorded.</p></div>}
        </StatCard>
    );
};

export const RushingStatsCard: React.FC<{ topPerformers: QuarterSummaryData['topPerformers']; playerMap: Map<string, Player> }> = ({ topPerformers, playerMap }) => {
    const runners = (Object.entries(topPerformers.runners) as [string, PlayerStats][]).sort(([, a], [, b]) => b.yards - a.yards);
    return (
        <StatCard title="Rushing Game">
            {runners.length > 0 ? (
                <ul className="space-y-2">
                    {runners.slice(0, 5).map(([id, stats], index) => {
                        const player = playerMap.get(id);
                        if (!player) return null;
                        return <StatLeaderItem key={id} player={player} value={`${stats.yards} yds`} subLabel={`${stats.count} carries`} rank={index + 1} />;
                    })}
                </ul>
            ) : <div className="h-full flex items-center justify-center"><p className="text-sm text-[var(--text-secondary)]">No rushing stats recorded.</p></div>}
        </StatCard>
    );
};

export const ReceivingStatsCard: React.FC<{ topPerformers: QuarterSummaryData['topPerformers']; playerMap: Map<string, Player> }> = ({ topPerformers, playerMap }) => {
    const receivers = (Object.entries(topPerformers.receivers) as [string, PlayerStats][]).sort(([, a], [, b]) => b.yards - a.yards);
    return (
        <StatCard title="Receiving Game">
            {receivers.length > 0 ? (
                <ul className="space-y-2">
                    {receivers.slice(0, 5).map(([id, stats], index) => {
                        const player = playerMap.get(id);
                        if (!player) return null;
                        return <StatLeaderItem key={id} player={player} value={`${stats.yards} yds`} subLabel={`${stats.count} catches`} rank={index + 1} />;
                    })}
                </ul>
            ) : <div className="h-full flex items-center justify-center"><p className="text-sm text-[var(--text-secondary)]">No receiving stats recorded.</p></div>}
        </StatCard>
    );
};

export const DefensiveStatsCard: React.FC<{ topPerformers: QuarterSummaryData['topPerformers']; playerMap: Map<string, Player> }> = ({ topPerformers, playerMap }) => {
    const tacklers = (Object.entries(topPerformers.tacklers) as [string, PlayerStats][]).sort(([, a], [, b]) => b.count - a.count);
    return (
        <StatCard title="Defensive Game">
            {tacklers.length > 0 ? (
                <ul className="space-y-2">
                    {tacklers.slice(0, 5).map(([id, stats], index) => {
                        const player = playerMap.get(id);
                        if (!player) return null;
                        return <StatLeaderItem key={id} player={player} value={`${stats.count} total`} subLabel="Tackles" rank={index + 1} />;
                    })}
                </ul>
            ) : <div className="h-full flex items-center justify-center"><p className="text-sm text-[var(--text-secondary)]">No tackles recorded.</p></div>}
        </StatCard>
    );
};

const WeekDashboard: React.FC = () => {
    const {
        players,
        playHistory,
        gameSummaryData,
        isWeekLoading,
        ourStats,
        opponentStats,
        opponentNames,
        selectedWeek,
        teamName,
        setIsWeekSelectorModalOpen
    } = useGameState();

    const totalPlays = playHistory.length;
    const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

    const displaySummaryData = useMemo(() => {
        return gameSummaryData || {
            formationStats: {},
            topPerformers: { passers: {}, receivers: {}, runners: {}, tacklers: {}, interceptors: {}, kickers: {}, returners: {} }
        };
    }, [gameSummaryData]);

    if (isWeekLoading) {
        return (
            <div className="flex justify-center items-center h-full p-16">
                <SpinnerIcon className="w-12 h-12 text-[var(--accent-primary)]" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-4">
            <Scoreboard />

            {/* Top Row: 3 items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SnapsRankingCard players={players} totalPlays={totalPlays} />
                <FormationEfficiencyCard formationStats={displaySummaryData.formationStats} />
                <TeamStatsComparisonCard 
                    ourStats={ourStats} 
                    opponentStats={opponentStats} 
                    opponentName={opponentNames[selectedWeek]} 
                    teamName={teamName} 
                />
            </div>

            {/* Bottom Row: 4 items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PassingStatsCard topPerformers={displaySummaryData.topPerformers} playerMap={playerMap} />
                <RushingStatsCard topPerformers={displaySummaryData.topPerformers} playerMap={playerMap} />
                <ReceivingStatsCard topPerformers={displaySummaryData.topPerformers} playerMap={playerMap} />
                <DefensiveStatsCard topPerformers={displaySummaryData.topPerformers} playerMap={playerMap} />
            </div>

            <div className="w-full">
                <button 
                    onClick={() => setIsWeekSelectorModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400 transition-colors"
                >
                    <CalendarIcon className="w-5 h-5" />
                    Change Week or View Schedule
                </button>
            </div>
        </div>
    );
};

export default WeekDashboard;