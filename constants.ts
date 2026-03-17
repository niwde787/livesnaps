import { WeekData, CustomTheme } from './types';

export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  bgPrimary: '#111827',
  bgSecondary: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  borderPrimary: '#4B5563',
  accentPrimary: '#3B82F6',
  accentSecondary: '#10B981',
  accentDefense: '#EF4444',
  accentSpecial: '#A855F7',
};

// Default player image fallback.
export const DEFAULT_PLAYER_IMAGE = "data:image/svg+xml,%3csvg id='Layer_2' data-name='Layer 2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cdefs%3e%3cstyle%3e.cls-1 { fill: %230619b3; } .cls-2 { fill: %23d0fe18; }%3c/style%3e%3c/defs%3e%3cg id='Layer_1-2' data-name='Layer 1'%3e%3crect class='cls-1' width='100' height='100'/%3e%3cpath class='cls-2' d='M84.06,62.28c-.03-.88-.77-1.59-1.65-1.56l-10.49.2c-.56-3.37-1.07-6.96-1.49-10.44,1.87-.05,3.43-.15,3.76-.33.9-.5.32-9.45-1.01-10.28-.45-.28-1.77-.39-3.33-.41-3.77-11.03-14.2-18.96-26.51-18.96-15.47,0-28.01,12.54-28.01,28.01,0,6.58,1.07,17,4.87,21.78,2.75,3.46,9.94-.32,14.34.36,3.8.59,4.68,5.86,8.79,5.86,6.8,0,13.02-2.42,17.87-6.44.94-.78,3.96-2.63,4.66-5.78l3.27-.06c2.78,15.29,5.49,15.29,6.51,15.29h7.4c.44,0,.86-.18,1.17-.5.31-.32.47-.75.45-1.19l-.61-15.54ZM47.89,68.48c-1.74,0-3.16-1.41-3.16-3.16s1.42-3.16,3.16-3.16,3.16,1.41,3.16,3.16-1.41,3.16-3.16,3.16ZM65.79,61.03c-.9-4.2-3.86-9.94.29-10.49.35,0,.72,0,1.09,0,.47,4,.94,7.47,1.42,10.45l-2.8.05ZM75.94,76.26c-1.04-1.1-2.3-5.97-3.45-12.1l8.39-.16.48,12.26h-5.42Z'/%3e%3c/g%3e%3c/svg%3e";

export const POSITION_FULL_NAMES: Record<string, string> = {
    // OFFENSE
    'QB': 'Quarterback',
    'RB': 'Running Back',
    'FB': 'Fullback',
    'WR': 'Wide Receiver',
    'X': 'X Receiver (Split End)',
    'Z': 'Z Receiver (Flanker)',
    'Y': 'Y Receiver (Tight End)',
    'TE': 'Tight End',
    'LTE': 'Inline Tight End (Left)',
    'RTE': 'Inline Tight End (Right)',
    'T': 'Tackle',
    'G': 'Guard',
    'C': 'Center',
    'LT': 'Left Tackle',
    'LG': 'Left Guard',
    'RG': 'Right Guard',
    'RT': 'Right Tackle',
    'A': 'A-Back / Athlete',
    'LW': 'Left Wing',
    'RW': 'Right Wing',
    'WING': 'Wing Back',
    'PP': 'Personal Protector',
    // FIX: Merged 'H-Back' and 'Holder' to resolve duplicate 'H' key.
    'H': 'H-Back / Holder',
    // DEFENSE
    'DL': 'Defensive Line',
    'DE': 'Defensive End',
    'LDE': 'Left Defensive End',
    'RDE': 'Right Defensive End',
    'DT': 'Defensive Tackle',
    'NT': 'Nose Tackle',
    'LB': 'Linebacker',
    'OLB': 'Outside Linebacker',
    'ILB': 'Inside Linebacker',
    'MLB': 'Middle Linebacker',
    'MB': 'Middle Linebacker (Mike)',
    'WLB': 'Weakside Linebacker',
    'SLB': 'Strongside Linebacker',
    'DB': 'Defensive Back',
    'CB': 'Cornerback',
    'LCB': 'Left Cornerback',
    'RCB': 'Right Cornerback',
    'S': 'Safety',
    'FS': 'Free Safety',
    'SS': 'Strong Safety',
    'NICKEL': 'Nickelback',
    // SPECIAL TEAMS
    'K': 'Kicker',
    'P': 'Punter',
    'LS': 'Long Snapper',
    'KR': 'Kick Returner',
    'PR': 'Punt Returner',
    'GNR': 'Gunner',
    'BLOCK': 'Blocker',
    'RUSH': 'Rusher',
    'JAM': 'Jammer',
};

// Data from https://leagues.teamlinkt.com/syfcct/Standings (6th Grade) as of request time.
export const LEAGUE_STANDINGS: Record<string, { w: number; l: number; t: number; }> = {
    'Rams': { w: 7, l: 1, t: 0 },
    'Nighthawks': { w: 7, l: 1, t: 0 },
    'Tigers': { w: 6, l: 2, t: 0 },
    'Knights': { w: 5, l: 3, t: 0 },
    'Grizzlies': { w: 2, l: 6, t: 0 },
    'T-Birds': { w: 1, l: 7, t: 0 },
    'Spartans': { w: 0, l: 8, t: 0 },
    'North Haven Nighthawks': { w: 4, l: 4, t: 0 },
};

// FIX: Added default schedule constants.
export const WEEKS = ['WK1', 'WK2', 'WK3', 'WK4', 'WK5', 'WK6', 'WK7', 'WK8', 'WK9', 'WK10'];

// FIX: Replaced object spread syntax with a standard reduce pattern for wider compatibility.
export const WEEKLY_OPPONENTS: Record<string, string> = WEEKS.reduce((acc: Record<string, string>, week) => {
    acc[week] = 'TBD';
    return acc;
}, {});
export const WEEKLY_HOME_AWAY: Record<string, 'Home' | 'Away'> = WEEKS.reduce((acc: Record<string, 'Home' | 'Away'>, week) => {
    acc[week] = 'Home';
    return acc;
}, {});
export const WEEK_DATES: Record<string, string> = WEEKS.reduce((acc: Record<string, string>, week, i) => {
    const date = new Date();
    date.setDate(date.getDate() + (i * 7));
    acc[week] = date.toISOString().split('T')[0];
    return acc;
}, {});
export const WEEKLY_RESULTS: Record<string, any> = WEEKS.reduce((acc: Record<string, any>, week) => {
    acc[week] = null;
    return acc;
}, {});

// FIX: Added BLANK_WEEK_DATA constant for initializing new week data.
export const BLANK_WEEK_DATA: WeekData = {
  players: [],
  offenseFormations: {},
  defenseFormations: {},
  specialTeamsFormations: {},
  presetLineups: {},
};

// Maintained for mapping legacy player positions to broader groups
export const POSITION_GROUPS = {
    OFFENSE: ['QB', 'RB', 'FB', 'WR', 'TE', 'T', 'G', 'C', 'LT', 'LG', 'RG', 'RT', 'A', 'H', 'LW', 'RW', 'X', 'Y', 'Z', 'LTE', 'RTE', 'WING', 'PP', 'KR', 'BLOCK'],
    DEFENSE: ['DL', 'LB', 'DB', 'DE', 'LDE', 'RDE', 'DT', 'NT', 'ILB', 'MLB', 'MB', 'OLB', 'CB', 'LCB', 'RCB', 'S', 'FS', 'SS', 'NICKEL', 'WLB', 'SLB'],
    SPECIALISTS: ['K', 'P', 'LS', 'H', 'KR', 'PR', 'GNR', 'BLOCK', 'RUSH', 'JAM'],
};

// Simplified options for the position selection UI in modals.
export const ALL_POSITION_OPTIONS = [
    {
        group: 'Offense',
        positions: ['QB', 'RB', 'FB', 'WR', 'TE', 'T', 'G', 'C', 'LT', 'LG', 'RG', 'RT', 'X', 'Z', 'Y', 'A', 'H', 'WING', 'BLOCK']
    },
    {
        group: 'Defense',
        positions: ['DE', 'DT', 'LB', 'CB', 'S', 'LDE', 'RDE', 'NT', 'WLB', 'MLB', 'SLB', 'LCB', 'RCB', 'FS', 'SS']
    },
    {
        group: 'Specialists',
        positions: ['K', 'P', 'LS', 'H', 'KR', 'PR', 'GNR', 'BLOCK', 'RUSH', 'JAM']
    }
];

// Defines which original/granular positions belong to each consolidated depth chart group.
export const OFFENSE_DISPLAY_GROUPS = { 
    'QB': ['QB'], 
    'RB': ['RB'],
    'FB': ['FB'],
    'A-Back': ['A', 'RB', 'WR', 'WING', 'BLOCK'], // Versatile athlete/slotback
    'WR (X)': ['WR'], // Split End
    'WR (Z)': ['WR'], // Flanker
    'WR (Slot)': ['WR'], // Slot Receiver
    'TE (Y)': ['TE'], // In-line Tight End
    'LT': ['T'], 
    'LG': ['G'], 
    'C': ['C'],
    'RG': ['G'], 
    'RT': ['T'], 
};

export const DEFENSE_DISPLAY_GROUPS = { 
    'LDE': ['DE'],      // Left Defensive End
    'RDE': ['DE'],      // Right Defensive End
    'NT': ['DT'],       // Nose Tackle (3-4)
    'DT': ['DT'],       // Defensive Tackle (4-3)
    'WLB': ['LB'],      // Will - Weakside Linebacker
    'MLB': ['LB'],      // Mike - Middle Linebacker
    'SLB': ['LB'],      // Sam - Strongside Linebacker
    'LCB': ['CB'],      // Left Cornerback
    'RCB': ['CB'],      // Right Cornerback
    'FS': ['S'],        // Free Safety
    'SS': ['S'],        // Strong Safety
};

export const ST_DISPLAY_GROUPS = { 
    'K': ['K'],
    'P': ['P'],
    'H': ['H'],
    'LS': ['LS'],
    'KR/PR': ['KR', 'PR'],
    'GNR': ['GNR', 'JAM'],
    'Block/Rush': ['BLOCK', 'RUSH'],
};


// FIX: Added GAME_DATA constant.
export const GAME_DATA = {}; // This seems to be a legacy/unused constant.

// FIX: Added position label constants for formation editor.
export const OFFENSE_POSITION_LABELS = ['QB', 'RB', 'FB', 'WR', 'X', 'Z', 'TE', 'Y', 'LTE', 'RTE', 'LT', 'LG', 'C', 'RG', 'RT', 'A', 'H', 'LW', 'RW', 'WING', 'PP', 'KR', 'BLOCK'];
export const DEFENSE_POSITION_LABELS = ['DE', 'LDE', 'RDE', 'DT', 'NT', 'LB', 'OLB', 'ILB', 'MLB', 'MB', 'CB', 'LCB', 'RCB', 'S', 'FS', 'SS', 'NICKEL', 'WLB', 'SLB'];
export const SPECIAL_TEAMS_POSITION_LABELS = ['K', 'P', 'H', 'LS', 'GNR', 'KR', 'PR', 'BLOCK', 'RUSH', 'JAM'];

export const DEFAULT_FORMATION_COORDINATES: Record<string, { top: string; left: string }> = {
    // OFFENSE
    'C': { top: '52%', left: '50%' },
    'LG': { top: '52%', left: '45%' },
    'RG': { top: '52%', left: '55%' },
    'LT': { top: '52%', left: '40%' },
    'RT': { top: '52%', left: '60%' },
    'TE': { top: '52%', left: '65%' },
    'RTE': { top: '52%', left: '65%' }, // Inline Tight End (Right)
    'LTE': { top: '52%', left: '35%' }, // Inline Tight End (Left)
    'WR': { top: '50%', left: '10%' },
    'QB': { top: '65%', left: '50%' },
    'RB': { top: '70%', left: '55%' },
    'FB': { top: '70%', left: '50%' },
    'H': { top: '60%', left: '58%' }, // H-Back/Wing
    'A': { top: '60%', left: '42%' }, // A-Back/Slot
    'LW': { top: '55%', left: '30%' }, // Left Wing
    'RW': { top: '55%', left: '70%' }, // Right Wing
    'X': { top: '50%', left: '5%' },   // X Receiver (Split End) on LOS
    'Y': { top: '52%', left: '65%' },  // Y Receiver (Tight End) on LOS
    'Z': { top: '55%', left: '95%' },  // Z Receiver (Flanker) off LOS
    'WING': { top: '55%', left: '70%' },
    'PP': { top: '75%', left: '50%' }, // Punt Protector
    'BLOCK': { top: '55%', left: '50%' },

    // DEFENSE
    'NT': { top: '48%', left: '50%' },
    'DT': { top: '48%', left: '45%' },
    'DE': { top: '48%', left: '35%' },
    'LDE': { top: '48%', left: '35%' },
    'RDE': { top: '48%', left: '65%' },
    'MLB': { top: '40%', left: '50%' },
    'MB': { top: '40%', left: '50%' },
    'ILB': { top: '40%', left: '45%' },
    'WLB': { top: '40%', left: '40%' },
    'SLB': { top: '40%', left: '60%' },
    'OLB': { top: '45%', left: '30%' },
    'CB': { top: '30%', left: '5%' },
    'LCB': { top: '30%', left: '5%' },
    'RCB': { top: '30%', left: '95%' },
    'FS': { top: '20%', left: '50%' },
    'S': { top: '20%', left: '50%' },
    'SS': { top: '25%', left: '35%' },
    'NICKEL': { top: '35%', left: '30%' },
    
    // SPECIAL TEAMS
    'K': { top: '90%', left: '50%' },
    'P': { top: '95%', left: '50%' },
    'LS': { top: '52%', left: '50%' },
    'GNR': { top: '50%', left: '5%' },
    'KR': { top: '95%', left: '50%' },
    'PR': { top: '90%', left: '50%' },
    'RUSH': { top: '45%', left: '30%' },
    'JAM': { top: '48%', left: '5%' },
};