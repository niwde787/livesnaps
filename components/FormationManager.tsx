import React, { useState, useMemo } from 'react';
import { Formation, PlayType, SelectablePlayType, FormationCollection } from '../types';
import { EditIcon, PlusCircleIcon, ImportIcon, DuplicateIcon } from './icons';
import { useGameState } from '../contexts/GameStateContext';

const getPlayTypeStyles = (playType: PlayType) => {
    switch (playType) {
        case PlayType.Offense:
            return {
                borderColor: 'border-[var(--accent-secondary)]',
                textColor: 'text-[var(--accent-secondary)]',
            };
        case PlayType.Defense:
            return {
                borderColor: 'border-[var(--accent-defense)]',
                textColor: 'text-[var(--accent-defense)]',
            };
        case PlayType.SpecialTeams:
        default:
            return {
                borderColor: 'border-[var(--accent-special)]',
                textColor: 'text-[var(--accent-special)]',
            };
    }
}

const FormationCard: React.FC<{
    name: string;
    formation: Formation;
    onEdit: () => void;
    onDuplicate: () => void;
    styles: ReturnType<typeof getPlayTypeStyles>;
}> = ({ name, onEdit, onDuplicate, formation, styles }) => {
    return (
        <div className={`relative group bg-[var(--bg-primary)] border-l-4 ${styles.borderColor} rounded-lg p-4 flex flex-col justify-between h-36 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)] truncate" title={name}>{name}</h4>
                <p className={`text-sm font-semibold ${styles.textColor}`}>{formation.positions.length} Positions</p>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                    onClick={onDuplicate}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-md hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]"
                    aria-label={`Duplicate ${name} formation`}
                >
                    <DuplicateIcon className="w-3 h-3" />
                    Copy
                </button>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-md hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]"
                    aria-label={`Edit ${name} formation`}
                >
                    <EditIcon className="w-3 h-3" />
                    Edit
                </button>
            </div>
        </div>
    );
};

const CreateFormationCard: React.FC<{
    onClick: () => void;
}> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`border-2 border-dashed border-[var(--border-primary)] rounded-lg h-36 flex flex-col items-center justify-center text-center p-4 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all duration-300 transform hover:-translate-y-1 group`}
        >
            <PlusCircleIcon className="w-8 h-8 mb-2 transition-transform group-hover:scale-110" />
            <span className="font-bold text-base">Create New</span>
        </button>
    );
};


const FormationManager: React.FC = () => {
    const {
        offenseFormations,
        defenseFormations,
        specialTeamsFormations,
        handleEditFormation,
        handleCreateFormation,
        handleTriggerImport,
        handleDuplicateFormation,
    } = useGameState();
    
    const [activeTab, setActiveTab] = useState<SelectablePlayType>(PlayType.Offense);

    const { formations, styles, onCreate } = useMemo(() => {
        switch (activeTab) {
            case PlayType.Defense:
                return {
                    formations: defenseFormations,
                    styles: getPlayTypeStyles(PlayType.Defense),
                    onCreate: () => handleCreateFormation(PlayType.Defense),
                };
            case PlayType.SpecialTeams:
                return {
                    formations: specialTeamsFormations,
                    styles: getPlayTypeStyles(PlayType.SpecialTeams),
                    onCreate: () => handleCreateFormation(PlayType.SpecialTeams),
                };
            case PlayType.Offense:
            default:
                return {
                    formations: offenseFormations,
                    styles: getPlayTypeStyles(PlayType.Offense),
                    onCreate: () => handleCreateFormation(PlayType.Offense),
                };
        }
    }, [activeTab, offenseFormations, defenseFormations, specialTeamsFormations, handleCreateFormation]);

    const sortedFormations = Object.entries(formations).sort(([a], [b]) => a.localeCompare(b));
    
    const TABS: SelectablePlayType[] = [PlayType.Offense, PlayType.Defense, PlayType.SpecialTeams];
    const tabButtonStyle = "flex-1 py-3 px-2 text-sm font-bold border-b-2 transition-colors duration-200 focus:outline-none focus:bg-white/5";
    const inactiveTabStyle = "border-transparent text-[var(--text-secondary)] hover:text-white";

    return (
        <div className="bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-primary)]">
            <div className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Formation Playbook</h2>
                <button
                    onClick={() => handleTriggerImport('playbook')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-md hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]"
                >
                    <ImportIcon className="w-4 h-4" /> Import Playbook
                </button>
            </div>

            <div className="px-4 border-b border-[var(--border-primary)]">
                <nav className="flex -mb-px">
                    {TABS.map(tab => {
                        const tabStyles = getPlayTypeStyles(tab);
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${tabButtonStyle} ${isActive ? `${tabStyles.textColor} border-current` : inactiveTabStyle}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortedFormations.map(([name, formation]) => (
                        <FormationCard
                            key={name}
                            name={name}
                            formation={formation}
                            onEdit={() => handleEditFormation(activeTab, name)}
                            onDuplicate={() => handleDuplicateFormation(activeTab, name)}
                            styles={styles}
                        />
                    ))}
                    <CreateFormationCard onClick={onCreate} />
                </div>
            </div>
        </div>
    );
};

export default FormationManager;