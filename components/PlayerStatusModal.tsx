import React, { useState, useRef, useEffect } from 'react';
import { Player, PlayerStatus } from '../types';
import { DEFAULT_PLAYER_IMAGE, ALL_POSITION_OPTIONS } from '../constants';
// FIX: Add TrashIcon for the delete button and correct the CameraIcon import.
import { StarIcon, SpinnerIcon, CameraIcon, TrashIcon } from './icons';
// FIX: Correct the broken import statement for useGameState.
import { useGameState } from '../contexts/GameStateContext';
import { formatPosition } from '../utils';

interface PlayerStatusModalProps {
    player: Player;
    onClose: () => void;
    onSave: (playerId: string, updates: Partial<Player>) => void;
    onDelete: (playerId: string) => void;
}

const PlayerStatusModal: React.FC<PlayerStatusModalProps> = ({ player, onClose, onSave, onDelete }) => {
    const [status, setStatus] = useState(player.status);
    const [jersey, setJersey] = useState(player.jerseyNumber.toString());
    const [name, setName] = useState(player.name);
    const [selectedPositions, setSelectedPositions] = useState<string[]>(player.position ? player.position.split(',').map(p => p.trim()) : []);
    const [imageUrl, setImageUrl] = useState(player.imageUrl || DEFAULT_PLAYER_IMAGE);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { handleSetPlayerAsStarter } = useGameState();
    const [activePositionTab, setActivePositionTab] = useState<'Offense' | 'Defense' | 'Specialists'>('Offense');

    const handleTogglePosition = (pos: string) => {
        setSelectedPositions(prev =>
            prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos].sort()
        );
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => setImageUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const updates: Partial<Player> = {};
        if (status !== player.status) updates.status = status;
        const jerseyNum = parseInt(jersey, 10);
        if (jerseyNum !== player.jerseyNumber) updates.jerseyNumber = jerseyNum;
        if (name !== player.name) updates.name = name;
        const position = selectedPositions.join(', ');
        if (position !== player.position) updates.position = position;
        if (imageUrl !== player.imageUrl) updates.imageUrl = imageUrl;
        
        await onSave(player.id, updates);
        setIsSaving(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${player.name}? This will remove them from all weeks and cannot be undone.`)) {
            onDelete(player.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="glass-effect rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Player</h2>
                    <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                </header>
                <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <img src={imageUrl} alt={name} className="w-24 h-24 rounded-full object-cover" />
                            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full border-2 border-[var(--bg-secondary)] hover:bg-gray-700">
                                <CameraIcon className="w-5 h-5 text-white" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        <div className="flex-grow space-y-4">
                            <div>
                                <label htmlFor="jerseyNumber" className="block text-sm font-medium text-[var(--text-secondary)]">Jersey #</label>
                                <input type="number" id="jerseyNumber" value={jersey} onChange={e => setJersey(e.target.value)} className="mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]" />
                            </div>
                            <div>
                                <label htmlFor="playerName" className="block text-sm font-medium text-[var(--text-secondary)]">Player Name</label>
                                <input type="text" id="playerName" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.values(PlayerStatus).map(s => (
                                <button key={s} onClick={() => setStatus(s)} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${status === s ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-primary)]'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Position(s)</label>
                        <div className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md p-2 flex items-center flex-wrap gap-1.5 min-h-[44px] mt-1">
                            {selectedPositions.length > 0 ? (
                                selectedPositions.map(pos => (
                                    <span key={pos} className="bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold px-2 py-1 rounded-full">{formatPosition(pos)}</span>
                                ))
                            ) : <span className="text-[var(--text-secondary)] px-1">No positions assigned...</span>}
                        </div>

                        <div className="mt-2 border border-[var(--border-primary)] rounded-lg">
                            <div className="flex border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] rounded-t-lg">
                                {ALL_POSITION_OPTIONS.map(group => (
                                    <button type="button" key={group.group} onClick={() => setActivePositionTab(group.group as any)} className={`flex-1 py-2 px-2 text-sm font-bold transition-colors ${activePositionTab === group.group ? 'bg-[var(--bg-tertiary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50'}`}>{group.group}</button>
                                ))}
                            </div>
                            <div className="p-4 bg-[var(--bg-tertiary)] rounded-b-lg">
                                {ALL_POSITION_OPTIONS.map(group => (
                                    <div key={group.group} className={`${activePositionTab === group.group ? 'grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3' : 'hidden'}`}>
                                        {group.positions.map(pos => (
                                            <label key={pos} className="flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                                                <input type="checkbox" checked={selectedPositions.includes(pos)} onChange={() => handleTogglePosition(pos)} className="h-4 w-4 rounded bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]" />
                                                <span className="ml-2">{formatPosition(pos)}</span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-[var(--border-primary)] flex justify-between items-center">
                     <button onClick={() => handleSetPlayerAsStarter(player.id)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-300 font-bold rounded-lg hover:bg-yellow-500/30 text-sm">
                        <StarIcon className="w-5 h-5" /> Set as Starter
                    </button>
                    <div className="space-x-2">
                        <button onClick={onClose} className="px-6 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-primary)]">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 w-32 px-6 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:bg-gray-500">
                            {isSaving ? <SpinnerIcon className="w-5 h-5" /> : 'Save'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PlayerStatusModal;
