import React, { useState, useRef, useEffect } from 'react';
import { SpinnerIcon } from './icons';
import { PlayerStatus } from '../types';
import { DEFAULT_PLAYER_IMAGE, ALL_POSITION_OPTIONS } from '../constants';
import { formatPosition } from '../utils';

interface AddPlayerModalProps {
    onClose: () => void;
    onAddPlayer: (player: { jerseyNumber: number; name: string; position: string; status: PlayerStatus }) => Promise<void>;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ onClose, onAddPlayer }) => {
    const [jersey, setJersey] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.Playing);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePositionTab, setActivePositionTab] = useState<'Offense' | 'Defense' | 'Specialists'>('Offense');

    const handleTogglePosition = (pos: string) => {
        setSelectedPositions(prev =>
            prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos].sort()
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const jerseyNum = parseInt(jersey, 10);
        if (!jerseyNum || !firstName.trim() || !lastName.trim()) {
            setError('Jersey, first name, and last name are required.');
            return;
        }
        setIsLoading(true);
        const name = `${lastName.trim()}, ${firstName.trim()}`;
        const position = selectedPositions.join(', ');
        await onAddPlayer({ 
            jerseyNumber: jerseyNum, 
            name, 
            position,
            status
        });
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="glass-effect rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--border-primary)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Add New Player</h2>
                </header>
                <main className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                            <label htmlFor="add-jerseyNumber" className="block text-sm font-medium text-[var(--text-secondary)]">Jersey #</label>
                            <input type="number" id="add-jerseyNumber" value={jersey} onChange={e => setJersey(e.target.value)} required className="mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="add-firstName" className="block text-sm font-medium text-[var(--text-secondary)]">First Name</label>
                            <input type="text" id="add-firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required className="mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]" />
                        </div>
                        <div>
                            <label htmlFor="add-lastName" className="block text-sm font-medium text-[var(--text-secondary)]">Last Name</label>
                            <input type="text" id="add-lastName" value={lastName} onChange={e => setLastName(e.target.value)} required className="mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]" />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Position(s) (Optional)</label>
                        <div className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md p-2 flex items-center flex-wrap gap-1.5 min-h-[44px] mt-1">
                            {selectedPositions.length > 0 ? (
                                selectedPositions.map(pos => (
                                    <span key={pos} className="bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold px-2 py-1 rounded-full">{formatPosition(pos)}</span>
                                ))
                            ) : (
                                <span className="text-[var(--text-secondary)] px-1">Select positions below...</span>
                            )}
                        </div>

                        <div className="mt-2 border border-[var(--border-primary)] rounded-lg">
                            <div className="flex border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] rounded-t-lg">
                                {ALL_POSITION_OPTIONS.map(group => (
                                    <button
                                        type="button"
                                        key={group.group}
                                        onClick={() => setActivePositionTab(group.group as any)}
                                        className={`flex-1 py-2 px-2 text-sm font-bold transition-colors duration-200 focus:outline-none first:rounded-tl-md last:rounded-tr-md ${activePositionTab === group.group ? 'bg-[var(--bg-tertiary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50'}`}
                                    >
                                        {group.group}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 bg-[var(--bg-tertiary)] rounded-b-lg">
                                {ALL_POSITION_OPTIONS.map(group => (
                                    <div key={group.group} className={`${activePositionTab === group.group ? 'block' : 'hidden'}`}>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                                            {group.positions.map(pos => (
                                                <label key={pos} className="flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPositions.includes(pos)}
                                                        onChange={() => handleTogglePosition(pos)}
                                                        className="h-4 w-4 rounded bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                                                    />
                                                    <span className="ml-2">{formatPosition(pos)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="add-status" className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
                        <select id="add-status" value={status} onChange={e => setStatus(e.target.value as PlayerStatus)} className="mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]">
                            {Object.values(PlayerStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
                </main>
                <footer className="p-4 border-t border-[var(--border-primary)] flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-primary)]">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:bg-gray-500">
                        {isLoading && <SpinnerIcon className="w-5 h-5" />}
                        {isLoading ? 'Adding...' : 'Add Player'}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AddPlayerModal;
