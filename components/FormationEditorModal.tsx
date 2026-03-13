import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Player, PlayType, Formation, FormationPosition } from '../types';
import { OFFENSE_POSITION_LABELS, DEFENSE_POSITION_LABELS, SPECIAL_TEAMS_POSITION_LABELS, DEFAULT_FORMATION_COORDINATES } from '../constants';

interface DraggablePosition extends FormationPosition {
    id: number;
}

interface FormationEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (playType: PlayType, formationName: string, formation: Formation, originalFormationName?: string) => void;
    onDelete: (playType: PlayType, formationName: string) => void;
    playType: PlayType;
    allPlayers: Player[];
    isCreating: boolean;
    formationToEdit?: Formation;
    originalFormationName?: string;
}

const FootballFieldBackground: React.FC = () => (
    <div className="absolute inset-0 bg-green-900/50 border-2 border-[var(--border-primary)] rounded-md overflow-hidden text-white/40 select-none">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.1)_0,rgba(0,0,0,0.1)_8%,transparent_8%,transparent_16%)]" />
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(yard => (
            <div key={yard} className="absolute top-0 bottom-0 w-px bg-white/30" style={{ left: `${yard}%` }} />
        ))}
    </div>
);

const PositionMarker: React.FC<{
    position: DraggablePosition;
    onDrag: (id: number, newPos: { top: string, left: string }) => void;
    fieldRef: React.RefObject<HTMLDivElement>;
}> = ({ position, onDrag, fieldRef }) => {

    const handleDragStart = useCallback((startX: number, startY: number) => {
        const field = fieldRef.current;
        if (!field) return;

        const fieldRect = field.getBoundingClientRect();
        const initialLeft = (parseFloat(position.left) / 100) * fieldRect.width;
        const initialTop = (parseFloat(position.top) / 100) * fieldRect.height;

        const handleDragMove = (currentX: number, currentY: number) => {
            const dx = currentX - startX;
            const dy = currentY - startY;
            
            const newLeftPx = initialLeft + dx;
            const newTopPx = initialTop + dy;

            const newLeftPercent = Math.max(0, Math.min(100, (newLeftPx / fieldRect.width) * 100));
            const newTopPercent = Math.max(0, Math.min(100, (newTopPx / fieldRect.height) * 100));

            onDrag(position.id, { top: `${newTopPercent}%`, left: `${newLeftPercent}%` });
        };

        const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                e.preventDefault(); // Prevent page scroll
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        
        const handleDragEnd = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleDragEnd);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);

    }, [fieldRef, onDrag, position.id, position.left, position.top]);
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleDragStart(e.clientX, e.clientY);
    };
    
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches[0]) {
            handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    return (
        <div
            style={{ top: position.top, left: position.left }}
            className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-20"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="w-8 h-8 bg-[var(--accent-warning)] border-2 border-black rounded-full flex items-center justify-center text-black font-bold text-xs shadow-lg">
                {position.label || '?'}
            </div>
        </div>
    );
};

const DEFAULT_ELEVEN_POSITIONS: Omit<DraggablePosition, 'id'>[] = [
    // Linemen
    { label: '', left: '50%', top: '52%' }, // C
    { label: '', left: '45%', top: '52%' }, // LG
    { label: '', left: '55%', top: '52%' }, // RG
    { label: '', left: '40%', top: '52%' }, // LT
    { label: '', left: '60%', top: '52%' }, // RT
    // QB/RB
    { label: '', left: '50%', top: '65%' }, // QB
    { label: '', left: '55%', top: '70%' }, // RB
    // Receivers
    { label: '', left: '10%', top: '50%' }, // WR
    { label: '', left: '90%', top: '50%' }, // WR
    { label: '', left: '30%', top: '55%' }, // Slot
    { label: '', left: '70%', top: '55%' }, // Slot
];

let nextId = 0;

const FormationEditorModal: React.FC<FormationEditorModalProps> = ({
    isOpen, onClose, onSave, onDelete, playType, allPlayers, isCreating, formationToEdit, originalFormationName
}) => {
    const [name, setName] = useState('');
    const [positions, setPositions] = useState<DraggablePosition[]>([]);
    const [assignments, setAssignments] = useState<(number | null)[]>([]); // Jersey numbers
    const fieldRef = useRef<HTMLDivElement>(null);

    const positionLabels = useMemo(() => {
        switch(playType) {
            case PlayType.Offense: return OFFENSE_POSITION_LABELS;
            case PlayType.Defense: return DEFENSE_POSITION_LABELS;
            case PlayType.SpecialTeams: return SPECIAL_TEAMS_POSITION_LABELS;
            default: return [];
        }
    }, [playType]);

    useEffect(() => {
        if (isOpen) {
            if (isCreating) {
                setName('');
                const initialPositions = DEFAULT_ELEVEN_POSITIONS.map(p => ({ ...p, id: nextId++ }));
                setPositions(initialPositions);
                setAssignments(new Array(11).fill(null));
            } else {
                setName(originalFormationName || '');
                const initialPositions = (formationToEdit?.positions || []).map(p => ({ ...p, id: nextId++ }));
                setPositions(initialPositions);

                const playerJerseyMap = new Map(allPlayers.map(p => [p.id, p.jerseyNumber]));
                const initialAssignments = (formationToEdit?.presetPlayerIds || []).map(id => id ? playerJerseyMap.get(id) ?? null : null);
                
                // Ensure assignments array matches positions array length
                const syncedAssignments = initialPositions.map((_, index) => initialAssignments[index] || null);
                setAssignments(syncedAssignments);
            }
        }
    }, [isOpen, isCreating, formationToEdit, originalFormationName, allPlayers]);

    const handleUpdatePosition = useCallback((id: number, newPos: { top: string, left: string }) => {
        setPositions(currentPositions =>
            currentPositions.map(p => (p.id === id ? Object.assign({}, p, newPos) : p))
        );
    }, []);
    
    const handleAddPosition = (label: string) => {
        const finalLabel = label === 'CUSTOM' ? '' : label;
        const coords = DEFAULT_FORMATION_COORDINATES[label];
        let top: number, left: number;
    
        if (coords) {
            // Add a slight random offset to prevent exact stacking if the user adds the same position twice
            top = parseFloat(coords.top) + (Math.random() * 2 - 1);
            left = parseFloat(coords.left) + (Math.random() * 2 - 1);
        } else {
            // Fallback for custom or unmapped labels
            const topOffset = Math.random() * 20 - 10;
            const leftOffset = Math.random() * 40 - 20;
            top = 50 + topOffset;
            left = 50 + leftOffset;
        }
    
        setPositions(prev => [...prev, { id: nextId++, label: finalLabel, top: `${top}%`, left: `${left}%` }]);
        setAssignments(prev => [...prev, null]);
    };

    const handleRemovePosition = (index: number) => {
        setPositions(prev => prev.filter((_, i) => i !== index));
        setAssignments(prev => prev.filter((_, i) => i !== index));
    };

    const handleLabelChange = (index: number, newLabel: string) => {
        const upperCaseLabel = newLabel.toUpperCase();
        const coords = DEFAULT_FORMATION_COORDINATES[upperCaseLabel];

        setPositions(prev => 
            prev.map((p, i) => {
                if (i === index) {
                    const updatedPosition = { ...p, label: newLabel };
                    if (coords) {
                        updatedPosition.top = coords.top;
                        updatedPosition.left = coords.left;
                    }
                    return updatedPosition;
                }
                return p;
            })
        );
    };
    
    const handleAssignmentChange = (index: number, jersey: string) => {
        const jerseyNum = jersey === '' ? null : parseInt(jersey, 10);
        setAssignments(prev => {
            const newAssignments = [...prev];
            // If assigning a player (not unassigning)
            if (jerseyNum !== null) {
                // Find if this player is assigned elsewhere and unassign them
                const existingIndex = newAssignments.findIndex(j => j === jerseyNum);
                if (existingIndex !== -1 && existingIndex !== index) {
                    newAssignments[existingIndex] = null;
                }
            }
            // Set the new assignment for the current index
            newAssignments[index] = jerseyNum;
            return newAssignments;
        });
    };

    const handleSave = () => {
        const playerIdMap = new Map(allPlayers.map(p => [p.jerseyNumber, p.id]));
        const finalFormation: Formation = {
            positions: positions.map(({ id, ...rest }) => rest), // remove internal id
            presetPlayerIds: assignments.map(jersey => jersey ? playerIdMap.get(jersey) || null : null),
        };
        onSave(playType, name, finalFormation, originalFormationName);
    };

    const handleDelete = () => {
        if (originalFormationName && window.confirm(`Are you sure you want to delete the "${originalFormationName}" formation? This cannot be undone.`)) {
            onDelete(playType, originalFormationName);
        }
    };

    if (!isOpen) return null;

    const sortedPlayers = [...allPlayers].sort((a,b) => a.jerseyNumber - b.jerseyNumber);
    const assignedJerseys = new Set(assignments.filter((j): j is number => j !== null));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="glass-effect rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--border-primary)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        {isCreating ? 'Create' : 'Edit'} {playType} Formation
                    </h2>
                </header>
                <main className="flex-grow p-4 overflow-hidden flex flex-col md:flex-row gap-4">
                    {/* Left Panel: Settings */}
                    <div className="w-full md:w-1/3 lg:w-1/4 bg-black/20 p-3 rounded-lg flex flex-col">
                        <div className="space-y-3 flex-shrink-0">
                            <div>
                                <label htmlFor="formationName" className="block text-sm font-medium text-[var(--text-secondary)]">Formation Name</label>
                                <input
                                    id="formationName"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="add-position-select" className="block text-sm font-medium text-[var(--text-secondary)]">Add Position</label>
                                <select
                                    id="add-position-select"
                                    value=""
                                    onChange={e => {
                                        if (e.target.value) {
                                            handleAddPosition(e.target.value);
                                            e.target.value = ''; // Reset select
                                        }
                                    }}
                                    className="mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]"
                                >
                                    <option value="" disabled>- Select a Position -</option>
                                    {positionLabels.map(label => (
                                        <option key={label} value={label}>{label}</option>
                                    ))}
                                    <option value="CUSTOM">Custom Label</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex-grow overflow-y-auto pr-2 space-y-2">
                            {positions.map((pos, index) => {
                                const currentPlayerJersey = assignments[index];
                                const availablePlayersForSlot = sortedPlayers.filter(p =>
                                    !assignedJerseys.has(p.jerseyNumber) || p.jerseyNumber === currentPlayerJersey
                                );

                                return (
                                <div key={pos.id} className="bg-[var(--bg-secondary)] p-2 rounded-md grid grid-cols-3 gap-2 items-center">
                                    <input
                                        type="text"
                                        list="position-labels-datalist"
                                        value={pos.label}
                                        onChange={e => handleLabelChange(index, e.target.value)}
                                        className="col-span-1 w-full bg-[var(--border-primary)] border-gray-500 rounded px-2 py-1 text-xs text-[var(--text-primary)]"
                                        placeholder="- Label -"
                                    />
                                    <select
                                    value={currentPlayerJersey || ''}
                                    onChange={(e) => handleAssignmentChange(index, e.target.value)}
                                    className="col-span-1 w-full bg-[var(--border-primary)] border-gray-500 rounded px-2 py-1 text-xs text-[var(--text-primary)]"
                                    >
                                        <option value="">- Player -</option>
                                        {availablePlayersForSlot.map(p => <option key={p.id} value={p.jerseyNumber}>#{p.jerseyNumber} {p.name.split(',')[0]}</option>)}
                                    </select>
                                    <button onClick={() => handleRemovePosition(index)} className="col-span-1 w-full bg-[var(--accent-danger)] hover:bg-[var(--accent-danger-hover)] text-white text-xs py-1 rounded">
                                        Remove
                                    </button>
                                </div>
                                );
                            })}
                        </div>
                        <datalist id="position-labels-datalist">
                            {positionLabels.map(label => (
                                <option key={label} value={label} />
                            ))}
                        </datalist>
                    </div>
                    {/* Right Panel: Visual Editor */}
                    <div className="flex-grow relative" ref={fieldRef}>
                        <FootballFieldBackground />
                        {positions.map(pos => (
                            <PositionMarker key={pos.id} position={pos} onDrag={handleUpdatePosition} fieldRef={fieldRef} />
                        ))}
                    </div>
                </main>
                <footer className="p-4 border-t border-[var(--border-primary)] flex justify-between items-center">
                    <div>
                        {!isCreating && (
                            <button
                                onClick={handleDelete}
                                className="px-6 py-2 bg-[var(--accent-danger)] text-white font-bold rounded-lg hover:bg-[var(--accent-danger-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-danger)]"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={onClose} className="px-6 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-primary)]">Cancel</button>
                        <button onClick={handleSave} disabled={!name || positions.length === 0} className="px-6 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:bg-gray-500 disabled:cursor-not-allowed">Save Formation</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default FormationEditorModal;