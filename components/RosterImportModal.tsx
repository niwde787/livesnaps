import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { SpinnerIcon } from './icons';
import { PlayerStatus } from '../types';
import { normalizePosition } from '../utils';

declare const XLSX: any;

interface ImportedPlayer {
    jerseyNumber: number;
    name: string;
    position: string;
    status: PlayerStatus;
}

interface RosterImportModalProps {
    onClose: () => void;
    onImport: (players: ImportedPlayer[]) => Promise<void>;
}

const RosterImportModal: React.FC<RosterImportModalProps> = ({ onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
            setError(null);
        }
    };

    const handleDownloadTemplate = () => {
        const ws_data = [
            ["Jersey Number", "First Name", "Last Name", "Position (Optional)", "Status"],
            [1, "John", "Doe", "QB", "Playing"],
            [2, "Jane", "Smith", "LT,LG", "Injured"],
            ["", "", "", "", "(Playing, Injured, Absent, Discipline)"]
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Roster");
        XLSX.writeFile(wb, "Roster_Template.xlsx");
    };

    const handleProcessFile = useCallback(async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: ["jerseyNumber", "firstName", "lastName", "position", "status"], range: 1 });

            const importedPlayers: ImportedPlayer[] = [];
            for (const row of rows) {
                const jerseyNumber = parseInt(row.jerseyNumber, 10);
                
                // Only process rows that have at least a jersey number to avoid empty helper rows.
                if (Number.isFinite(jerseyNumber)) {
                    const firstName = row.firstName?.toString().trim();
                    const lastName = row.lastName?.toString().trim();
                    const rawPosition = row.position?.toString().trim() || '';
                    const position = normalizePosition(rawPosition);
                    const statusStr = row.status?.toString().trim();

                    if (!firstName || !lastName || !statusStr) {
                         throw new Error(`Row for Jersey #${jerseyNumber} is missing required data. Please fill in First Name, Last Name, and Status.`);
                    }

                    const name = `${lastName}, ${firstName}`;
                    
// FIX: Using String() to ensure toLowerCase() is called on a string.
                    const validStatus = Object.values(PlayerStatus).find(s => String(s).toLowerCase() === String(statusStr).toLowerCase());
                    if (!validStatus) {
                        throw new Error(`Invalid status "${statusStr}" for jersey #${jerseyNumber}. Valid statuses are: Playing, Injured, Absent, Discipline.`);
                    }

                    importedPlayers.push({ jerseyNumber, name, position, status: validStatus });
                }
            }

            if (importedPlayers.length === 0) {
                throw new Error("No valid player data found in the file. Ensure the file is not empty and columns are correctly filled.");
            }

            await onImport(importedPlayers);
            onClose();

        } catch (e: any) {
            setError(e.message || "An unexpected error occurred while processing the file.");
        } finally {
            setIsLoading(false);
        }
    }, [file, onImport, onClose]);

    const modalRoot = document.getElementById('modal-root') || document.body;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold text-white">Import Roster</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-gray-400 leading-relaxed">Import players from an Excel (.xlsx, .xls) or CSV file. The file should have columns: 'Jersey Number', 'First Name', 'Last Name', 'Position', and 'Status'.</p>
                    
                    <button onClick={handleDownloadTemplate} className="w-full justify-center flex items-center gap-2 px-4 py-3 bg-white/5 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-colors border border-white/5">
                        Download Template
                    </button>

                    <div className="space-y-2">
                        <label htmlFor="roster-file-upload" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload File</label>
                        <div className="relative">
                            <input id="roster-file-upload" type="file" onChange={handleFileChange} accept=".xlsx, .xls, .csv" className="block w-full text-[11px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[var(--accent-primary)] file:text-white hover:file:bg-[var(--accent-primary-hover)] file:transition-colors file:cursor-pointer" />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-[11px] text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg font-medium" role="alert">
                            {error}
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t border-white/10 flex justify-end gap-2 bg-white/5">
                    <button onClick={onClose} className="px-4 py-2 bg-white/5 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                    <button onClick={handleProcessFile} disabled={!file || isLoading} className="flex items-center justify-center gap-2 min-w-[120px] px-4 py-2 bg-[var(--accent-primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[var(--accent-primary-hover)] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                        {isLoading ? <SpinnerIcon className="w-4 h-4" /> : 'Import & Merge'}
                    </button>
                </footer>
            </div>
        </div>,
        modalRoot
    );
};

export default RosterImportModal;
