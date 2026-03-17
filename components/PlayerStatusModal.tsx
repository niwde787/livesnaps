import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

    const modalRoot = document.getElementById('modal-root') || document.body;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold text-white">Edit Player</h2>
                    <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
                </header>
                <main className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-start gap-5">
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white/20 overflow-hidden">
                                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                            </div>
                            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-[#1C2128] p-1.5 rounded-full border border-white/20 hover:bg-[#2D333B] transition-colors shadow-lg">
                                <CameraIcon className="w-4 h-4 text-white" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        <div className="flex-grow space-y-3">
                            <div>
                                <label htmlFor="jerseyNumber" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Jersey #</label>
                                <input type="number" id="jerseyNumber" value={jersey} onChange={e => setJersey(e.target.value)} className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors" />
                            </div>
                            <div>
                                <label htmlFor="playerName" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Player Name</label>
                                <input type="text" id="playerName" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.values(PlayerStatus).map(s => (
                                <button key={s} onClick={() => setStatus(s)} className={`px-2 py-2 text-[10px] font-bold rounded-lg transition-all ${status === s ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position(s)</label>
                        <div className="w-full bg-black/20 border border-white/10 rounded-lg p-2 flex items-center flex-wrap gap-1.5 min-h-[40px] mt-1 text-sm">
                            {selectedPositions.length > 0 ? (
                                selectedPositions.map(pos => (
                                    <span key={pos} className="bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--accent-primary)]/30">{formatPosition(pos)}</span>
                                ))
                            ) : <span className="text-gray-500 text-xs px-1">No positions assigned...</span>}
                        </div>

                        <div className="mt-3 border border-white/10 rounded-xl overflow-hidden bg-black/10">
                            <div className="flex border-b border-white/10 bg-white/5">
                                {ALL_POSITION_OPTIONS.map(group => (
                                    <button type="button" key={group.group} onClick={() => setActivePositionTab(group.group as any)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${activePositionTab === group.group ? 'bg-white/10 text-[var(--accent-primary)]' : 'text-gray-500 hover:text-gray-300'}`}>{group.group}</button>
                                ))}
                            </div>
                            <div className="p-4">
                                {ALL_POSITION_OPTIONS.map(group => (
                                    <div key={group.group} className={`${activePositionTab === group.group ? 'grid grid-cols-3 gap-y-3' : 'hidden'}`}>
                                        {group.positions.map(pos => (
                                            <label key={pos} className="flex items-center text-[11px] text-gray-400 hover:text-white cursor-pointer group">
                                                <input type="checkbox" checked={selectedPositions.includes(pos)} onChange={() => handleTogglePosition(pos)} className="h-3.5 w-3.5 rounded bg-black/40 border-white/20 text-[var(--accent-primary)] focus:ring-0 transition-all" />
                                                <span className="ml-2 group-hover:translate-x-0.5 transition-transform">{formatPosition(pos)}</span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
                     <button onClick={() => handleSetPlayerAsStarter(player.id)} className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-all text-[10px] uppercase tracking-wider shadow-lg shadow-yellow-500/20">
                        <StarIcon className="w-4 h-4" /> Set as Starter
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-white/5 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 min-w-[80px] px-4 py-2 bg-[var(--accent-primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[var(--accent-primary-hover)] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                            {isSaving ? <SpinnerIcon className="w-4 h-4" /> : 'Save'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>,
        modalRoot
    );
};

export default PlayerStatusModal;
