

import { FormationCollection } from './types';

export const DEFAULT_OFFENSE_FORMATIONS: FormationCollection = {
    "Red Offense": {
        positions: [
            { label: 'LT', left: '35%', top: '52%' },
            { label: 'LG', left: '43%', top: '52%' },
            { label: 'C', left: '50%', top: '52%' },
            { label: 'RG', left: '57%', top: '52%' },
            { label: 'RT', left: '65%', top: '52%' },
            { label: 'Q', left: '50%', top: '70%' },
            { label: 'T', left: '45%', top: '75%' },
            { label: 'A', left: '55%', top: '75%' },
            { label: 'X', left: '5%', top: '52%' },
            { label: 'Y', left: '80%', top: '52%' },
            { label: 'Z', left: '95%', top: '52%' },
        ]
    },
    "Spartan Offense": {
        positions: [
            { label: 'LT', left: '35%', top: '52%' },
            { label: 'LG', left: '43%', top: '52%' },
            { label: 'C', left: '50%', top: '52%' },
            { label: 'RG', left: '57%', top: '52%' },
            { label: 'RT', left: '65%', top: '52%' },
            { label: 'QB', left: '50%', top: '65%' },
            { label: 'RB', left: '43%', top: '70%' },
            { label: 'WR', left: '5%', top: '50%' },
            { label: 'WR', left: '25%', top: '50%' },
            { label: 'WR', left: '75%', top: '50%' },
            { label: 'WR', left: '95%', top: '50%' },
        ]
    },
    "Hammer Offense": {
        positions: [
            { label: 'LT', left: '35%', top: '52%' },
            { label: 'LG', left: '43%', top: '52%' },
            { label: 'C', left: '50%', top: '52%' },
            { label: 'RG', left: '57%', top: '52%' },
            { label: 'RT', left: '65%', top: '52%' },
            { label: 'TE', left: '25%', top: '52%' },
            { label: 'TE', left: '75%', top: '52%' },
            { label: 'WR', left: '90%', top: '52%' },
            { label: 'QB', left: '50%', top: '62%' },
            { label: 'FB', left: '50%', top: '72%' },
            { label: 'RB', left: '50%', top: '82%' },
        ]
    }
};

export const DEFAULT_DEFENSE_FORMATIONS: FormationCollection = {
    "4-3": {
        positions: [
            { label: 'DE', left: '28%', top: '48%' },
            { label: 'DT', left: '43%', top: '48%' },
            { label: 'DT', left: '57%', top: '48%' },
            { label: 'DE', left: '72%', top: '48%' },
            { label: 'LB', left: '35%', top: '35%' },
            { label: 'LB', left: '50%', top: '30%' },
            { label: 'LB', left: '65%', top: '35%' },
            { label: 'CB', left: '10%', top: '25%' },
            { label: 'CB', left: '90%', top: '25%' },
            { label: 'S', left: '30%', top: '15%' },
            { label: 'S', left: '70%', top: '15%' },
        ]
    },
    "Defensive P.A.T.": {
        positions: [
            { label: 'DE', left: '30%', top: '48%' },
            { label: 'DT', left: '38%', top: '48%' },
            { label: 'DT', left: '46%', top: '48%' },
            { label: 'DT', left: '54%', top: '48%' },
            { label: 'DT', left: '62%', top: '48%' },
            { label: 'DE', left: '70%', top: '48%' },
            { label: 'LB', left: '42%', top: '35%' },
            { label: 'LB', left: '58%', top: '35%' },
            { label: 'CB', left: '10%', top: '25%' },
            { label: 'CB', left: '90%', top: '25%' },
            { label: 'S', left: '50%', top: '10%' },
        ]
    }
};

export const DEFAULT_SPECIAL_TEAMS_FORMATIONS: FormationCollection = {
    "Green Kickoff": {
        positions: [
            { label: 'K', left: '50%', top: '55%' },
            { label: 'P', left: '10%', top: '48%' },
            { label: 'P', left: '20%', top: '48%' },
            { label: 'P', left: '30%', top: '48%' },
            { label: 'P', left: '40%', top: '48%' },
            { label: 'P', left: '60%', top: '48%' },
            { label: 'P', left: '70%', top: '48%' },
            { label: 'P', left: '80%', top: '48%' },
            { label: 'P', left: '90%', top: '48%' },
            { label: 'S', left: '5%', top: '45%' },
            { label: 'S', left: '95%', top: '45%' },
        ]
    },
    "Orange Kickoff": {
        positions: [
            { label: 'K', left: '50%', top: '55%' },
            { label: 'P', left: '10%', top: '48%' },
            { label: 'P', left: '20%', top: '48%' },
            { label: 'P', left: '30%', top: '48%' },
            { label: 'P', left: '40%', top: '48%' },
            { label: 'P', left: '60%', top: '48%' },
            { label: 'P', left: '70%', top: '48%' },
            { label: 'P', left: '80%', top: '48%' },
            { label: 'P', left: '90%', top: '48%' },
            { label: 'S', left: '5%', top: '45%' },
            { label: 'S', left: '95%', top: '45%' },
        ]
    },
    "Offensive Punt": {
        positions: [
            { label: 'K', left: '50%', top: '55%' },
            { label: 'P', left: '10%', top: '48%' },
            { label: 'P', left: '20%', top: '48%' },
            { label: 'P', left: '30%', top: '48%' },
            { label: 'P', left: '40%', top: '48%' },
            { label: 'P', left: '60%', top: '48%' },
            { label: 'P', left: '70%', top: '48%' },
            { label: 'P', left: '80%', top: '48%' },
            { label: 'P', left: '90%', top: '48%' },
            { label: 'S', left: '5%', top: '45%' },
            { label: 'S', left: '95%', top: '45%' },
        ]
    },
    "Kick Return": {
        positions: [
            { label: 'KR', left: '50%', top: '90%' },
            { label: 'KR', left: '25%', top: '85%' },
            { label: 'UB', left: '15%', top: '75%' },
            { label: 'UB', left: '85%', top: '75%' },
            { label: 'B', left: '20%', top: '65%' },
            { label: 'B', left: '40%', top: '65%' },
            { label: 'B', left: '60%', top: '65%' },
            { label: 'B', left: '80%', top: '65%' },
            { label: 'B', left: '30%', top: '55%' },
            { label: 'B', left: '70%', top: '55%' },
            { label: 'B', left: '50%', top: '55%' },
        ]
    },
    "Punt Return": {
        positions: [
            { label: 'PR', left: '50%', top: '90%' },
            { label: 'B', left: '25%', top: '80%' },
            { label: 'B', left: '75%', top: '80%' },
            { label: 'B', left: '15%', top: '70%' },
            { label: 'B', left: '40%', top: '70%' },
            { label: 'B', left: '60%', top: '70%' },
            { label: 'B', left: '85%', top: '70%' },
            { label: 'L', left: '30%', top: '55%' },
            { label: 'L', left: '50%', top: '55%' },
            { label: 'L', left: '70%', top: '55%' },
            { label: 'G', left: '5%', top: '53%' },
        ]
    },
    "P.A.T.": {
        positions: [
            { label: 'LS', left: '50%', top: '52%' },
            { label: 'LG', left: '45%', top: '52%' },
            { label: 'LT', left: '40%', top: '52%' },
            { label: 'TE', left: '35%', top: '52%' },
            { label: 'W', left: '25%', top: '52%' },
            { label: 'RG', left: '55%', top: '52%' },
            { label: 'RT', left: '60%', top: '52%' },
            { label: 'TE', left: '65%', top: '52%' },
            { label: 'W', left: '75%', top: '52%' },
            { label: 'H', left: '50%', top: '70%' },
            { label: 'K', left: '55%', top: '75%' },
        ]
    }
};