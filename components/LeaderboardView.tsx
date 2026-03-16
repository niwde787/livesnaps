import React, { useState, useEffect, useMemo } from 'react';
import { getAllTeamData } from '../firebase';
import { Icon, SpinnerIcon } from './icons';
import { Play, Player, PlayResult, AgeDivision, AgeDivisionLabels } from '../types';

declare const window: any;

interface GlobalPlayerStat {
    playerId: string;
    playerName: string;
    teamName: string;
    teamId: string;
    position: string;
    totalSnaps: number;

    // Passing
    passAttempts: number;
    passCompletions: number;
    passingYards: number;
    passingTds: number;
    interceptionsThrown: number;

    // Rushing
    rushAttempts: number;
    rushingYards: number;
    rushingTds: number;

    // Receiving
    receptions: number;
    receivingYards: number;
    receivingTds: number;

    // Defense
    tackles: number;
    sacks: number;
    interceptions: number;

    // Kicking
    fieldGoalsMade: number;
    fieldGoalAttempts: number;

    // Punting
    punts: number;
    puntYards: number;

    // Returns
    kickReturns: number;
    kickReturnYards: number;
    kickReturnTds: number;
    puntReturns: number;
    puntReturnYards: number;
    puntReturnTds: number;
}


interface TeamStat {
    teamId: string;
    teamName: string;
    gamesPlayed: number;
    offensiveYards: number;
    defensiveYardsAllowed: number;
    turnoversCommitted: number;
    turnoversForced: number;
    penalties: number;
    penaltyYards: number;
    ageDivision: AgeDivision | null;
}

const STAT_CATEGORIES = ['PASSING', 'RUSHING', 'RECEIVING', 'DEFENSE', 'RETURNS', 'KICKING & PUNTING'];

const STATS_BY_CATEGORY: { [key: string]: { key: keyof GlobalPlayerStat; label: string }[] } = {
    PASSING: [
        { key: 'passingYards', label: 'Passing Yards' },
        { key: 'passingTds', label: 'Passing TDs' },
        { key: 'passAttempts', label: 'Attempts' },
        { key: 'passCompletions', label: 'Completions' },
        { key: 'interceptionsThrown', label: 'Interceptions' },
    ],
    RUSHING: [
        { key: 'rushingYards', label: 'Rushing Yards' },
        { key: 'rushingTds', label: 'Rushing TDs' },
        { key: 'rushAttempts', label: 'Attempts' },
    ],
    RECEIVING: [
        { key: 'receptions', label: 'Receptions' },
        { key: 'receivingYards', label: 'Receiving Yards' },
        { key: 'receivingTds', label: 'Receiving TDs' },
    ],
    DEFENSE: [
        { key: 'tackles', label: 'Total Tackles' },
        { key: 'sacks', label: 'Sacks' },
        { key: 'interceptions', label: 'Interceptions' },
    ],
    RETURNS: [
        { key: 'kickReturnYards', label: 'Kick Return Yards' },
        { key: 'puntReturnYards', label: 'Punt Return Yards' },
        { key: 'kickReturnTds', label: 'Kick Return TDs' },
        { key: 'puntReturnTds', label: 'Punt Return TDs' },
    ],
    'KICKING & PUNTING': [
        { key: 'fieldGoalsMade', label: 'Field Goals Made' },
        { key: 'fieldGoalAttempts', label: 'Field Goal Attempts' },
        { key: 'punts', label: 'Punts' },
        { key: 'puntYards', label: 'Punt Yards' },
    ]
};

const COLUMNS_BY_CATEGORY: { [key: string]: { key: keyof GlobalPlayerStat; label: string }[] } = {
    PASSING: [
        { key: 'passCompletions', label: 'Cmp' },
        { key: 'passAttempts', label: 'Att' },
        { key: 'passingYards', label: 'Yds' },
        { key: 'passingTds', label: 'TD' },
        { key: 'interceptionsThrown', label: 'Int' },
    ],
    RUSHING: [
        { key: 'rushAttempts', label: 'Att' },
        { key: 'rushingYards', label: 'Yds' },
        { key: 'rushingTds', label: 'TD' },
    ],
    RECEIVING: [
        { key: 'receptions', label: 'Rec' },
        { key: 'receivingYards', label: 'Yds' },
        { key: 'receivingTds', label: 'TD' },
    ],
    DEFENSE: [
        { key: 'tackles', label: 'Tkl' },
        { key: 'sacks', label: 'Sck' },
        { key: 'interceptions', label: 'Int' },
    ],
    RETURNS: [
        { key: 'kickReturns', label: 'KR' },
        { key: 'kickReturnYards', label: 'KR Yds' },
        { key: 'kickReturnTds', label: 'KR TD' },
        { key: 'puntReturns', label: 'PR' },
        { key: 'puntReturnYards', label: 'PR Yds' },
        { key: 'puntReturnTds', label: 'PR TD' },
    ],
    'KICKING & PUNTING': [
        { key: 'fieldGoalsMade', label: 'FGM' },
        { key: 'fieldGoalAttempts', label: 'FGA' },
        { key: 'punts', label: 'Punts' },
        { key: 'puntYards', label: 'Punt Yds' },
    ]
};

const POSITION_GROUPS = ['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P'];

const TeamStatHeader: React.FC<{
    label: string;
    sortKey: keyof TeamStat | 'turnoverDifferential';
    sortConfig: { key: keyof TeamStat | 'turnoverDifferential'; direction: 'asc' | 'desc' };
    onSort: (key: keyof TeamStat | 'turnoverDifferential') => void;
    className?: string;
    title?: string;
}> = ({ label, sortKey, sortConfig, onSort, className, title }) => {
    const isSorting = sortConfig.key === sortKey;
    const arrow = isSorting ? (sortConfig.direction === 'desc' ? ' ▼' : ' ▲') : '';
    return (
        <th className={`px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider ${className}`}>
            <button className="flex items-center gap-1 group" onClick={() => onSort(sortKey)} title={title || `Sort by ${label}`}>
                <span className="group-hover:text-white">{label}</span>
                <span className={`text-[var(--accent-primary)] w-3`}>{arrow}</span>
            </button>
        </th>
    );
};

const LeaderboardView: React.FC = () => {
    const [stats, setStats] = useState<GlobalPlayerStat[]>([]);
    const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [activeView, setActiveView] = useState<'players' | 'teams'>('players');
    const [activeCategory, setActiveCategory] = useState('PASSING');
    const [positionFilter, setPositionFilter] = useState('All');
    const [statFilter, setStatFilter] = useState<keyof GlobalPlayerStat>('passingYards');
    const [divisionFilter, setDivisionFilter] = useState('All');

    const [teamSortConfig, setTeamSortConfig] = useState<{ key: keyof TeamStat | 'turnoverDifferential', direction: 'asc' | 'desc' }>({ key: 'offensiveYards', direction: 'desc' });

    useEffect(() => {
        if (activeView === 'players') {
            const newStatKey = STATS_BY_CATEGORY[activeCategory][0].key;
            setStatFilter(newStatKey);
        }
    }, [activeCategory, activeView]);

    useEffect(() => {
        const processPlayerData = (rawData: any[]): GlobalPlayerStat[] => {
            const playerStatsMap = new Map<string, GlobalPlayerStat>();

            rawData.forEach(team => {
                const teamPlayers = new Map<string, Player>();
                if (team.weeks && team.weeks.length > 0) {
                    const lastWeek = team.weeks.reduce((latest: any, current: any) => new Date(latest.date || 0) > new Date(current.date || 0) ? latest : current, team.weeks[0]);
                    (lastWeek.players || []).forEach((p: Player) => teamPlayers.set(p.id, p));
                }
                
                team.weeks.forEach((week: any) => {
                    (week.playHistory || []).forEach((play: Play & { playerIds: string[] }) => {
                        (play.playerIds || []).forEach((playerId: string) => {
                             const playerInfo = teamPlayers.get(playerId);
                             if (!playerInfo) return;
                             
                             const mapKey = `${team.userId}-${playerId}`;
                             if (!playerStatsMap.has(mapKey)) {
                                 playerStatsMap.set(mapKey, {
                                     playerId, playerName: playerInfo.name, teamName: team.teamName, teamId: team.userId, position: playerInfo.position || '',
                                     totalSnaps: 0, passAttempts: 0, passCompletions: 0, passingYards: 0, passingTds: 0, interceptionsThrown: 0,
                                     rushAttempts: 0, rushingYards: 0, rushingTds: 0, receptions: 0, receivingYards: 0, receivingTds: 0,
                                     tackles: 0, sacks: 0, interceptions: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, punts: 0, puntYards: 0,
                                     kickReturns: 0, kickReturnYards: 0, kickReturnTds: 0, puntReturns: 0, puntReturnYards: 0, puntReturnTds: 0,
                                 });
                             }
                             const pStats = playerStatsMap.get(mapKey)!;
                             pStats.totalSnaps++;
                             
                             const yards = play.yardsGained || 0;
                             const result = play.playResult;

                             // Passer stats
                             if (play.highlights?.passerId === playerId) {
                                 if ([PlayResult.PassCompleted, PlayResult.PassTouchdown, PlayResult.PassCompletedOutOfBounds, PlayResult.PassIncomplete, PlayResult.InterceptionThrown].includes(result as PlayResult)) {
                                     pStats.passAttempts++;
                                 }
                                 if ([PlayResult.PassCompleted, PlayResult.PassTouchdown, PlayResult.PassCompletedOutOfBounds].includes(result as PlayResult)) {
                                     pStats.passCompletions++;
                                     pStats.passingYards += yards;
                                 }
                                 if (result === PlayResult.PassTouchdown) pStats.passingTds++;
                                 if (result === PlayResult.InterceptionThrown) pStats.interceptionsThrown++;
                                 if (result === PlayResult.SackTaken) pStats.passingYards += yards;
                             }

                             // Runner stats
                             if (play.highlights?.runnerId === playerId) {
                                if ([PlayResult.Run, PlayResult.RunTouchdown, PlayResult.RunOutOfBounds, PlayResult.KneelDown, PlayResult.FumbleLost].includes(result as PlayResult)) {
                                  pStats.rushAttempts++;
                                  pStats.rushingYards += yards;
                                }
                                if (result === PlayResult.RunTouchdown) pStats.rushingTds++;
                             }

                             // Receiver stats
                             if (play.highlights?.receiverId === playerId) {
                                 if ([PlayResult.PassCompleted, PlayResult.PassTouchdown, PlayResult.PassCompletedOutOfBounds].includes(result as PlayResult)) {
                                     pStats.receptions++;
                                     pStats.receivingYards += yards;
                                 }
                                 if (result === PlayResult.PassTouchdown) pStats.receivingTds++;
                             }

                             // Defensive stats
                             if (play.highlights?.tacklerId === playerId) pStats.tackles++;
                             if (play.highlights?.interceptorId === playerId) pStats.interceptions++;
                             if ((result === PlayResult.DefenseSack || result === PlayResult.SackTaken) && play.highlights?.tacklerId === playerId) pStats.sacks++;

                             // Kicking stats
                             if (play.highlights?.kickerId === playerId) {
                                 if (result === PlayResult.FieldGoalGood) { pStats.fieldGoalsMade++; pStats.fieldGoalAttempts++; }
                                 if (result === PlayResult.FieldGoalFailed) pStats.fieldGoalAttempts++;
                                 if (result === PlayResult.Punt) { pStats.punts++; pStats.puntYards += yards; }
                             }

                             // Return stats
                             if (play.highlights?.returnerId === playerId) {
                                 if ([PlayResult.KickReturn, PlayResult.KickReturnTD].includes(result as PlayResult)) { pStats.kickReturns++; pStats.kickReturnYards += yards; }
                                 if (result === PlayResult.KickReturnTD) pStats.kickReturnTds++;
                                 if ([PlayResult.PuntReturn, PlayResult.PuntReturnTD].includes(result as PlayResult)) { pStats.puntReturns++; pStats.puntReturnYards += yards; }
                                 if (result === PlayResult.PuntReturnTD) pStats.puntReturnTds++;
                             }
                        });
                    });
                });
            });
            return Array.from(playerStatsMap.values());
        };
        
        const processTeamData = (rawData: any[]): TeamStat[] => {
            const teamStatsMap = new Map<string, TeamStat>();
            rawData.forEach(team => {
                const teamStat: TeamStat = { teamId: team.userId, teamName: team.teamName, gamesPlayed: 0, offensiveYards: 0, defensiveYardsAllowed: 0, turnoversCommitted: 0, turnoversForced: 0, penalties: 0, penaltyYards: 0, ageDivision: team.ageDivision || null };
                const weeksWithPlays = team.weeks.filter((w: any) => w.playHistory && w.playHistory.length > 0);
                teamStat.gamesPlayed = weeksWithPlays.length;
                weeksWithPlays.forEach((week: any) => {
                    (week.playHistory || []).forEach((play: Play) => {
                        const yards = play.yardsGained || 0;
                        if (play.type === 'Offense') {
                            teamStat.offensiveYards += yards;
                            if (play.playResult === PlayResult.FumbleLost || play.playResult === PlayResult.InterceptionThrown) teamStat.turnoversCommitted++;
                        } else if (play.type === 'Defense') {
                            teamStat.defensiveYardsAllowed += yards;
                            if ([PlayResult.Interception, PlayResult.FumbleRecovery].includes(play.playResult as PlayResult)) teamStat.turnoversForced++;
                        }
                        if (play.playResult === PlayResult.PenaltyAccepted && play.penaltyOn === 'offense') {
                            teamStat.penalties++;
                            teamStat.penaltyYards += Math.abs(yards);
                        }
                    });
                });
                teamStatsMap.set(team.userId, teamStat);
            });
            return Array.from(teamStatsMap.values());
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const rawData = await getAllTeamData();
                setStats(processPlayerData(rawData));
                setTeamStats(processTeamData(rawData));
            } catch (err) {
                console.error(err);
                setError("Failed to fetch global data. This may be a permissions issue.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const filteredAndSortedStats = useMemo(() => {
        const teamsInDivision = new Set(
            divisionFilter === 'All'
                ? teamStats.map(t => t.teamId)
                : teamStats.filter(t => t.ageDivision === divisionFilter).map(t => t.teamId)
        );

        return stats
            .filter(player => {
                if (!teamsInDivision.has(player.teamId)) {
                    return false;
                }
                if (positionFilter === 'All') return true;
                const pos = player.position.toUpperCase();
                if (positionFilter === 'OL') return ['T', 'G', 'C'].some(p => pos.includes(p));
                if (positionFilter === 'DL') return ['DE', 'DT', 'NT'].some(p => pos.includes(p));
                if (positionFilter === 'DB') return ['CB', 'S', 'NICKEL'].some(p => pos.includes(p));
                return pos.includes(positionFilter);
            })
            .sort((a, b) => (b[statFilter] as number) - (a[statFilter] as number));
    }, [stats, positionFilter, statFilter, divisionFilter, teamStats]);

    const sortedTeamStats = useMemo(() => {
        return [...teamStats]
            .filter(team => divisionFilter === 'All' || team.ageDivision === divisionFilter)
            .sort((a, b) => {
                const { key, direction } = teamSortConfig;
                let aVal, bVal;
                if (key === 'turnoverDifferential') {
                    aVal = a.turnoversForced - a.turnoversCommitted;
                    bVal = b.turnoversForced - b.turnoversCommitted;
                } else { aVal = a[key]; bVal = b[key]; }
                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });
    }, [teamStats, teamSortConfig, divisionFilter]);

    const handleTeamSort = (key: keyof TeamStat | 'turnoverDifferential') => {
        let direction: 'asc' | 'desc' = 'desc';
        if (teamSortConfig.key === key) {
            direction = teamSortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else if (['defensiveYardsAllowed', 'turnoversCommitted', 'penalties', 'penaltyYards'].includes(key)) {
            direction = 'asc';
        }
        setTeamSortConfig({ key, direction });
    };

    const handleExportPdf = (isTeamExport: boolean) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        if (isTeamExport) {
            doc.setFontSize(18);
            doc.text('Global Team Leaderboard', 14, 22);
            doc.autoTable({ startY: 30, head: [['Rank', 'Team', 'GP', 'Off. Yds', 'Def. Yds', 'TO', 'TK', '+/-', 'Pen', 'Pen Yds']], body: sortedTeamStats.map((t, i) => [i + 1, t.teamName, t.gamesPlayed, t.offensiveYards, t.defensiveYardsAllowed, t.turnoversCommitted, t.turnoversForced, t.turnoversForced - t.turnoversCommitted, t.penalties, t.penaltyYards]), theme: 'grid' });
            doc.save(`leaderboard_teams.pdf`);
        } else {
            doc.setFontSize(18);
            doc.text('Global Player Leaderboard', 14, 22);
            doc.setFontSize(12);
            const statLabel = STATS_BY_CATEGORY[activeCategory].find(c => c.key === statFilter)?.label || 'Stat';
            doc.text(`Top Players: ${statLabel} (${activeCategory} / ${positionFilter})`, 14, 30);
            
            const tableHead = [['Rank', 'Player', 'Team', ...COLUMNS_BY_CATEGORY[activeCategory].map(c => c.label)]];
            const tableBody = filteredAndSortedStats.slice(0, 100).map((p, i) => [i + 1, p.playerName, p.teamName, ...COLUMNS_BY_CATEGORY[activeCategory].map(c => p[c.key])]);
            doc.autoTable({ startY: 40, head: tableHead, body: tableBody, theme: 'grid' });
            doc.save(`leaderboard_${activeCategory}_${statFilter}.pdf`);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-full"><SpinnerIcon className="w-12 h-12 text-[var(--accent-primary)]" /></div>;
    if (error) return <div className="text-red-400 bg-red-900/30 p-4 rounded-lg">{error}</div>;

    const viewTabClass = "py-3 px-4 font-bold border-b-2 transition-colors duration-200 text-base";
    const categoryTabClass = "py-2 px-4 text-sm font-semibold rounded-md transition-colors";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Icon name="global-leaderboard" className="w-8 h-8 text-[var(--accent-primary)]" />
                <h2 className="text-3xl font-bold">Global Leaderboards</h2>
            </div>
            
            <div className="border-b border-[var(--border-primary)]">
                <nav className="flex -mb-px">
                    <button onClick={() => setActiveView('players')} className={`${viewTabClass} ${activeView === 'players' ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-white'}`}>Player Stats</button>
                    <button onClick={() => setActiveView('teams')} className={`${viewTabClass} ${activeView === 'teams' ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-white'}`}>Team Stats</button>
                </nav>
            </div>
            
            {activeView === 'players' && (
                <div className="space-y-4">
                    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-2">
                        <nav className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {STAT_CATEGORIES.map(category => (
                                <button key={category} onClick={() => setActiveCategory(category)} className={`${categoryTabClass} ${activeCategory === category ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--border-primary)]'}`}>{category}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div><label htmlFor="stat-filter" className="text-xs font-semibold text-[var(--text-secondary)]">Stat</label><select id="stat-filter" value={statFilter} onChange={e => setStatFilter(e.target.value as keyof GlobalPlayerStat)} className="block w-full mt-1 bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded-md p-2"><option value="" disabled>- Select Stat -</option>{STATS_BY_CATEGORY[activeCategory].map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}</select></div>
                        <div><label htmlFor="pos-filter" className="text-xs font-semibold text-[var(--text-secondary)]">Position</label><select id="pos-filter" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="block w-full mt-1 bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded-md p-2">{POSITION_GROUPS.map(pos => <option key={pos} value={pos}>{pos}</option>)}</select></div>
                        <div>
                            <label htmlFor="division-filter-player" className="text-xs font-semibold text-[var(--text-secondary)]">Division</label>
                            <select id="division-filter-player" value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)} className="block w-full mt-1 bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded-md p-2">
                                <option value="All">All Divisions</option>
                                {Object.entries(AgeDivisionLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end"><button onClick={() => handleExportPdf(false)} className="w-full sm:w-auto px-4 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)]">Export PDF</button></div>
                    </div>
                    <div className="overflow-x-auto bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                        <table className="min-w-full divide-y divide-[var(--border-primary)]">
                            <thead className="bg-[var(--bg-tertiary)]/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Rank</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Player</th>
                                    {COLUMNS_BY_CATEGORY[activeCategory].map(col => (<th key={col.key} className={`px-4 py-3 text-right text-xs font-medium uppercase ${statFilter === col.key ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{col.label}</th>))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                                {filteredAndSortedStats.slice(0, 100).map((p, i) => (
                                    <tr key={`${p.teamId}-${p.playerId}`} className="hover:bg-[var(--bg-tertiary)]">
                                        <td className="px-4 py-4 text-sm font-medium text-[var(--text-secondary)]">{i + 1}</td>
                                        <td className="px-4 py-4"><p className="font-semibold text-sm text-[var(--text-primary)]">{p.playerName}</p><p className="text-xs text-[var(--text-secondary)]">{p.teamName}</p></td>
                                        {COLUMNS_BY_CATEGORY[activeCategory].map(col => (<td key={col.key} className={`px-4 py-4 text-right text-sm font-mono ${statFilter === col.key ? 'font-bold text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>{p[col.key]}</td>))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeView === 'teams' && (
                 <div className="space-y-4">
                    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-4 flex justify-between">
                        <div>
                            <label htmlFor="division-filter-team" className="text-xs font-semibold text-[var(--text-secondary)]">Filter by Division</label>
                            <select id="division-filter-team" value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)} className="block w-full mt-1 bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded-md p-2">
                                <option value="All">All Divisions</option>
                                {Object.entries(AgeDivisionLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => handleExportPdf(true)} className="px-4 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)]">Export PDF</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                        <table className="min-w-full divide-y divide-[var(--border-primary)]">
                            <thead className="bg-[var(--bg-tertiary)]/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Rank</th><th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Team</th><TeamStatHeader label="GP" sortKey="gamesPlayed" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Games Played" /><TeamStatHeader label="Off. Yds" sortKey="offensiveYards" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Offensive Yards" /><TeamStatHeader label="Def. Yds" sortKey="defensiveYardsAllowed" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Defensive Yards Allowed" /><TeamStatHeader label="TO" sortKey="turnoversCommitted" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Turnovers Committed" /><TeamStatHeader label="TK" sortKey="turnoversForced" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Takeaways" /><TeamStatHeader label="+/-" sortKey="turnoverDifferential" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Turnover Differential" /><TeamStatHeader label="Pen" sortKey="penalties" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Penalties" /><TeamStatHeader label="Pen Yds" sortKey="penaltyYards" sortConfig={teamSortConfig} onSort={handleTeamSort} title="Penalty Yards" /></tr></thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">{sortedTeamStats.map((t, i) => { const diff = t.turnoversForced - t.turnoversCommitted; return (<tr key={t.teamId} className="hover:bg-[var(--bg-tertiary)]"><td className="px-4 py-4 text-sm font-medium text-[var(--text-secondary)]">{i + 1}</td><td className="px-4 py-4 text-sm font-semibold text-[var(--text-primary)]">{t.teamName}</td><td className="px-4 py-4 text-sm text-center text-[var(--text-secondary)]">{t.gamesPlayed}</td><td className="px-4 py-4 text-sm text-center font-bold text-[var(--accent-primary)]">{t.offensiveYards}</td><td className="px-4 py-4 text-sm text-center text-[var(--text-secondary)]">{t.defensiveYardsAllowed}</td><td className="px-4 py-4 text-sm text-center text-[var(--text-secondary)]">{t.turnoversCommitted}</td><td className="px-4 py-4 text-sm text-center text-[var(--text-secondary)]">{t.turnoversForced}</td><td className={`px-4 py-4 text-sm text-center font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>{diff > 0 ? `+${diff}` : diff}</td><td className="px-4 py-4 text-sm text-center text-[var(--text-secondary)]">{t.penalties}</td><td className="px-4 py-4 text-sm text-center text-[var(--text-secondary)]">{t.penaltyYards}</td></tr>);})}</tbody>
                        </table>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default LeaderboardView;