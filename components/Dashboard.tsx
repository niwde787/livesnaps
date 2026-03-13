import React, { useMemo, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PlaybookWidget from './PlaybookWidget';
import Scoreboard from './Scoreboard';
import WaveSubModal from './WaveSubModal';
import { Player, FormationCollection, PlayType, PlayerStatus, SelectablePlayType } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { StarIcon } from './icons';
import { OFFENSE_DISPLAY_GROUPS, DEFENSE_DISPLAY_GROUPS, ST_DISPLAY_GROUPS } from '../constants';

const PLAY_TYPE_CONFIG = {
    [PlayType.Offense]: {
        activeTabClass: 'border-[var(--accent-secondary)] text-[var(--accent-secondary)]',
    },
    [PlayType.Defense]: {
        activeTabClass: 'border-[var(--accent-defense)] text-[var(--accent-defense)]',
    },
    [PlayType.SpecialTeams]: {
        activeTabClass: 'border-[var(--accent-special)] text-[var(--accent-special)]',
    },
};

const TABS: SelectablePlayType[] = [PlayType.Offense, PlayType.Defense, PlayType.SpecialTeams];
const modalRoot = document.getElementById('modal-root');

const Dashboard: React.FC = () => {
    const { 
        players, offenseFormations, defenseFormations, specialTeamsFormations,
        handleLineupConfirm, playHistory, currentLineups, handleUpdateLineup,
        playbookTab, setPlaybookTab, selectedFormationName, setSelectedFormationName,
        insertionIndex, handleCancelInsert, handleSetFormationAsDefault,
        depthChart,
        handleResetLineupToDefault,
    } = useGameState();

    const [assignments, setAssignments] = useState<(Player | null)[]>([]);
    const [lineupIds, setLineupIds] = useState<(string | null)[]>([]);
    const [waveSubState, setWaveSubState] = useState<{ isOpen: boolean; stagedSlotIndex: number | null }>({ isOpen: false, stagedSlotIndex: null });

    const playingPlayers = useMemo(() => players.filter(p => p.status === PlayerStatus.Playing), [players]);
    const playingPlayerIds = useMemo(() => new Set(playingPlayers.map(p => p.id)), [playingPlayers]);
  
    const formations = useMemo(() => {
        switch (playbookTab) {
            case PlayType.Defense: return defenseFormations;
            case PlayType.SpecialTeams: return specialTeamsFormations;
            case PlayType.Offense: default: return offenseFormations;
        }
    }, [playbookTab, offenseFormations, defenseFormations, specialTeamsFormations]);

    useEffect(() => {
        if (!formations[selectedFormationName]) {
            const firstFormationName = Object.keys(formations)[0];
            if (firstFormationName) {
                setSelectedFormationName(firstFormationName);
            } else {
                setSelectedFormationName('');
            }
        }
    }, [formations, selectedFormationName, setSelectedFormationName]);

    const formationData = useMemo(() => formations[selectedFormationName], [formations, selectedFormationName]);
    const formationPositions = useMemo(() => formationData?.positions || [], [formationData]);

    useEffect(() => {
        if (!selectedFormationName) {
            setLineupIds([]);
            return;
        }

        const getInitialLineupIds = () => {
            // 1. Prioritize current lineup saved in the session state for in-game edits
            if (currentLineups[selectedFormationName]) {
                return currentLineups[selectedFormationName];
            }
            
            // 2. Check for preset player IDs in the formation definition
            if (formationData?.presetPlayerIds) {
                return formationData.presetPlayerIds;
            }
    
            // 3. Fallback for legacy preset jersey numbers
            if (formationData?.presetPlayerJerseys) {
                const jerseyToIdMap = new Map(players.map(p => [p.jerseyNumber, p.id]));
                return formationData.presetPlayerJerseys.map(jersey => (jersey ? jerseyToIdMap.get(jersey) || null : null));
            }

            // 4. Build default lineup from the consolidated Depth Chart (Revised Logic)
            const usedPlayerIds = new Set<string>();
            const depthChartLineup = new Array(formationPositions.length).fill(null);
            const allDisplayGroups = { ...OFFENSE_DISPLAY_GROUPS, ...DEFENSE_DISPLAY_GROUPS, ...ST_DISPLAY_GROUPS };

            // Define a deterministic order for searching groups to ensure consistent lineup generation.
            const groupPriority = [
                ...Object.keys(OFFENSE_DISPLAY_GROUPS),
                ...Object.keys(DEFENSE_DISPLAY_GROUPS),
                ...Object.keys(ST_DISPLAY_GROUPS)
            ];

            // Tracks how many times a generic label like 'WR' has been filled to pick the next appropriate depth chart group (e.g., WR (X) -> WR (Z)).
            const genericGroupUsageCounter: Record<string, number> = {};

            formationPositions.forEach((position, index) => {
                const posLabel = position.label.toUpperCase();
                
                // Find all potential depth chart groups that this position label could belong to, in a prioritized order.
                const potentialGroups = groupPriority.filter(groupName => 
                    allDisplayGroups[groupName].includes(posLabel)
                );

                if (potentialGroups.length === 0) {
                    return; // No matching group for this position label, skip.
                }

                // Determine which specific group to try based on how many times we've already filled this label.
                const groupIndexToTry = genericGroupUsageCounter[posLabel] || 0;
                const groupNameToUse = potentialGroups[groupIndexToTry % potentialGroups.length];
                
                if (groupNameToUse && depthChart[groupNameToUse]) {
                    // Find the first available player from this specific depth chart group.
                    for (const playerId of depthChart[groupNameToUse]) {
                        if (playerId && !usedPlayerIds.has(playerId) && playingPlayerIds.has(playerId)) {
                            depthChartLineup[index] = playerId;
                            usedPlayerIds.add(playerId);
                            
                            // Increment the usage counter for this generic position label.
                            genericGroupUsageCounter[posLabel] = groupIndexToTry + 1;
                            break; // Player found, move to the next formation position.
                        }
                    }
                }
            });
            
            return depthChartLineup;
        };
    
        const initialIds = getInitialLineupIds();
        const finalIds = new Array(formationPositions.length).fill(null);
        initialIds.forEach((id, index) => {
            if (index < finalIds.length) {
                finalIds[index] = id;
            }
        });

        setLineupIds(finalIds);
    }, [selectedFormationName, formationPositions, currentLineups, depthChart, players, formationData, playingPlayerIds, setSelectedFormationName]);

    useEffect(() => {
      const playerMap = new Map(playingPlayers.map(p => [p.id, p]));
      const hydratedAssignments = lineupIds.map(id => {
        if (!id) return null;
        const player = playerMap.get(id); 
        return player || null;
      });
      setAssignments(hydratedAssignments);
    }, [lineupIds, playingPlayers]);

    const onFieldPlayers = useMemo(() => new Set(assignments.filter((p): p is Player => p !== null).map(p => p.id)), [assignments]);
    const isLineupComplete = useMemo(() => formationPositions.length > 0 && onFieldPlayers.size === formationPositions.length, [onFieldPlayers.size, formationPositions.length]);

    const handleConfirm = useCallback(() => {
        handleLineupConfirm(playbookTab, onFieldPlayers, selectedFormationName, lineupIds);
    }, [playbookTab, onFieldPlayers, selectedFormationName, lineupIds, handleLineupConfirm]);
    
    const handleLoadDefault = () => {
        if (selectedFormationName) {
            handleResetLineupToDefault(selectedFormationName);
        }
    };

    const handleConfirmSubstitutions = (newAssignments: (Player | null)[]) => {
        const newLineupIds = newAssignments.map(p => p ? p.id : null);
        handleUpdateLineup(selectedFormationName, newLineupIds, playbookTab);
        setWaveSubState({ isOpen: false, stagedSlotIndex: null });
    };

    const handleSlotClick = useCallback((index: number) => {
        setWaveSubState({ isOpen: true, stagedSlotIndex: index });
    }, []);

    const handleOpenWaveSub = () => {
        setWaveSubState({ isOpen: true, stagedSlotIndex: null });
    };

    return (
      <>
        <div className="bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-primary)] w-full flex flex-col">
            <Scoreboard />
            {insertionIndex !== null && (
                <div className="p-3 bg-[var(--accent-primary)]/20 border-b border-[var(--accent-primary)] flex justify-between items-center text-sm">
                    <p className="font-semibold text-[var(--accent-primary)]">
                        Inserting new play before Play #{insertionIndex + 1}. Select formation and confirm lineup.
                    </p>
                    <button onClick={handleCancelInsert} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-md font-semibold hover:bg-red-500/40">
                        Cancel Insert
                    </button>
                </div>
            )}
            <header className="flex justify-between items-center border-b border-[var(--border-primary)] px-4 py-2 flex-shrink-0 gap-4">
                <div className="flex items-center">
                    {TABS.map(tab => {
                        const isActive = playbookTab === tab;
                        const config = PLAY_TYPE_CONFIG[tab];
                        return (
                            <button
                                key={tab}
                                onClick={() => setPlaybookTab(tab)}
                                className={`py-2 px-4 font-bold border-b-2 transition-colors duration-200 text-sm ${isActive ? config.activeTabClass : 'border-transparent text-[var(--text-secondary)] hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>
                <div className="flex items-center gap-2">
                      <button onClick={() => handleSetFormationAsDefault(playbookTab, selectedFormationName)} disabled={!selectedFormationName || !currentLineups[selectedFormationName]} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--border-primary)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Set current lineup as the default for this formation in all future games">
                          <StarIcon className="w-4 h-4" />
                          Set Default
                      </button>
                      <button onClick={handleLoadDefault} className="px-3 py-1.5 text-sm font-semibold bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--border-primary)] hover:text-white transition-colors">Load Default</button>
                      <button onClick={handleOpenWaveSub} className="px-3 py-1.5 text-sm font-semibold bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--border-primary)] hover:text-white transition-colors">Wave Sub</button>
                </div>
            </header>
            <PlaybookWidget
                players={playingPlayers}
                activeTab={playbookTab}
                formations={formations}
                selectedFormationName={selectedFormationName}
                setSelectedFormationName={setSelectedFormationName}
                assignments={assignments}
                setAssignments={setAssignments}
                onFieldPlayers={onFieldPlayers}
                isLineupComplete={isLineupComplete}
                formationPositions={formationPositions}
                handleConfirm={handleConfirm}
                handleSlotClick={handleSlotClick}
                nextPlayNumber={playHistory.length + 1}
            />
        </div>
        {waveSubState.isOpen && modalRoot && ReactDOM.createPortal(
            <WaveSubModal
                isOpen={waveSubState.isOpen}
                onClose={() => setWaveSubState({ isOpen: false, stagedSlotIndex: null })}
                onConfirm={handleConfirmSubstitutions}
                allPlayers={playingPlayers}
                currentAssignments={assignments}
                formationPositions={formationPositions}
                stagedSlotIndex={waveSubState.stagedSlotIndex}
            />,
            modalRoot
        )}
      </>
    );
};

export default Dashboard;