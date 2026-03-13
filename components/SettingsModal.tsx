import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Theme, CustomTheme, AgeDivision, AgeDivisionLabels, Play } from '../types';
import { signOut } from '../firebase';
import { SpinnerIcon, TrashIcon, Icon } from './icons';
import { useGameState } from '../contexts/GameStateContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEMES: { value: Theme; label: string }[] = [
    { value: 'dark', label: 'Classic Dark' },
    { value: 'light', label: 'Daylight' },
    { value: 'material-you', label: 'Material You' },
    { value: 'custom', label: 'Custom' },
];

const customColorProperties: { key: keyof CustomTheme; label: string }[] = [
    { key: 'bgPrimary', label: 'Primary BG' },
    { key: 'bgSecondary', label: 'Secondary BG' },
    { key: 'textPrimary', label: 'Primary Text' },
    { key: 'textSecondary', label: 'Secondary Text' },
    { key: 'borderPrimary', label: 'Border' },
    { key: 'accentPrimary', label: 'Primary Accent' },
    { key: 'accentSecondary', label: 'Offense Accent' },
    { key: 'accentDefense', label: 'Defense Accent' },
    { key: 'accentSpecial', label: 'Special Teams Accent' },
];

interface ParsedIcon {
    id: string;
    innerHTML: string;
    attributes: Record<string, string>;
}

interface DiagnosticResult {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    details: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { 
        isGeneratingDemo, handleLoadDemoData, isSigningOut, handleSignOut, handleClearCacheAndSignOut, 
        isCheckingForUpdate, handleCheckForUpdate, isResettingFormations, handleResetAllFormations,
        fieldLogoUrl, handleSaveFieldLogo,
        theme, handleThemeChange,
        teamName, teamCity, coachName, handleTeamInfoChange,
        ageDivision, handleAgeDivisionChange,
        customTheme, handleCustomThemeChange,
        customIconSheet, defaultIconSheet, handleSaveCustomIconSheet,
        showToast,
        user, players, playHistory, offenseFormations, defenseFormations, specialTeamsFormations, syncState
    } = useGameState();

    const [logoUrl, setLogoUrl] = useState(fieldLogoUrl);
    const [localTeamName, setLocalTeamName] = useState(teamName);
    const [localTeamCity, setLocalTeamCity] = useState(teamCity);
    const [localCoachName, setLocalCoachName] = useState(coachName);
    const [localAgeDivision, setLocalAgeDivision] = useState(ageDivision);
    const [localCustomTheme, setLocalCustomTheme] = useState(customTheme);
    const [localIconSheet, setLocalIconSheet] = useState('');
    const [isValidImage, setIsValidImage] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const iconFileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'account' | 'appearance' | 'icons' | 'health'>('general');
    
    // State for the new Icon Editor
    const [parsedIcons, setParsedIcons] = useState<ParsedIcon[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<ParsedIcon | null>(null);
    const [editedIconCode, setEditedIconCode] = useState('');

    // State for Diagnostics
    const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
    const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);


    useEffect(() => {
        if (isOpen) {
            setLogoUrl(fieldLogoUrl);
            setLocalTeamName(teamName);
            setLocalTeamCity(teamCity);
            setLocalCoachName(coachName);
            setLocalAgeDivision(ageDivision);
            setLocalCustomTheme(customTheme);
            const currentSheet = customIconSheet || defaultIconSheet;
            setLocalIconSheet(currentSheet);

            // Parse icons when modal opens and is on the right tab
            if (currentSheet) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(currentSheet, 'image/svg+xml');
                const symbols = doc.querySelectorAll('symbol');
                const icons = Array.from(symbols).map(symbol => {
                    const attributes: Record<string, string> = {};
                    for (const attr of Array.from(symbol.attributes)) {
                        if (attr.name !== 'id') {
                            attributes[attr.name] = attr.value;
                        }
                    }
                    return {
                        id: symbol.id,
                        innerHTML: symbol.innerHTML,
                        attributes: attributes
                    };
                });
                setParsedIcons(icons);
            }
        }
    }, [isOpen, fieldLogoUrl, teamName, teamCity, coachName, ageDivision, customTheme, customIconSheet, defaultIconSheet]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/svg+xml', 'image/png'].includes(file.type)) {
            setIsValidImage(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            setLogoUrl(url);
            setIsValidImage(true);
        };
        reader.onerror = () => {
            setIsValidImage(false);
        }
        reader.readAsDataURL(file);
    };

    const handleSaveChanges = () => {
        handleSaveFieldLogo(logoUrl);
        handleTeamInfoChange(localTeamName, localTeamCity, localCoachName);
        if (localAgeDivision) {
            handleAgeDivisionChange(localAgeDivision);
        }
        if (theme === 'custom') {
            handleCustomThemeChange(localCustomTheme);
        }
        handleSaveCustomIconSheet(localIconSheet);
        onClose();
    };

    const handleResetLogo = () => {
        setLogoUrl('');
        setIsValidImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImageError = () => {
        setIsValidImage(false);
    };

    const handleColorChange = (key: keyof CustomTheme, value: string) => {
        setLocalCustomTheme(prev => ({ ...prev, [key]: value }));
    };

    const handleIconSelect = (icon: ParsedIcon) => {
        setSelectedIcon(icon);
        setEditedIconCode(icon.innerHTML);
    };

    const handleIconFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        if (file.type !== 'image/svg+xml') {
            showToast('Please upload a valid .svg file.', 'error');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) {
                    throw new Error('File content is empty.');
                }
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'image/svg+xml');
                const svgElement = doc.querySelector('svg');
    
                if (!svgElement || doc.querySelector('parsererror')) {
                    throw new Error('Invalid SVG file. Could not find <svg> tag or file is malformed.');
                }
                
                const innerHTML = svgElement.innerHTML;
                setEditedIconCode(innerHTML);
                showToast('SVG content loaded into editor. Click "Save Icon Changes" to apply.', 'info');
            } catch (err: any) {
                showToast(`Failed to parse SVG: ${err.message}`, 'error');
            }
        };
        reader.onerror = () => {
            showToast('Failed to read the selected file.', 'error');
        };
        reader.readAsText(file);
    
        if(event.target) {
            event.target.value = '';
        }
    };
    
    const handleDownloadIcon = () => {
        if (!selectedIcon) return;
    
        const attributesToInclude = ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'];
    
        const svgAttributes = Object.entries(selectedIcon.attributes)
            .filter(([key]) => attributesToInclude.includes(key) || key.startsWith('data-'))
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');

        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" ${svgAttributes}>${editedIconCode}</svg>`;
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedIcon.id}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSaveIconCode = () => {
        if (!selectedIcon) return;
    
        const parser = new DOMParser();
        const doc = parser.parseFromString(localIconSheet, 'image/svg+xml');
        const symbolToUpdate = doc.getElementById(selectedIcon.id);
    
        if (symbolToUpdate) {
            symbolToUpdate.innerHTML = editedIconCode;
            const serializer = new XMLSerializer();
            const newSvgString = serializer.serializeToString(doc);
            setLocalIconSheet(newSvgString);
        }
    
        setSelectedIcon(null);
        setEditedIconCode('');
    };

    const runSystemDiagnostics = async () => {
        setIsRunningDiagnostics(true);
        setDiagnosticResults([]);
        const results: DiagnosticResult[] = [];

        // Simulate analytical delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // 1. Connectivity
        if (navigator.onLine) {
            results.push({ name: 'Internet Connection', status: 'pass', details: 'Online' });
        } else {
            results.push({ name: 'Internet Connection', status: 'fail', details: 'Offline' });
        }

        // 2. Firebase Sync
        if (syncState === 'synced' || syncState === 'idle') {
            results.push({ name: 'Database Sync', status: 'pass', details: 'Connected & Synced' });
        } else if (syncState === 'syncing') {
            results.push({ name: 'Database Sync', status: 'warn', details: 'Sync in progress...' });
        } else {
            results.push({ name: 'Database Sync', status: 'fail', details: 'Offline / Error' });
        }

        // 3. User Data
        if (user && user.uid) {
            results.push({ name: 'User Authentication', status: 'pass', details: `Authenticated as ${user.email || 'Guest'}` });
        } else {
            results.push({ name: 'User Authentication', status: 'fail', details: 'No active session' });
        }

        // 4. Roster Integrity
        if (players.length > 0) {
            const missingPositions = players.filter(p => !p.position).length;
            const playersWithoutIds = players.filter(p => !p.id).length;
            
            if (playersWithoutIds > 0) {
                results.push({ name: 'Roster Data', status: 'fail', details: `Critical: ${playersWithoutIds} players missing IDs` });
            } else if (missingPositions > 0) {
                results.push({ name: 'Roster Data', status: 'warn', details: `${players.length} players loaded, ${missingPositions} missing positions` });
            } else {
                results.push({ name: 'Roster Data', status: 'pass', details: `${players.length} players loaded correctly` });
            }
        } else {
            results.push({ name: 'Roster Data', status: 'warn', details: 'Roster is empty' });
        }

        // 5. Play History Integrity (Deep Scan)
        if (playHistory.length > 0) {
            let corruptedPlays = 0;
            let timeAnomalies = 0;
            
            playHistory.forEach((play, index) => {
                if (!play.type || !play.playResult) corruptedPlays++;
                // Check time continuity if possible
                if (index > 0) {
                    const prev = playHistory[index - 1];
                    if ((prev.quarter || 1) > (play.quarter || 1)) timeAnomalies++;
                }
            });

            if (corruptedPlays > 0) {
                results.push({ name: 'Play History', status: 'fail', details: `${corruptedPlays} plays have corrupted data.` });
            } else if (timeAnomalies > 0) {
                results.push({ name: 'Play History', status: 'warn', details: `${timeAnomalies} potential timestamp sequencing errors.` });
            } else {
                results.push({ name: 'Play History', status: 'pass', details: `${playHistory.length} plays verified.` });
            }
        } else {
            results.push({ name: 'Play History', status: 'pass', details: 'No plays recorded yet.' });
        }

        // 6. Playbook Check
        const offenseCount = Object.keys(offenseFormations).length;
        const defenseCount = Object.keys(defenseFormations).length;
        const specialCount = Object.keys(specialTeamsFormations).length;
        
        if (offenseCount > 0 && defenseCount > 0) {
            results.push({ name: 'Playbook', status: 'pass', details: `Formations: ${offenseCount} Off / ${defenseCount} Def / ${specialCount} ST` });
        } else {
            results.push({ name: 'Playbook', status: 'warn', details: 'Playbook might be incomplete.' });
        }

        // 7. Browser Capabilities
        const audioSupport = 'speechSynthesis' in window;
        results.push({ 
            name: 'Audio Engine', 
            status: audioSupport ? 'pass' : 'fail', 
            details: audioSupport ? 'Speech Synthesis Ready' : 'Not Supported' 
        });

        const storageSupport = 'localStorage' in window;
        results.push({ 
            name: 'Local Storage', 
            status: storageSupport ? 'pass' : 'fail', 
            details: storageSupport ? 'Available' : 'Not Available' 
        });

        setDiagnosticResults(results);
        setIsRunningDiagnostics(false);
    };

    if (!isOpen) return null;
    
    const tabButtonStyle = "flex-1 py-3 px-2 text-sm font-bold border-b-2 transition-colors duration-200 focus:outline-none focus:bg-white/5 whitespace-nowrap";
    const activeTabStyle = "border-[var(--accent-primary)] text-[var(--accent-primary)]";
    const inactiveTabStyle = "border-transparent text-[var(--text-secondary)] hover:text-white";


    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className={`glass-effect rounded-lg shadow-2xl w-full flex flex-col max-h-[90vh] ${activeTab === 'icons' || activeTab === 'health' ? 'max-w-4xl' : 'max-w-lg'}`} onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10" aria-label="Close settings">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="px-6 border-b border-[var(--border-primary)] flex-shrink-0 overflow-x-auto no-scrollbar">
                    <nav className="flex -mb-px">
                        <button onClick={() => setActiveTab('general')} className={`${tabButtonStyle} ${activeTab === 'general' ? activeTabStyle : inactiveTabStyle}`}>
                            General
                        </button>
                        <button onClick={() => setActiveTab('account')} className={`${tabButtonStyle} ${activeTab === 'account' ? activeTabStyle : inactiveTabStyle}`}>
                            Account
                        </button>
                        <button onClick={() => setActiveTab('appearance')} className={`${tabButtonStyle} ${activeTab === 'appearance' ? activeTabStyle : inactiveTabStyle}`}>
                            Appearance
                        </button>
                        <button onClick={() => setActiveTab('icons')} className={`${tabButtonStyle} ${activeTab === 'icons' ? activeTabStyle : inactiveTabStyle}`}>
                            Icons
                        </button>
                        <button onClick={() => setActiveTab('health')} className={`${tabButtonStyle} ${activeTab === 'health' ? activeTabStyle : inactiveTabStyle}`}>
                            System Health
                        </button>
                    </nav>
                </div>
                
                <main className="overflow-y-auto" style={{ minHeight: '300px' }}>
                     <div className={`p-6 animate-fade-in ${activeTab !== 'general' && 'hidden'}`}>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Team Information</h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label htmlFor="coachName" className="block text-sm font-medium text-[var(--text-secondary)]">Coach Name</label>
                                        <input
                                            id="coachName"
                                            type="text"
                                            value={localCoachName}
                                            onChange={e => setLocalCoachName(e.target.value)}
                                            className="mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                                            placeholder="e.g., John Smith"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="teamCity" className="block text-sm font-medium text-[var(--text-secondary)]">City</label>
                                        <input
                                            id="teamCity"
                                            type="text"
                                            value={localTeamCity}
                                            onChange={e => setLocalTeamCity(e.target.value)}
                                            className="mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                                            placeholder="e.g., Cheshire"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="teamName" className="block text-sm font-medium text-[var(--text-secondary)]">Team Name</label>
                                            <input
                                                id="teamName"
                                                type="text"
                                                value={localTeamName}
                                                onChange={e => setLocalTeamName(e.target.value)}
                                                className="mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)]"
                                                placeholder="e.g., Rams"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="ageDivision" className="block text-sm font-medium text-[var(--text-secondary)]">Age Division</label>
                                            <select
                                                id="ageDivision"
                                                value={localAgeDivision || ''}
                                                onChange={e => setLocalAgeDivision(e.target.value as AgeDivision)}
                                                className="mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md py-2 px-3 text-[var(--text-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                                            >
                                                <option value="" disabled>- Select Division -</option>
                                                {Object.entries(AgeDivisionLabels).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 animate-fade-in ${activeTab !== 'account' && 'hidden'}`}>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Account & Data</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    Manage your account or load sample data for presentation purposes.
                                </p>
                                <div className="mt-4 space-y-3">
                                    <button
                                        onClick={handleCheckForUpdate}
                                        disabled={isCheckingForUpdate}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-500/20 text-blue-300 font-bold rounded-lg border border-blue-500 hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isCheckingForUpdate ? (
                                            <>
                                                <SpinnerIcon className="w-5 h-5" />
                                                <span>Checking...</span>
                                            </>
                                        ) : (
                                            'Check for Updates'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleLoadDemoData}
                                        disabled={isGeneratingDemo}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-teal-500/20 text-teal-300 font-bold rounded-lg border border-teal-500 hover:bg-teal-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-teal-500 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isGeneratingDemo ? (
                                            <>
                                                <SpinnerIcon className="w-5 h-5" />
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            'Load Presentation Data'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleResetAllFormations}
                                        disabled={isResettingFormations}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-orange-500/20 text-orange-300 font-bold rounded-lg border border-orange-500 hover:bg-orange-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-orange-500 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isResettingFormations ? (
                                            <>
                                                <SpinnerIcon className="w-5 h-5" />
                                                <span>Resetting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <TrashIcon className="w-5 h-5" />
                                                <span>Reset Custom Formations</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleClearCacheAndSignOut}
                                        disabled={isSigningOut}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[var(--accent-danger)]/20 text-[var(--accent-danger)] font-bold rounded-lg border border-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-danger)] disabled:opacity-50"
                                    >
                                        {isSigningOut ? (
                                            <>
                                                <SpinnerIcon className="w-5 h-5" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            'Clear Cache & Sign Out'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        disabled={isSigningOut}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-bold rounded-lg border border-[var(--border-primary)] hover:bg-[var(--border-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--border-primary)] disabled:opacity-50"
                                    >
                                        {isSigningOut ? (
                                            <>
                                                <SpinnerIcon className="w-5 h-5" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            'Sign Out'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 animate-fade-in ${activeTab !== 'appearance' && 'hidden'}`}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)]">Custom Field Logo</label>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/svg+xml, image/png"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full text-center px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] hover:bg-[var(--border-primary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                                    >
                                        Upload SVG or PNG File
                                    </button>
                                    <button onClick={handleResetLogo} className="px-3 py-2 bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-primary)] focus:outline-none flex-shrink-0">
                                        Reset
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-[var(--text-secondary)]">Upload an SVG for best quality. Transparent PNGs are also supported.</p>
                                <div className="flex items-center justify-center bg-black/20 p-4 rounded-lg min-h-[100px] mt-2">
                                    {logoUrl && isValidImage ? (
                                        <img src={logoUrl} alt="Logo Preview" className="max-h-24 max-w-full" onError={handleImageError} />
                                    ) : (
                                        <p className="text-[var(--text-secondary)] text-sm">{!isValidImage ? 'Invalid image file.' : 'Logo Preview (Default)'}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)]">Theme</label>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-[var(--bg-secondary)] p-1">
                                    {THEMES.map(th => (
                                        <button
                                            key={th.value}
                                            type="button"
                                            onClick={() => handleThemeChange(th.value)}
                                            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                                                theme === th.value
                                                    ? 'bg-[var(--accent-primary)] text-white shadow'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--border-primary)]'
                                            }`}
                                        >
                                            {th.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {theme === 'custom' && (
                                <div className="animate-fade-in space-y-3 pt-4 border-t border-[var(--border-primary)]">
                                    <h4 className="text-md font-bold text-[var(--text-primary)]">Custom Theme Colors</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                        {customColorProperties.map(({ key, label }) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <label htmlFor={`color-${key}`} className="text-sm text-[var(--text-secondary)]">
                                                    {label}
                                                </label>
                                                <input
                                                    id={`color-${key}`}
                                                    type="color"
                                                    value={localCustomTheme[key]}
                                                    onChange={e => handleColorChange(key, e.target.value)}
                                                    className="w-10 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`animate-fade-in ${activeTab !== 'icons' && 'hidden'}`}>
                        <input
                            type="file"
                            ref={iconFileInputRef}
                            onChange={handleIconFileChange}
                            accept="image/svg+xml"
                            className="hidden"
                        />
                        <div className="flex h-full gap-4 p-6" style={{ minHeight: '400px' }}>
                            {/* Left Panel: Icon Grid */}
                            <div className="w-1/2 border-r border-[var(--border-primary)] pr-4">
                                <h4 className="font-bold text-lg mb-2 text-[var(--text-primary)]">Icon Library</h4>
                                <div className="grid grid-cols-4 gap-2 overflow-y-auto h-[calc(100%-2rem)] no-scrollbar pr-2">
                                    {parsedIcons.map(icon => (
                                        <button
                                            key={icon.id}
                                            onClick={() => handleIconSelect(icon)}
                                            className={`p-2 flex flex-col items-center gap-1 rounded-lg text-center transition-colors ${selectedIcon?.id === icon.id ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-secondary)]'}`}
                                        >
                                            <Icon name={icon.id} className="w-8 h-8" />
                                            <span className="text-xs truncate w-full">{icon.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Panel: Editor */}
                            <div className="w-1/2 flex flex-col">
                                {selectedIcon ? (
                                    <>
                                        <h4 className="font-bold text-lg mb-2 text-[var(--text-primary)]">Edit Icon: <span className="text-[var(--accent-primary)] font-mono">{selectedIcon.id}</span></h4>
                                        <p className="text-xs text-[var(--text-secondary)] mb-2">Edit the SVG code for the symbol below, or upload/download an SVG file.</p>
                                        <textarea
                                            value={editedIconCode}
                                            onChange={(e) => setEditedIconCode(e.target.value)}
                                            className="w-full flex-grow bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md p-2 font-mono text-xs text-[var(--text-secondary)]"
                                            spellCheck="false"
                                        />
                                        <div className="flex items-center gap-2 mt-2 flex-shrink-0 flex-wrap">
                                            <button onClick={handleSaveIconCode} className="px-4 py-1.5 bg-[var(--accent-primary)] text-white rounded-md text-sm font-bold hover:bg-[var(--accent-primary-hover)]">Save Icon Changes</button>
                                            <button type="button" onClick={() => iconFileInputRef.current?.click()} className="px-4 py-1.5 bg-sky-500/20 text-sky-300 rounded-md text-sm font-bold hover:bg-sky-500/30">Upload SVG</button>
                                            <button type="button" onClick={handleDownloadIcon} className="px-4 py-1.5 bg-orange-500/20 text-orange-300 rounded-md text-sm font-bold hover:bg-orange-500/30">Download SVG</button>
                                            <button onClick={() => setSelectedIcon(null)} className="px-4 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md text-sm font-bold hover:bg-[var(--border-primary)]">Cancel</button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                        <p className="text-[var(--text-secondary)] mt-2">Select an icon to view and edit its SVG code.</p>
                                    </div>
                                )}
                                <hr className="border-[var(--border-primary)] my-4" />
                                <button
                                    onClick={() => setLocalIconSheet(defaultIconSheet)}
                                    className="w-full text-center px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] hover:bg-[var(--border-primary)] text-sm"
                                >
                                    Reset All Icons to Default
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 animate-fade-in ${activeTab !== 'health' && 'hidden'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Deep System Diagnostics</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Analyze data integrity and system performance.</p>
                            </div>
                            <button 
                                onClick={runSystemDiagnostics} 
                                disabled={isRunningDiagnostics}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:bg-gray-500"
                            >
                                {isRunningDiagnostics ? <SpinnerIcon className="w-5 h-5" /> : <Icon name="settings" className="w-5 h-5" />}
                                {isRunningDiagnostics ? 'Scanning...' : 'Run Deep Scan'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {diagnosticResults.length === 0 && !isRunningDiagnostics && (
                                <div className="text-center py-10 bg-[var(--bg-tertiary)] rounded-lg border border-dashed border-[var(--border-primary)]">
                                    <p className="text-[var(--text-secondary)]">Click "Run Deep Scan" to check system status.</p>
                                </div>
                            )}
                            
                            {diagnosticResults.map((result, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${result.status === 'pass' ? 'bg-green-500' : result.status === 'warn' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                        <span className="font-bold text-[var(--text-primary)]">{result.name}</span>
                                    </div>
                                    <span className={`text-sm ${result.status === 'pass' ? 'text-green-400' : result.status === 'warn' ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {result.details}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-[var(--border-primary)] flex justify-end items-center flex-shrink-0">
                    <div className="space-x-2">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-primary)] focus:outline-none">
                            Close
                        </button>
                        <button type="button" onClick={handleSaveChanges} className="px-6 py-2 bg-[var(--accent-primary)] text-sm text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)] focus:outline-none">
                            Save Changes
                        </button>
                    </div>
                </footer>
            </div>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default SettingsModal;