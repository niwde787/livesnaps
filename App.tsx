import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { GameClockProvider } from './contexts/GameClockContext';
import { GameStateProvider, useGameState } from './contexts/GameStateContext';
import LoginScreen from './components/LoginScreen';
import MainMenuScreen from './components/MainMenuScreen';
import WelcomeScreen from './components/WelcomeScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import ViewerContainer from './components/ViewerContainer';
import AdminContainer from './components/AdminContainer';
import SplashScreen from './components/SplashScreen';
import { onAuthStateChanged, db, setUserRoleInDb, initializeNewUser } from './firebase';
import { Icon, SpinnerIcon } from './components/icons';
import { PlayType, GameStateContextType, AgeDivision } from './types';
import TopHeader from './components/TopHeader';
import LeaderboardView from './components/LeaderboardView';
import WeekDashboard from './components/WeekDashboard';
import Dashboard from './components/Dashboard';
import DepthChart from './components/PlayerTable';
import PlayLog from './components/PlayLog';
import FormationManager from './components/FormationManager';
import InsightsView from './components/InsightsView';
import PlayDetailsModal from './components/PlayDetailsModal';
import EditPlayModal from './components/EditPlayModal';
import GameSummaryModal from './components/GameSummaryModal';
import ReportsModal from './components/FinalizeGameModal';
import QuarterSummaryModal from './components/QuarterSummaryModal';
import FormationEditorModal from './components/FormationEditorModal';
import ImportModal from './components/ImportModal';
import SettingsModal from './components/SettingsModal';
import WeekSelectorModal from './components/WeekSelectorModal';
import CoinTossModal from './components/CoinTossModal';
import FourthDownModal from './components/FourthDownModal';
import AddEventModal from './components/AddEventModal';
import ClockFab from './components/ClockFab';
import Toast from './components/Toast';
import WalkthroughModal from './components/WalkthroughModal';
import { BottomNavBar } from './components/BottomNavBar';
import SyncStatus from './components/SyncStatus';
import ErrorBoundary from './components/ErrorBoundary';

type PreAuthSyncState = 'idle' | 'offline';

const PreAuthFooter: React.FC = () => {
    const [version, setVersion] = useState('Live Snaps');
    const [syncState, setSyncState] = useState<PreAuthSyncState>('idle');

    useEffect(() => {
        // @ts-ignore
        fetch(`${import.meta.env.BASE_URL}metadata.json`)
            .then(response => response.json())
            .then(data => {
                if (data && data.name) {
                    setVersion(data.name);
                }
            })
            .catch(() => setVersion('Live Snaps 9.05'));
    }, []);

    useEffect(() => {
        const updateOnlineStatus = () => {
            setSyncState(navigator.onLine ? 'idle' : 'offline');
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        updateOnlineStatus();

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center text-xs text-[var(--text-secondary)] gap-4 backdrop-blur-sm bg-[var(--bg-primary)]/50">
            <span>{version}</span>
            <SyncStatus syncState={syncState} />
        </footer>
    );
};


const App: React.FC = () => {
    const [user, setUser] = useState<any | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [onboardingStep, setOnboardingStep] = useState<'login' | 'role_selection' | 'welcome' | 'complete'>('login');
    const [userRole, setUserRole] = useState<'coach' | 'viewer' | 'admin' | null>(null);
    const [initialShowWalkthrough, setInitialShowWalkthrough] = useState(false);
    const [authPath, setAuthPath] = useState<'coach' | 'viewer' | 'admin' | null>(null);
    const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'signup'>('login');
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [initialEmail, setInitialEmail] = useState('');
    const [hasProceeded, setHasProceeded] = useState(false);
    const [iconSheet, setIconSheet] = useState<string>('');
    const [showPublicLeaderboard, setShowPublicLeaderboard] = useState(false);

    // Load SVG icon sprite at the top level so it's available everywhere
    useEffect(() => {
        // @ts-ignore
        fetch(`${import.meta.env.BASE_URL}assets/icons.svg`)
            .then(res => res.text())
            .then(setIconSheet)
            .catch(err => console.error("Failed to load icons:", err));
    }, []);

    // Use a ref to track the authPath so the onAuthStateChanged listener doesn't need to be re-bound.
    const authPathRef = useRef(authPath);
    useEffect(() => {
        authPathRef.current = authPath;
    }, [authPath]);

    const marketingConsentRef = useRef(marketingConsent);
    useEffect(() => {
        marketingConsentRef.current = marketingConsent;
    }, [marketingConsent]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(async (authUser: any) => {
            setIsAuthLoading(true);
            if (authUser) {
                setUser(authUser);
                const userDoc = await db.collection('users').doc(authUser.uid).get();
                const userData = userDoc.data();

                if (userDoc.exists && userData?.role) {
                    setUserRole(userData.role);
                    if (userData.role === 'admin') {
                        setOnboardingStep('complete');
                    } else if (userData.role === 'coach' && userData.teamName) {
                        setOnboardingStep('complete');
                        setInitialShowWalkthrough(!userData.walkthroughCompleted);
                    } else if (userData.role === 'viewer') {
                        setOnboardingStep('complete');
                        setInitialShowWalkthrough(false); // No walkthrough for viewers
                    } else { // Has role but not setup (e.g. coach who bailed on team name)
                        setOnboardingStep('welcome');
                    }
                } else { // New user or user without a role
                     if (authPathRef.current) { // Use the ref to get the latest value
                        await setUserRoleInDb(authUser.uid, authPathRef.current, authUser.email, marketingConsentRef.current);
                        setUserRole(authPathRef.current);
                        if (authPathRef.current === 'coach') {
                            setOnboardingStep('welcome');
                        } else { // viewer or admin
                            setOnboardingStep('complete');
                        }
                    } else {
                        // Edge case: user exists in auth, but not in our DB, and didn't come from MainMenu
                        setOnboardingStep('role_selection');
                    }
                }
            } else {
                setUser(null);
                setUserRole(null);
                setOnboardingStep('login');
                setAuthPath(null); // Reset path on logout
            }
            setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (userRole === 'coach' && onboardingStep === 'complete') {
            document.body.classList.add('enforce-landscape');
        } else {
            document.body.classList.remove('enforce-landscape');
        }
        return () => {
            document.body.classList.remove('enforce-landscape');
        };
    }, [userRole, onboardingStep]);

    const handleSetAuthPath = (path: 'coach' | 'viewer' | 'admin', initialMode: 'login' | 'signup', consent: boolean, email: string) => {
        setAuthPath(path);
        setInitialAuthMode(initialMode);
        setMarketingConsent(consent);
        setInitialEmail(email);
    };

    const handleRoleSelect = async (role: 'coach' | 'viewer' | 'admin') => {
        if (user) {
            setIsAuthLoading(true);
            await setUserRoleInDb(user.uid, role, user.email, marketingConsent);
            setUserRole(role);
            if (role === 'coach') {
                setOnboardingStep('welcome');
            } else {
                setOnboardingStep('complete');
            }
            setIsAuthLoading(false);
        }
    };

    const handleTeamCreate = async (teamName: string, coachName: string, ageDivision: AgeDivision) => {
        if (user) {
            await initializeNewUser(user.uid, teamName, coachName, user.email, ageDivision);
            setOnboardingStep('complete');
        }
    };

    // Show splash screen until user clicks "Proceed"
    if (!hasProceeded) {
        return <SplashScreen onProceed={() => setHasProceeded(true)} />;
    }

    return (
        <GameClockProvider>
            {isAuthLoading ? (
                <div className="min-h-screen bg-[var(--bg-primary)] flex justify-center items-center">
                    <SpinnerIcon className="w-12 h-12 text-[var(--accent-primary)]" />
                </div>
            ) : !user ? (
                <>
                    {iconSheet && <div dangerouslySetInnerHTML={{ __html: iconSheet }} style={{ display: 'none' }} />}
                    {showPublicLeaderboard ? (
                        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 sm:p-8">
                            <div className="max-w-7xl mx-auto">
                                <button 
                                    onClick={() => setShowPublicLeaderboard(false)}
                                    className="mb-6 flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors"
                                >
                                    <Icon name="arrow-left" className="w-5 h-5" />
                                    Back to Menu
                                </button>
                                <LeaderboardView />
                            </div>
                        </div>
                    ) : authPath ? (
                        <>
                            <LoginScreen onBack={() => { setAuthPath(null); setInitialEmail(''); }} initialMode={initialAuthMode} initialEmail={initialEmail} />
                            <PreAuthFooter />
                        </>
                    ) : (
                        <>
                            <MainMenuScreen setAuthPath={handleSetAuthPath} onShowLeaderboard={() => setShowPublicLeaderboard(true)} />
                            <PreAuthFooter />
                        </>
                    )}
                </>
            ) : onboardingStep === 'role_selection' ? (
                <>
                    {iconSheet && <div dangerouslySetInnerHTML={{ __html: iconSheet }} style={{ display: 'none' }} />}
                    <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
                    <PreAuthFooter />
                </>
            ) : onboardingStep === 'welcome' ? (
                <>
                    {iconSheet && <div dangerouslySetInnerHTML={{ __html: iconSheet }} style={{ display: 'none' }} />}
                    <WelcomeScreen onTeamCreate={handleTeamCreate} />
                    <PreAuthFooter />
                </>
            ) : (
                <>
                    {userRole === 'coach' && (
                        <ErrorBoundary>
                            <GameStateProvider user={user} initialShowWalkthrough={initialShowWalkthrough}>
                                {iconSheet && <div dangerouslySetInnerHTML={{ __html: iconSheet }} style={{ display: 'none' }} />}
                                <AppContent />
                            </GameStateProvider>
                        </ErrorBoundary>
                    )}
                    {userRole === 'viewer' && (
                        <>
                            {iconSheet && <div dangerouslySetInnerHTML={{ __html: iconSheet }} style={{ display: 'none' }} />}
                            <ViewerContainer />
                        </>
                    )}
                    {userRole === 'admin' && (
                        <>
                            {iconSheet && <div dangerouslySetInnerHTML={{ __html: iconSheet }} style={{ display: 'none' }} />}
                            <AdminContainer user={user} />
                        </>
                    )}
                </>
            )}
        </GameClockProvider>
    );
};


const AppContent: React.FC = () => {
    const {
        activeTab,
        animationClass,
        isPlayDetailsModalOpen,
        editingPlayIndex,
        isSummaryModalOpen,
        isReportsModalOpen,
        isQuarterSummaryModalOpen,
        editingFormation,
        setEditingFormation,
        handleSaveFormation,
        handleDeleteFormation,
        players,
        offenseFormations,
        defenseFormations,
        specialTeamsFormations,
        isImportModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isAddEventModalOpen,
        mainPaddingClass,
        toast,
        isCoinTossModalOpen,
        isFourthDownModalOpen,
        showWalkthrough,
        isWeekSelectorModalOpen,
    } = useGameState();

    const modalRoot = document.getElementById('modal-root');
    
    const formationToEdit = useMemo(() => {
        if (!editingFormation || editingFormation.isCreating || !editingFormation.name) {
            return undefined;
        }
        switch (editingFormation.playType) {
            case PlayType.Offense:
                return offenseFormations[editingFormation.name];
            case PlayType.Defense:
                return defenseFormations[editingFormation.name];
            case PlayType.SpecialTeams:
                return specialTeamsFormations[editingFormation.name];
            default:
                return undefined;
        }
    }, [editingFormation, offenseFormations, defenseFormations, specialTeamsFormations]);


    return (
        <div className={`font-sans min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 ${mainPaddingClass}`}>
            <TopHeader />
            <div className="w-full px-2 sm:px-4 py-4 pt-16">
                
                <div className={animationClass}>
                    {activeTab === 'overview' && <WeekDashboard />}
                    {activeTab === 'game' && <Dashboard />}
                    {activeTab === 'roster' && <DepthChart />}
                    {activeTab === 'play-log' && <PlayLog />}
                    {activeTab === 'formations' && <FormationManager />}
                    {activeTab === 'insights' && <InsightsView />}
                </div>

                {isPlayDetailsModalOpen && modalRoot && ReactDOM.createPortal(
                    <PlayDetailsModal />,
                    modalRoot
                )}

                {editingPlayIndex !== null && modalRoot && ReactDOM.createPortal(
                    <EditPlayModal key={editingPlayIndex} />,
                    modalRoot
                )}
                
                {isSummaryModalOpen && modalRoot && ReactDOM.createPortal(
                    <GameSummaryModal />,
                    modalRoot
                )}
                
                {isReportsModalOpen && modalRoot && ReactDOM.createPortal(
                    <ReportsModal />,
                    modalRoot
                )}

                {isQuarterSummaryModalOpen && modalRoot && ReactDOM.createPortal(
                    <QuarterSummaryModal />,
                    modalRoot
                )}

                 {editingFormation && modalRoot && ReactDOM.createPortal(
                    <FormationEditorModal
                        isOpen={!!editingFormation}
                        onClose={() => setEditingFormation(null)}
                        onSave={handleSaveFormation}
                        onDelete={handleDeleteFormation}
                        playType={editingFormation.playType}
                        allPlayers={players}
                        isCreating={editingFormation.isCreating}
                        formationToEdit={formationToEdit}
                        originalFormationName={editingFormation.name}
                    />,
                    modalRoot
                )}

                {isImportModalOpen && modalRoot && ReactDOM.createPortal(
                    <ImportModal />,
                    modalRoot
                )}

                {isSettingsModalOpen && modalRoot && ReactDOM.createPortal(
                    <SettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                    />,
                    modalRoot
                )}
                 {isWeekSelectorModalOpen && modalRoot && ReactDOM.createPortal(
                    <WeekSelectorModal />,
                    modalRoot
                )}
                {isCoinTossModalOpen && modalRoot && ReactDOM.createPortal(
                    <CoinTossModal />,
                    modalRoot
                )}
                {isFourthDownModalOpen && modalRoot && ReactDOM.createPortal(
                    <FourthDownModal />,
                    modalRoot
                )}
                 {isAddEventModalOpen && modalRoot && ReactDOM.createPortal(
                    <AddEventModal />,
                    modalRoot
                )}
            </div>

            {activeTab === 'game' && <ClockFab />}

            {toast && modalRoot && ReactDOM.createPortal(
                <Toast />,
                modalRoot
            )}

            {showWalkthrough && modalRoot && ReactDOM.createPortal(<WalkthroughModal />, modalRoot)}

            <BottomNavBar />
        </div>
    );
};


export default App;