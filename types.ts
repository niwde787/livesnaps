// types.ts
// FIX: Import 'React' to provide types like React.Dispatch and React.MutableRefObject.
import React from 'react';

export enum AgeDivision {
    'U6' = '6U',
    'U7' = '7U',
    'U8' = '8U',
    'U9' = '9U',
    'U10' = '10U',
    'U11' = '11U',
    'U12' = '12U',
}

export const AgeDivisionLabels: Record<AgeDivision, string> = {
    [AgeDivision.U6]: '(6U)',
    [AgeDivision.U7]: '(7U)',
    [AgeDivision.U8]: '(8U)',
    [AgeDivision.U9]: '(9U) Freshman',
    [AgeDivision.U10]: '(10U) Sophomore',
    [AgeDivision.U11]: '(11U) Junior',
    [AgeDivision.U12]: '(12U) Senior',
};

export enum PlayerStatus {
    Playing = 'Playing',
    Injured = 'Injured',
    Absent = 'Absent',
    Discipline = 'Discipline',
}

export interface Player {
    id: string;
    name: string;
    jerseyNumber: number;
    position: string;
    status: PlayerStatus;
    offensePlayCount: number;
    defensePlayCount: number;
    specialTeamsPlayCount: number;
    timeOnField: number; // in seconds
    imageUrl?: string;
}

export enum PlayType {
    Offense = 'Offense',
    Defense = 'Defense',
    SpecialTeams = 'Special Teams',
    Formations = 'Formations', // used in playbookwidget
}

export type SelectablePlayType = PlayType.Offense | PlayType.Defense | PlayType.SpecialTeams;

export interface FormationPosition {
    label: string;
    top: string;
    left: string;
}

export type FormationPositions = FormationPosition[];

export interface Formation {
    positions: FormationPositions;
    presetPlayerIds?: (string | null)[];
    // FIX: Add optional 'presetPlayerJerseys' to support legacy default formations.
    presetPlayerJerseys?: number[];
}

export type FormationCollection = Record<string, Formation>;

export interface Highlight {
    passerId?: string;
    receiverId?: string;
    runnerId?: string;
    tacklerId?: string;
    interceptorId?: string;
    kickerId?: string;
    returnerId?: string;
    holderId?: string;
}

export interface Play {
    playerIds: Set<string>;
    lineup?: (string | null)[];
    type: PlayType;
    formationName: string;
    timestamp: number;
    down?: number;
    startYardLine?: number;
    yardsGained?: number;
    playResult?: PlayResult;
    quarter?: number;
    gameTime?: string;
    playDuration?: number; // in seconds
    ourScore?: number;
    opponentScore?: number;
    highlights?: Highlight;
    isFlag?: boolean;
    penaltyOn?: 'offense' | 'defense';
    isAutoFirstDown?: boolean;
    isLossOfDown?: boolean;
    isRepeatDown?: boolean;
    __originalIndex?: number; // for filtering
}

export interface SerializablePlay extends Omit<Play, 'playerIds'> {
    playerIds: string[];
}

export interface Drive {
    driveNumber: number;
    team: PlayType.Offense | PlayType.Defense;
    plays: { play: Play; originalIndex: number }[];
    summary: {
        playCount: number;
        yards: number;
        timeOfPossession: string;
        result: string;
        startYardLine: number;
        endYardLine: number;
    };
}


export enum PlayResult {
    // Pass Plays
    PassCompleted = 'Pass Completed',
    PassCompletedOutOfBounds = 'Pass Completed (Out of Bounds)',
    PassIncomplete = 'Pass Incomplete',
    PassTouchdown = 'Pass Touchdown',
    // Run Plays
    Run = 'Run',
    RunOutOfBounds = 'Run (Out of Bounds)',
    RunTouchdown = 'Run Touchdown',
    KneelDown = 'Kneel Down',
    // Turnovers / Sacks
    InterceptionThrown = 'Interception Thrown',
    FumbleLost = 'Fumble Lost',
    FumbleRecoveredByOffense = 'Fumble Recovered by Offense',
    FumbleOutOfBounds_Offense = 'Fumble Out of Bounds (Offense Retains)',
    OffensiveFumbleRecoveryTD = 'Fumble Recovery TD (Offense)',
    FumbleTouchback = 'Fumble Touchback (Turnover)',
    SackTaken = 'Sack',
    TurnoverOnDowns = 'Turnover on Downs',
    // Safeties
    OffensiveSafety = 'Safety (Offense)',
    DefensiveSafety = 'Safety (Defense)',
    // Penalties
    PenaltyAccepted = 'Penalty (Accepted)',
    PenaltyDeclined = 'Penalty (Declined)',
    PenaltyOffsetting = 'Penalty (Offsetting)',
    // Defensive Plays
    DefenseTackle = 'Tackle',
    DefenseTackleForLoss = 'Tackle for Loss',
    DefenseSack = 'Sack (Defense)',
    DefensePassDefended = 'Pass Defended',
    // Defensive Takeaways
    Interception = 'Interception',
    InterceptionReturnTD = 'Interception Return TD',
    FumbleRecovery = 'Fumble Recovery',
    FumbleReturnTD = 'Fumble Return TD',
    BlockedKickRecovery = 'Blocked Kick Recovery',
    // Special Teams - Kicking
    PATGood = 'PAT Good', // Legacy
    PATFailed = 'PAT Failed', // Legacy
    PAT_Blocked = 'PAT Blocked',
    FieldGoalGood = 'Field Goal Good',
    FieldGoalFailed = 'Field Goal Failed',
    Punt = 'Punt',
    PuntTouchback = 'Punt Touchback',
    PuntBlocked = 'Punt Blocked',
    FieldGoalBlocked = 'Field Goal Blocked',
    // Special Teams - Kickoff
    KickoffTackle = 'Kickoff - Tackle',
    KickoffTouchback = 'Kickoff - Touchback',
    KickoffOutOfBounds = 'Kickoff - Out of Bounds',
    OnsideKickRecovered = 'Onside Kick - Recovered',
    OnsideKickLost = 'Onside Kick - Lost',
    // Special Teams - Returns
    KickReturn = 'Kick Return',
    KickReturnOutOfBounds = 'Kick Return (Out of Bounds)',
    KickReturnTD = 'Kick Return TD',
    PuntReturn = 'Punt Return',
    PuntReturnOutOfBounds = 'Punt Return (Out of Bounds)',
    PuntReturnTD = 'Punt Return TD',
    PuntFairCatch = 'Punt - Fair Catch',
    BlockedPuntReturnTD = 'Blocked Punt Return TD',
    BlockedFieldGoalReturnTD = 'Blocked FG Return TD',
    MuffedPuntLost = 'Muffed Punt (Lost)',

    // Opponent Scoring - to be recorded on a defensive play
    OpponentScored = 'Opponent Scored', // Generic
    OpponentTouchdownRun = 'Opponent Touchdown (Run)',
    OpponentTouchdownPass = 'Opponent Touchdown (Pass)',
    OpponentPAT1ptGood = 'Opponent PAT (1pt Good)',
    OpponentPAT2ptGood = 'Opponent PAT (2pt Good)',
    OpponentPATFailed = 'Opponent PAT (Failed)',
    OpponentPATGood_DEPRECATED = 'Opponent PAT Good',
    InterceptionReturnTD_Opponent = 'Interception Return TD (Opponent)',
    FumbleReturnTD_Opponent = 'Fumble Return TD (Opponent)',
    KickoffReturnTD_Opponent = 'Kickoff Return TD (Opponent)',

    // --- NEW, MORE SPECIFIC 2-POINT CONVERSIONS ---
    TwoPointConversion_Pass_Good = '2pt Pass Conversion Good',
    TwoPointConversion_Pass_Failed = '2pt Pass Conversion Failed',
    TwoPointConversion_Run_Good = '2pt Run Conversion Good',
    TwoPointConversion_Run_Failed = '2pt Run Conversion Failed',

    // Conversions (Newer Rules)
    PAT_1pt_ConversionGood = '1pt Conv. Good',
    PAT_1pt_ConversionFailed = '1pt Conv. Failed',
    PAT_2pt_KickGood = '2pt Conv. Good (Kick)',
    PAT_2pt_KickFailed = '2pt Conv. Failed (Kick)',
    PAT_2pt_Return_Defense = '2pt PAT Return (Defense)',
    PAT_2pt_Return_Opponent = '2pt PAT Return (Opponent)',
    PAT_1pt_Safety_Offense = '1pt Safety (Offense)',

    // Conversions (Legacy)
    Pass1ptConversionGood = '1pt Pass Conv. Good',
    Pass1ptConversionFailed = '1pt Pass Conv. Failed',
    Run1ptConversionGood = '1pt Run Conv. Good',
    Run1ptConversionFailed = '1pt Run Conv. Failed',
}

export interface ImportedRosterPlayer {
    jerseyNumber: number;
    name: string;
    position: string;
    status: PlayerStatus;
}

export type ActiveTab = 'overview' | 'game' | 'roster' | 'play-log' | 'formations' | 'insights';
export type NavBarPosition = 'bottom' | 'top' | 'left' | 'right';
export type Theme = 'dark' | 'light' | 'material-you' | 'custom';

export interface CustomTheme {
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    textSecondary: string;
    borderPrimary: string;
    accentPrimary: string;
    accentSecondary: string;
    accentDefense: string;
    accentSpecial: string;
}

export interface PlayerStats {
    count: number;
    yards: number;
    attempts?: number;
    makes?: number;
}
export type PlayerContribution = Record<string, PlayerStats>;

export interface FormationStats {
    playCount: number;
    totalYards: number;
    positivePlays: number;
    negativePlays: number;
    zeroYdPlays: number;
    pointsScored?: number;
    attempts?: number;
    makes?: number;
}

export interface QuarterSummaryData {
    formationStats: Record<string, FormationStats>;
    topPerformers: {
        passers: PlayerContribution;
        receivers: PlayerContribution;
        runners: PlayerContribution;
        tacklers: PlayerContribution;
        interceptors: PlayerContribution;
        kickers: PlayerContribution;
        returners: PlayerContribution;
    };
}

export interface WeekData {
    players: Player[];
    offenseFormations: FormationCollection;
    defenseFormations: FormationCollection;
    specialTeamsFormations: FormationCollection;
    presetLineups: Record<string, (string | null)[]>;
    depthChart?: Record<string, string[]>;
}

export interface StoredGameState extends WeekData {
    playHistory: SerializablePlay[];
    viewerPlayHistory?: SerializablePlay[]; // Optimization for viewers
    currentLineups: Record<string, (string | null)[]>;
    opponentName?: string;
    ourScore?: number;
    opponentScore?: number;
    currentQuarter?: number;
    gameTime?: number;
    isClockRunning?: boolean;
    homeTimeouts?: number;
    awayTimeouts?: number;
    possession?: 'home' | 'away' | null;
    coinToss?: { winner: 'us' | 'them'; choice: 'receive' | 'defer' };
    depthChart?: Record<string, string[]>;
}

export interface CustomFormations {
    offense: FormationCollection;
    defense: FormationCollection;
    specialTeams: FormationCollection;
}


export interface ScoreboardProps {
    gameTime: number;
    isClockRunning: boolean;
    onToggleClock: () => void;
    ourScore: number;
    opponentScore: number;
    onScoreChange: (ourScore: number, oppScore: number) => void;
    currentQuarter: number;
    homeStatus: 'Home' | 'Away';
    homeTimeouts: number;
    awayTimeouts: number;
    onUseTimeout: (team: 'home' | 'away') => void;
    onEndPeriod: () => void;
    onGameTimeChange: (newTime: number) => void;
    lastPlay: Play | undefined;
    possession: 'home' | 'away' | null;
    onPossessionChange: (team: 'home' | 'away') => void;
    opponentNames: Record<string, string>;
    selectedWeek: string;
    downAndDistance: string;
    isWeekLoading: boolean;
}

// For import from spreadsheet
export interface ParsedRosterUpdate {
    week: string;
    jerseyNumber: number;
    status: PlayerStatus;
}
export interface ParsedFormation {
    week?: string;
    playType: PlayType;
    formationName: string;
    formation: Formation;
    presetPlayerJerseys?: number[];
}
export interface ParsedOpponentUpdate {
    week: string;
    opponentName: string;
}

export interface AiSummary {
    gameBreakdown: string;
    impactPlays: {
        playDescription: string;
        quarter: number;
        gameTime: string;
        result: string;
    }[];
    thingsToWorkOn: string;
    formationAnalysis: string;
    playerHighlights: string;
}

// FIX: Added 'NarrationContext' type for contextual narration.
export interface NarrationContext {
    nextPlayState: { down: number, distance: number | 'Goal' };
    teamName: string;
    opponentName: string;
    homeStatus: 'Home' | 'Away';
}

export interface GameStateSnapshot {
    playHistory: Play[];
    ourScore: number;
    opponentScore: number;
    currentQuarter: number;
    gameTime: number;
    isClockRunning: boolean;
    homeTimeouts: number;
    awayTimeouts: number;
    possession: 'home' | 'away' | null;
    currentLineups: Record<string, (string | null)[]>;
}

// FIX: Added isGeneratingDemo and handleLoadDemoData to support the presentation data feature.
export interface GameStateContextType {
    isResettingFormations: boolean;
    handleResetAllFormations: () => void;
    isCheckingForUpdate: boolean;
    handleCheckForUpdate: () => void;
    isGeneratingDemo: boolean;
    handleLoadDemoData: () => void;
    isSigningOut: boolean;
    handleSignOut: () => void;
    handleClearCacheAndSignOut: () => void;
    user: any;
    syncState: 'idle' | 'syncing' | 'synced' | 'offline';
    selectedWeek: string;
    seasonWeeks: string[];
    players: Player[];
    playHistory: Play[];
    undoStack: GameStateSnapshot[];
    redoStack: GameStateSnapshot[];
    currentLineups: Record<string, (string | null)[]>;
    offenseFormations: FormationCollection;
    defenseFormations: FormationCollection;
    specialTeamsFormations: FormationCollection;
    depthChart: Record<string, string[]>;
    activeTab: ActiveTab;
    playbookTab: SelectablePlayType;
    selectedFormationName: string;
    animationClass: string;
    isSummaryModalOpen: boolean;
    isReportsModalOpen: boolean;
    isExportingPdf: boolean;
    gameSummaryData: QuarterSummaryData | null;
    isQuarterSummaryModalOpen: boolean;
    quarterSummaryData: QuarterSummaryData | null;
    quarterPlaysForSummary: Play[];
    isImportModalOpen: boolean;
    initialImportTab: 'season' | 'playbook';
    isSettingsModalOpen: boolean;
    isAddEventModalOpen: boolean;
    editingPlayIndex: number | null;
    editingFormation: { playType: PlayType; name?: string; isCreating: boolean } | null;
    editingEventWeek: string | null;
    isPlayDetailsModalOpen: boolean;
    tempPlayData: React.MutableRefObject<{ playType: PlayType; playerIds: Set<string>; formationName: string; lineup: (string | null)[]; formationPositions: FormationPosition[] } | null>;
    theme: Theme;
    toast: { message: string; type: 'success' | 'error' | 'info' } | null;
    isWeekLoading: boolean;
    fieldLogoUrl: string;
    isWeekSelectorModalOpen: boolean;
    navBarPosition: NavBarPosition;
    opponentNames: Record<string, string>;
    opponentCities: Record<string, string>;
    homeAwayStatus: Record<string, 'Home' | 'Away'>;
    weekDates: Record<string, string>;
    weekResults: Record<string, any>;
    ourScore: number;
    opponentScore: number;
    currentQuarter: number;
    homeTimeouts: number;
    awayTimeouts: number;
    possession: 'home' | 'away' | null;
    homeStatus: 'Home' | 'Away';
    insertionIndex: number | null;
    scrollToPlayIndex: number | null;
    ourStats: any; // Simplified for brevity
    opponentStats: any; // Simplified for brevity
    nextPlayState: { down: number, startYardLine: number, distance: number | 'Goal', isOurDrive: boolean };
    isCoinTossModalOpen: boolean;
    isFourthDownModalOpen: boolean;
    showWalkthrough: boolean;
    aiSummary: AiSummary | null;
    teamName: string;
    teamCity: string;
    coachName: string;
    ageDivision: AgeDivision | null;
    customTheme: CustomTheme;
    seasonRecord: { wins: number; losses: number; ties: number; };
    customIconSheet: string | null;
    defaultIconSheet: string;
    gameTime: number;
    isClockRunning: boolean;
    getGameTime: () => number;
    setGameTime: (time: number) => void;
    setIsClockRunning: (running: boolean) => void;
    handleToggleClock: () => void;
    handleGameTimeChange: (newTime: number) => void;
    handleSaveCustomIconSheet: (svgString: string) => Promise<void>;
    setAiSummary: React.Dispatch<React.SetStateAction<AiSummary | null>>;
    handleCompleteWalkthrough: () => void;
    setScrollToPlayIndex: React.Dispatch<React.SetStateAction<number | null>>;
    handleInitiateInsert: (index: number) => void;
    handleCancelInsert: () => void;
    handleThemeChange: (theme: Theme) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    handleNavBarPositionChange: (position: NavBarPosition) => void;
    mainPaddingClass: string;
    handleWeekChange: (week: string) => void;
    handleStartGameFromCoinToss: (winner: 'us' | 'them', choice: 'receive' | 'defer') => void;
    handleFourthDownDecision: (decision: 'go' | 'punt' | 'fg') => void;
    handleResetWeek: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleTabChange: (tab: ActiveTab) => void;
    handleScoreChange: (newOurScore: number, newOpponentScore: number) => void;
    handleUseTimeout: (team: 'home' | 'away') => void;
    handlePossessionChange: (team: 'home' | 'away') => void;
    lastPlay: Play | undefined;
    downAndDistance: string;
    handleLineupConfirm: (playType: PlayType, selectedPlayerIds: Set<string>, formationName: string, lineup: (string | null)[]) => void;
    handleUpdateLineup: (formationName: string, lineup: (string | null)[], playType: PlayType) => void;
    handleSavePlayDetails: (details: Partial<Play>) => void;
    handleOpenReportsModal: () => void;
    handleImportGame: (jsonString: string) => void;
    handleClosePlayDetails: () => void;
    handleUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
    handleDeletePlayer: (playerId: string) => void;
    handleEditPlay: (index: number) => void;
    handleSaveEditedPlay: (newPlayerIds: Set<string>, newLineup: (string | null)[], newFormationName: string, newDetails: Partial<Play>) => void;
    handleDeletePlay: (index: number) => void;
    handleReorderPlay: (draggedIndex: number, targetIndex: number) => void;
    handleEditFormation: (playType: PlayType, formationName: string) => void;
    handleCreateFormation: (playType: PlayType) => void;
    handleSaveFormation: (playType: PlayType, formationName: string, formation: Formation, originalName?: string) => void;
    handleDuplicateFormation: (playType: PlayType, formationNameToCopy: string) => void;
    handleDeleteFormation: (playType: PlayType, formationName: string) => void;
    handleImport: (rosterUpdates: ParsedRosterUpdate[], formationUpdates: ParsedFormation[], opponentUpdates: ParsedOpponentUpdate[]) => void;
    handleSaveFieldLogo: (newUrl: string) => void;
    handleExportJson: () => void;
    handleTriggerImport: (initialTab?: 'season' | 'playbook') => void;
    handleExportPdf: () => void;
    startNextQuarter: () => void;
    handleQuarterEnd: (quarter: number) => void;
    getFormationsForEditModal: (playType: PlayType, currentFormations: FormationCollection) => FormationCollection;
    scoreboardProps: ScoreboardProps;
    setPlaybookTab: React.Dispatch<React.SetStateAction<SelectablePlayType>>;
    setSelectedFormationName: React.Dispatch<React.SetStateAction<string>>;
    setIsSummaryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsReportsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAddEventModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsWeekSelectorModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCoinTossModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFourthDownModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEditingPlayIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setEditingFormation: React.Dispatch<React.SetStateAction<{ playType: PlayType; name?: string | undefined; isCreating: boolean; } | null>>;
    setEditingEventWeek: React.Dispatch<React.SetStateAction<string | null>>;
    handleAddNewEvent: () => void;
    handleEditEvent: (week: string) => void;
    handleSaveEvent: (data: { week: string; isNew: boolean; opponentName: string; opponentCity: string; homeAway: 'Home' | 'Away' | 'TBD'; date: string; }) => Promise<void>;
    handleDeleteEvent: (week: string) => Promise<void>;
    handleTeamInfoChange: (name: string, city: string, coachName: string) => void;
    handleAgeDivisionChange: (division: AgeDivision) => void;
    handleAddPlayer: (player: { jerseyNumber: number; name: string; position: string; status: PlayerStatus; }) => Promise<void>;
    handleRosterImport: (players: ImportedRosterPlayer[]) => Promise<void>;
    handleSetFormationAsDefault: (playType: PlayType, formationName: string) => void;
    handleSetPlayerAsStarter: (playerId: string) => void;
    handleUpdateDepthChart: (group: string, playerIds: string[]) => void;
    handleSelectFormation: (name: string) => void;
    handleCustomThemeChange: (theme: CustomTheme) => void;
    handleResetLineupToDefault: (formationName: string) => void;
}