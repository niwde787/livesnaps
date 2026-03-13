// FIX: Added 'useCallback' to the import from 'react' to resolve reference error.
import React, { useState, useMemo, useCallback } from 'react';
import { Player, PlayType, PlayerStatus } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import PlayerStatusModal from './PlayerStatusModal';
import AddPlayerModal from './AddPlayerModal';
import RosterImportModal from './RosterImportModal';
import { formatTime, getLastName, getOrdinal, getStatusColorClasses } from '../utils';
import { PlusCircleIcon, ImportIcon, StarIcon, ChevronRightIcon } from './icons';
import { DEFAULT_PLAYER_IMAGE, OFFENSE_DISPLAY_GROUPS, DEFENSE_DISPLAY_GROUPS, ST_DISPLAY_GROUPS, POSITION_GROUPS, POSITION_FULL_NAMES } from '../constants';

const PlayerCard: React.FC<{ 
    player: Player; 
    onClick: () => void;
    totalGamePlays: number;
}> = ({ player, onClick, totalGamePlays }) => {
    const totalPlays = player.offensePlayCount + player.defensePlayCount + player.specialTeamsPlayCount;
    const participation = totalGamePlays > 0 ? Math.round((totalPlays / totalGamePlays) * 100) : 0;
    const statusColors = getStatusColorClasses(player.status);

    return (
        <div 
            className={`bg-[var(--bg-tertiary)] rounded-xl p-4 flex flex-col justify-between border-2 shadow-lg cursor-pointer group transition-all hover:-translate-y-1 ${statusColors.border}`} 
            onClick={onClick}
            aria-label={`Edit player ${player.name}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <img src={player.imageUrl || DEFAULT_PLAYER_IMAGE} alt={player.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                        <p className="text-lg font-bold text-[var(--text-primary)] truncate">#{player.jerseyNumber} {player.name}</p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                    <span className={`font-semibold text-xs px-2 py-1 rounded-full ${statusColors.bg} ${statusColors.text}`}>{player.status}</span>
                </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-[var(--border-primary)]/50">
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)]">Plays (O/D/S)</span>
                        <span className="font-mono font-semibold">
                            <span style={{ color: 'var(--accent-secondary)' }}>{player.offensePlayCount}</span>
                            <span className="text-[var(--text-secondary)]"> / </span>
                            <span style={{ color: 'var(--accent-defense)' }}>{player.defensePlayCount}</span>
                            <span className="text-[var(--text-secondary)]"> / </span>
                            <span style={{ color: 'var(--accent-primary)' }}>{player.specialTeamsPlayCount}</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)]">Total Plays</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">{totalPlays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)]">Time on Field</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">{formatTime(player.timeOnField)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)]">Participation</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">{participation}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AvailablePlayerItem: React.FC<{ player: Player; onDragStart: () => void; isDragging: boolean }> = ({ player, onDragStart, isDragging }) => {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            className={`flex items-center gap-2 cursor-grab p-1.5 rounded-md hover:bg-white/10 transition-opacity border border-transparent hover:border-[var(--border-primary)] ${isDragging ? 'opacity-30' : ''}`}
        >
             <img src={player.imageUrl || DEFAULT_PLAYER_IMAGE} alt={player.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
             <div className="flex-grow min-w-0">
                <p className="text-sm text-[var(--text-primary)] font-semibold truncate">#{player.jerseyNumber} {getLastName(player.name)}</p>
             </div>
        </div>
    );
};


const DepthPlayerRow: React.FC<{
    player: Player;
    rank: number;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    isDragging: boolean;
}> = ({ player, rank, onDragStart, onDragEnd, isDragging }) => {
    const isStarter = rank === 1;

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-2 p-1.5 rounded cursor-move hover:bg-white/10 ${isDragging ? 'opacity-30' : ''}`}
        >
            <div className="w-8 text-center font-medium text-sm text-[var(--text-secondary)]">
                {isStarter ? (
                    <StarIcon className="w-6 h-6 text-lime-400 mx-auto" />
                ) : (
                    getOrdinal(rank).toUpperCase()
                )}
            </div>
            <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${isStarter ? 'text-lime-400' : 'text-[var(--text-primary)]'}`}>
                    #{player.jerseyNumber} {player.name}
                </p>
            </div>
        </div>
    );
};

const PositionGroupCard: React.FC<{
    group: string;
    players: Player[];
    onPlayerDragStart: (playerId: string) => void;
    onDrop: (dropIndex: number) => void;
    onDragEnd: () => void;
    isDragOver: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    draggedPlayerId: string | null;
}> = ({ group, players, onPlayerDragStart, onDrop, onDragEnd, isDragOver, onDragOver, onDragLeave, draggedPlayerId }) => {
    
    return (
        <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => { e.preventDefault(); onDrop(players.length); }} // Drop at the end if dropping on the card itself
            className={`bg-[var(--bg-tertiary)] rounded-xl p-3 border border-[var(--border-primary)] shadow-lg transition-colors ${isDragOver ? 'border-[var(--accent-primary)]' : 'border-[var(--border-primary)]'}`}
        >
            <h3 className="text-center font-bold text-base text-[var(--text-primary)] uppercase tracking-wider pb-2">
                {group}
            </h3>
            <hr className="border-t border-[var(--border-primary)]/50" />
            <div className="mt-2 space-y-1 min-h-[40px]">
                {players.map((player, index) => (
                    <div
                        key={player.id}
                        onDrop={e => { e.preventDefault(); e.stopPropagation(); onDrop(index); }}
                        className="rounded"
                    >
                        <DepthPlayerRow
                            player={player}
                            rank={index + 1}
                            onDragStart={() => onPlayerDragStart(player.id)}
                            onDragEnd={onDragEnd}
                            isDragging={draggedPlayerId === player.id}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const PositionLegend: React.FC = () => {
    const renderPositionList = (title: string, positions: string[], accentColor: string) => (
      <div>
        <h4 className="text-md font-bold mb-2" style={{ color: accentColor }}>
            {title}
        </h4>
        <ul className="space-y-1 max-h-48 overflow-y-auto no-scrollbar pr-2">
          {positions.map(pos => (
            <li key={pos} className="text-xs flex items-baseline">
              <span className="font-bold text-[var(--text-primary)] w-12 inline-block flex-shrink-0">{pos}</span>
              <span className="text-[var(--text-secondary)]">- {POSITION_FULL_NAMES[pos] || 'Unknown'}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  
    return (
        <details className="bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)]">
            <summary className="p-3 cursor-pointer text-base font-bold text-[var(--text-secondary)] flex items-center justify-between list-none">
                <div className="flex items-center gap-2">
                    <ChevronRightIcon className="w-5 h-5 text-[var(--text-secondary)] transition-transform details-open-rotate" />
                    <span>Position Legend</span>
                </div>
            </summary>
            <div className="p-4 border-t border-[var(--border-primary)] grid grid-cols-2 md:grid-cols-3 gap-4">
              {renderPositionList('Offense', POSITION_GROUPS.OFFENSE, 'var(--accent-secondary)')}
              {renderPositionList('Defense', POSITION_GROUPS.DEFENSE, 'var(--accent-defense)')}
              {renderPositionList('Specialists', POSITION_GROUPS.SPECIALISTS, 'var(--accent-special)')}
            </div>
        </details>
    );
};

const PlayerTable: React.FC = () => {
    const { players, playHistory, handleUpdatePlayer, handleDeletePlayer, handleAddPlayer, handleRosterImport, depthChart, handleUpdateDepthChart } = useGameState();
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'roster' | 'depthChart'>('roster');
    const [activeDepthChartTab, setActiveDepthChartTab] = useState<PlayType.Offense | PlayType.Defense | PlayType.SpecialTeams>(PlayType.Offense);
    
    const [draggedItem, setDraggedItem] = useState<{ sourceGroup: string | 'pool'; playerId: string } | null>(null);
    const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

    const totalGamePlays = playHistory.length;
    
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a,b) => a.jerseyNumber - b.jerseyNumber);
    }, [players]);

    const { currentDisplayGroups, tabConfig } = useMemo(() => {
        switch (activeDepthChartTab) {
            case PlayType.Defense:
                return { currentDisplayGroups: DEFENSE_DISPLAY_GROUPS, tabConfig: { active: 'border-[var(--accent-defense)] text-[var(--accent-defense)]', inactive: 'border-transparent text-[var(--text-secondary)] hover:text-[var(--accent-defense)]' }};
            case PlayType.SpecialTeams:
                return { currentDisplayGroups: ST_DISPLAY_GROUPS, tabConfig: { active: 'border-[var(--accent-special)] text-[var(--accent-special)]', inactive: 'border-transparent text-[var(--text-secondary)] hover:text-[var(--accent-special)]' }};
            case PlayType.Offense:
            default:
                return { currentDisplayGroups: OFFENSE_DISPLAY_GROUPS, tabConfig: { active: 'border-[var(--accent-secondary)] text-[var(--accent-secondary)]', inactive: 'border-transparent text-[var(--text-secondary)] hover:text-[var(--accent-secondary)]' }};
        }
    }, [activeDepthChartTab]);
    
    const poolPlayers = useMemo(() => {
        // Get all unique player IDs that are currently assigned to any position group.
        const assignedPlayerIds = new Set<string>();
        Object.values(depthChart).forEach(playerIds => {
            playerIds.forEach(id => assignedPlayerIds.add(id));
        });

        // Filter the main players list to only include those not already assigned.
        return players
            .filter(player => player.status === 'Playing' && !assignedPlayerIds.has(player.id))
            .sort((a, b) => a.jerseyNumber - b.jerseyNumber);
    }, [players, depthChart]);

    const getPlayersForGroup = useCallback((group: string): Player[] => {
        const playerMap = new Map(players.map(p => [p.id, p]));
        const orderedPlayerIds = depthChart[group] || [];
        return orderedPlayerIds.map(id => playerMap.get(id)).filter((p): p is Player => !!p);
    }, [players, depthChart]);

    const handleDragStart = (sourceGroup: string | 'pool', playerId: string) => {
        setDraggedItem({ sourceGroup, playerId });
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverGroup(null);
    };

    const handleDropOnGroup = (targetGroup: string, dropIndex: number) => {
        if (!draggedItem) return;
        const { sourceGroup, playerId } = draggedItem;

        if (sourceGroup === targetGroup) { // Re-ordering within the same group
            const groupOrder = (depthChart[targetGroup] || []);
            const reordered = [...groupOrder];
            const oldIndex = reordered.indexOf(playerId);
            if (oldIndex > -1) {
                reordered.splice(oldIndex, 1);
            }
            reordered.splice(dropIndex, 0, playerId);
            handleUpdateDepthChart(targetGroup, reordered);
        } else { // Moving from pool or another group
            if (sourceGroup !== 'pool') {
                const sourceOrder = (depthChart[sourceGroup] || []).filter(id => id !== playerId);
                handleUpdateDepthChart(sourceGroup, sourceOrder);
            }

            const targetOrder = [...(depthChart[targetGroup] || [])];
            const existingIndex = targetOrder.indexOf(playerId);
            if (existingIndex > -1) {
                targetOrder.splice(existingIndex, 1);
            }
            targetOrder.splice(dropIndex, 0, playerId);
            handleUpdateDepthChart(targetGroup, targetOrder);
        }
        handleDragEnd();
    };

    const handleDropOnPool = () => {
        if (!draggedItem || draggedItem.sourceGroup === 'pool') return;
        const { sourceGroup, playerId } = draggedItem;
        
        const sourceOrder = (depthChart[sourceGroup] || []).filter(id => id !== playerId);
        handleUpdateDepthChart(sourceGroup, sourceOrder);
        handleDragEnd();
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const tabButtonStyle = "py-2 px-4 font-bold border-b-2 transition-colors duration-200 text-sm";
    const mainTabButtonStyle = "py-3 px-4 font-bold border-b-2 transition-colors duration-200 text-base";
    const activeMainTabStyle = "border-[var(--accent-primary)] text-[var(--accent-primary)]";
    const inactiveMainTabStyle = "border-transparent text-[var(--text-secondary)] hover:text-white";

    return (
        <div className="bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-primary)] flex flex-col h-full">
             <header className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{activeTab === 'roster' ? `Roster (${sortedPlayers.length})` : 'Depth Chart'}</h2>
                 <div className="flex items-center gap-2">
                    <button id="walkthrough-add-player-button" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-md hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]"><PlusCircleIcon className="w-4 h-4" /> Add Player</button>
                    <button id="walkthrough-import-roster-button" onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-md hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]"><ImportIcon className="w-4 h-4" /> Import Roster</button>
                </div>
            </header>
            
            <div className="px-4 border-b border-[var(--border-primary)] flex-shrink-0">
                <nav className="flex items-center -mb-px">
                     <button onClick={() => setActiveTab('roster')} className={`${mainTabButtonStyle} ${activeTab === 'roster' ? activeMainTabStyle : inactiveMainTabStyle}`}>Roster</button>
                     <button onClick={() => setActiveTab('depthChart')} className={`${mainTabButtonStyle} ${activeTab === 'depthChart' ? activeMainTabStyle : inactiveMainTabStyle}`}>Depth Chart</button>
                </nav>
            </div>

            {activeTab === 'roster' && (
                <div className="flex flex-col flex-grow min-h-0">
                    <main className="p-4 overflow-y-auto flex-grow space-y-4">
                        {sortedPlayers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {sortedPlayers.map(player => (
                                    <PlayerCard 
                                        key={player.id} 
                                        player={player} 
                                        onClick={() => setEditingPlayer(player)} 
                                        totalGamePlays={totalGamePlays} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-[var(--text-secondary)]">
                                <p>No players match the current filter. Click 'Add Player' or 'Import Roster' to get started.</p>
                            </div>
                        )}
                        <PositionLegend />
                    </main>
                </div>
            )}

            {activeTab === 'depthChart' && (
                <div className="flex flex-col flex-grow min-h-0">
                    <div className="px-4 border-b border-[var(--border-primary)] flex-shrink-0">
                         <nav className="flex justify-around -mb-px">
                            <button onClick={() => setActiveDepthChartTab(PlayType.Offense)} className={`${tabButtonStyle} ${activeDepthChartTab === PlayType.Offense ? tabConfig.active : tabConfig.inactive}`}>Offense</button>
                            <button onClick={() => setActiveDepthChartTab(PlayType.Defense)} className={`${tabButtonStyle} ${activeDepthChartTab === PlayType.Defense ? tabConfig.active : tabConfig.inactive}`}>Defense</button>
                            <button onClick={() => setActiveDepthChartTab(PlayType.SpecialTeams)} className={`${tabButtonStyle} ${activeDepthChartTab === PlayType.SpecialTeams ? tabConfig.active : tabConfig.inactive}`}>Special Teams</button>
                        </nav>
                    </div>
                    <main className="p-4 overflow-y-auto flex-grow space-y-4">
                        <div className="grid grid-cols-5 gap-4">
                            {Object.keys(currentDisplayGroups).map(group => (
                                <PositionGroupCard
                                    key={group}
                                    group={group}
                                    players={getPlayersForGroup(group)}
                                    onPlayerDragStart={(playerId) => handleDragStart(group, playerId)}
                                    onDrop={(dropIndex) => handleDropOnGroup(group, dropIndex)}
                                    onDragEnd={handleDragEnd}
                                    isDragOver={dragOverGroup === group}
                                    onDragOver={handleDragOver}
                                    onDragLeave={() => setDragOverGroup(null)}
                                    draggedPlayerId={draggedItem?.playerId || null}
                                />
                            ))}
                        </div>

                        <div
                            onDrop={handleDropOnPool}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setDragOverGroup('pool')}
                            onDragLeave={() => setDragOverGroup(null)}
                            className={`p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] transition-colors ${dragOverGroup === 'pool' ? 'border-[var(--accent-primary)]' : 'border-[var(--border-primary)]'}`}
                        >
                            <h3 className="text-base font-bold text-[var(--text-secondary)] mb-3">Available Players ({poolPlayers.length})</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                {poolPlayers.length > 0 ? (
                                    poolPlayers.map(p => (
                                        <AvailablePlayerItem 
                                            key={p.id} 
                                            player={p} 
                                            onDragStart={() => handleDragStart('pool', p.id)}
                                            isDragging={draggedItem?.playerId === p.id}
                                        />
                                    ))
                                ) : <p className="text-sm text-[var(--text-secondary)] col-span-full text-center">All players are on the depth chart. Drag a player here to make them available.</p>}
                            </div>
                        </div>
                        <PositionLegend />
                    </main>
                </div>
            )}
            
            {editingPlayer && <PlayerStatusModal player={editingPlayer} onClose={() => setEditingPlayer(null)} onSave={(id, updates) => { handleUpdatePlayer(id, updates); setEditingPlayer(null); }} onDelete={(id) => { handleDeletePlayer(id); setEditingPlayer(null); }} />}
            {isAddModalOpen && <AddPlayerModal onClose={() => setIsAddModalOpen(false)} onAddPlayer={handleAddPlayer} />}
            {isImportModalOpen && <RosterImportModal onClose={() => setIsImportModalOpen(false)} onImport={handleRosterImport} />}
        </div>
    );
};

export default PlayerTable;