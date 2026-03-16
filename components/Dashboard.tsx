import React, { useMemo, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PlaybookWidget from './PlaybookWidget';
import Scoreboard from './Scoreboard';
import WaveSubModal from './WaveSubModal';
import { Player, FormationCollection, PlayType, PlayerStatus, SelectablePlayType } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { StarIcon } from './icons';

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
        playbookTab, setPlaybookTab, selectedFormationName, handleSelectFormation,
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
                handleSelectFormation(firstFormationName);
            } else {
                handleSelectFormation('');
            }
        }
    }, [formations, selectedFormationName, handleSelectFormation]);

    const formationData = useMemo(() => formations[selectedFormationName], [formations, selectedFormationName]);
    const formationPositions = useMemo(() => formationData?.positions || [], [formationData]);

    useEffect(() => {
        if (!selectedFormationName) {
            setLineupIds([]);
            return;
        }

        const currentLineup = currentLineups[selectedFormationName];
        if (currentLineup) {
            const finalIds = new Array(formationPositions.length).fill(null);
            currentLineup.forEach((id, index) => {
                if (index < finalIds.length) {
                    finalIds[index] = id;
                }
            });
            setLineupIds(finalIds);
        } else {
            setLineupIds(new Array(formationPositions.length).fill(null));
        }
    }, [selectedFormationName, formationPositions, currentLineups]);

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
                setSelectedFormationName={handleSelectFormation}
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
