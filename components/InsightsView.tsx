import React, { useState, useMemo } from 'react';
import { Player, Play, Highlight, PlayResult, Drive, PlayerStats, AiSummary } from '../types';
import { SpinnerIcon, SparklesIcon } from './icons';
import { generateTextResponse } from '../utils/aiHelper';
import { getLastName, calculateDrives, parseGameTime, formatTime, parseSimpleMarkdown } from '../utils';
import DriveChart from './DriveChart';
import { useGameState } from '../contexts/GameStateContext';
import { Type } from "@google/genai";

const TeamStatRow: React.FC<{ label: string; ourValue: string | number; oppValue: string | number; invertColors?: boolean }> = ({ label, ourValue, oppValue, invertColors = false }) => {
    const ourValNum = typeof ourValue === 'number' ? ourValue : parseFloat(ourValue as string) || 0;
    const oppValNum = typeof oppValue === 'number' ? oppValue : parseFloat(oppValue as string) || 0;
    const total = ourValNum + oppValNum;
    
    const ourWidth = total > 0 ? (ourValNum / total) * 100 : (ourValNum > 0 ? 100 : (oppValNum > 0 ? 0 : 50));
    
    const isOurBetter = invertColors ? ourValNum < oppValNum : ourValNum > oppValNum;
    const isOppBetter = invertColors ? ourValNum > oppValNum : ourValNum < oppValNum;
    const isEqual = ourValNum === oppValNum;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className={`font-mono font-bold text-lg ${isOurBetter ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{ourValue}</span>
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <span className={`font-mono font-bold text-lg ${isOppBetter ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{oppValue}</span>
            </div>
            <div className="flex h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div className={`transition-all duration-500 ${isOurBetter && !isEqual ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-primary)]'}`} style={{ width: `${ourWidth}%` }}></div>
                <div className={`transition-all duration-500 ${isOppBetter && !isEqual ? 'bg-[var(--accent-special)]' : 'bg-[var(--border-primary)]'}`} style={{ width: `${100 - ourWidth}%` }}></div>
            </div>
        </div>
    );
};

const InsightCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
        <h4 className="text-md font-bold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-2 mb-3">{title}</h4>
        {children}
    </div>
);

const MomentumChart: React.FC<{ playHistory: Play[], teamName: string, opponentName: string }> = ({ playHistory, teamName, opponentName }) => {
    const dataPoints = useMemo(() => {
        let currentDifferential = 0;
        const points = [{ time: 0, diff: 0, desc: 'Start' }]; 
        playHistory.forEach((play, index) => {
            const diff = (play.ourScore || 0) - (play.opponentScore || 0);
            if (diff !== currentDifferential) {
                points.push({ time: index + 1, diff: diff, desc: play.playResult || 'Score' });
                currentDifferential = diff;
            } else if (index === playHistory.length - 1) {
                points.push({ time: index + 1, diff: diff, desc: 'Current' });
            }
        });
        if (points.length < 2) {
            points.push({ time: 1, diff: 0, desc: 'Current' });
        }
        return points;
    }, [playHistory]);

    if (playHistory.length === 0) return null;

    const maxDiff = Math.max(...dataPoints.map(p => Math.abs(p.diff)), 7); 
    const range = maxDiff * 2;
    const width = 100;
    const height = 60;
    
    const maxX = dataPoints[dataPoints.length - 1].time;
    
    const getSvgCoords = (time: number, diff: number) => {
        const x = (time / maxX) * width;
        const normalizedDiff = diff / maxDiff; 
        const y = (height / 2) - (normalizedDiff * (height / 2) * 0.8); 
        return `${x},${y}`;
    };

    const polylinePoints = dataPoints.map(p => getSvgCoords(p.time, p.diff)).join(' ');
    const areaPoints = `0,${height/2} ${polylinePoints} ${width},${height/2}`;

    return (
        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg mb-6 shadow-inner border border-[var(--border-primary)]">
            <h4 className="text-md font-bold text-[var(--text-primary)] mb-4">Game Momentum</h4>
            <div className="relative w-full aspect-[2/1]">
                <div className="absolute top-2 left-2 text-xs font-bold text-[var(--accent-primary)]">{teamName}</div>
                <div className="absolute bottom-2 left-2 text-xs font-bold text-[var(--accent-special)]">{opponentName}</div>
                
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="var(--border-primary)" strokeWidth="0.5" strokeDasharray="2" />
                    <defs>
                        <linearGradient id="momentumGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                            <stop offset="50%" stopColor="var(--accent-special)" stopOpacity="0.0" />
                            <stop offset="100%" stopColor="var(--accent-special)" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>
                    <polygon points={areaPoints} fill="url(#momentumGradient)" />
                    <polyline points={polylinePoints} fill="none" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinejoin="round" />
                    {dataPoints.map((p, i) => {
                        const [cx, cy] = getSvgCoords(p.time, p.diff).split(',');
                        if (i === 0 && p.diff === 0) return null; 
                        return (
                            <circle key={i} cx={cx} cy={cy} r="2" fill={p.diff > 0 ? 'var(--accent-primary)' : p.diff < 0 ? 'var(--accent-special)' : 'var(--text-secondary)'} stroke="var(--bg-primary)" strokeWidth="0.5" />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

const InsightsView: React.FC = () => {
    const { playHistory, players, opponentNames, selectedWeek, fieldLogoUrl, ourStats, opponentStats, teamName, aiSummary, setAiSummary } = useGameState();
    const opponentName = opponentNames[selectedWeek];

    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [activeInsightTab, setActiveInsightTab] = useState<'stats' | 'charts' | 'summary'>('stats');
    
    const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
    const allDrives = useMemo(() => calculateDrives(playHistory), [playHistory]);

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        setSummaryError(null);
        setAiSummary(null);

        try {
            const simplifiedPlays = playHistory.map(play => ({ quarter: play.quarter, down: play.down, formation: play.formationName, playType: play.type, result: play.playResult, yardsGained: play.yardsGained, highlights: play.highlights ? (Object.keys(play.highlights) as (keyof Highlight)[]).reduce((acc: Partial<Record<keyof Highlight, string>>, key) => { const playerId = play.highlights![key]; if (playerId) { const player = playerMap.get(playerId); if (player) { acc[key] = `#${player.jerseyNumber} ${getLastName(player.name)}`; return acc; } } acc[key] = 'N/A'; return acc; }, {}) : {} }));

            const prompt = `
                You are an expert football coaching analyst. Analyze the provided play-by-play data for the team "${teamName}" against "${opponentName}".

                Your task is to provide a comprehensive, tactical summary for a coach in five distinct parts. The output must be a valid JSON object matching the provided schema.

                1.  **gameBreakdown**: A general overview of the game flow in markdown format. Discuss key moments, scoring drives, and the overall narrative.
                2.  **impactPlays**: An array of 2-4 of the most game-changing plays. For each play, provide a concise description, the quarter, game time, and the result.
                3.  **thingsToWorkOn**: A markdown-formatted list of 2-3 specific, actionable areas for improvement based on patterns in the data (e.g., struggling against a certain play type, penalties, ineffective formations).
                4.  **formationAnalysis**: A markdown-formatted analysis of the most and least efficient formations for both offense and defense.
                5.  **playerHighlights**: A markdown-formatted summary of standout individual player contributions (positive or negative).

                Keep the tone professional and analytical.

                Here is the play data in JSON format:
                ${JSON.stringify(simplifiedPlays, null, 2)}
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    gameBreakdown: { type: Type.STRING },
                    impactPlays: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                playDescription: { type: Type.STRING },
                                quarter: { type: Type.NUMBER },
                                gameTime: { type: Type.STRING },
                                result: { type: Type.STRING }
                            }
                        }
                    },
                    thingsToWorkOn: { type: Type.STRING },
                    formationAnalysis: { type: Type.STRING },
                    playerHighlights: { type: Type.STRING }
                }
            };

            const responseText = await generateTextResponse(prompt, 'gemini-2.5-flash', responseSchema);
            const jsonResponse = JSON.parse(responseText) as AiSummary;
            setAiSummary(jsonResponse);
        } catch (e) {
            console.error("Error generating AI summary:", e);
            setSummaryError("AI summary is currently unavailable. Please check your API key and network connection.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleDriveJump = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const driveId = event.target.value;
        if (driveId) {
            const element = document.getElementById(driveId);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const formatEfficiency = (conversions: number, attempts: number) => {
        const conv = conversions || 0;
        const att = attempts || 0;
        if (att === 0) return '0/0 (0%)';
        const percent = Math.round((conv / att) * 100);
        return `${conv}/${att} (${percent}%)`;
    };
    
    const inactiveTabClass = "border-transparent text-[var(--text-secondary)] hover:text-white";
    const activeTabClass = "border-[var(--accent-primary)] text-[var(--accent-primary)]";

    return (
        <div className="bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-primary)]">
            <div className="p-4 border-b border-[var(--border-primary)]">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Insights</h2>
            </div>
            
            <div className="px-4 border-b border-[var(--border-primary)] flex">
                <button onClick={() => setActiveInsightTab('stats')} className={`py-3 px-4 font-bold border-b-2 transition-colors duration-200 text-sm ${activeInsightTab === 'stats' ? activeTabClass : inactiveTabClass}`}>Team Stats</button>
                <button onClick={() => setActiveInsightTab('charts')} className={`py-3 px-4 font-bold border-b-2 transition-colors duration-200 text-sm ${activeInsightTab === 'charts' ? activeTabClass : inactiveTabClass}`}>Drive Chart</button>
                <button onClick={() => setActiveInsightTab('summary')} className={`py-3 px-4 font-bold border-b-2 transition-colors duration-200 text-sm ${activeInsightTab === 'summary' ? activeTabClass : inactiveTabClass}`}>AI Tactical Breakdown</button>
            </div>

            <div className="p-4">
                {activeInsightTab === 'charts' && (
                    <div className="bg-[var(--bg-primary)] p-4 rounded-lg">
                        {allDrives.length > 0 && (
                            <div className="mb-4">
                                <label htmlFor="drive-jump" className="text-sm font-medium text-[var(--text-secondary)] mr-2">Jump to Drive:</label>
                                <select id="drive-jump" onChange={handleDriveJump} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm rounded-md p-2 focus:ring-1 focus:ring-[var(--accent-primary)]">
                                    <option value="">Select a Drive...</option>
                                    {allDrives.map(drive => (
                                        <option key={drive.driveNumber} value={`drive-chart-${drive.driveNumber}`}>Drive #{drive.driveNumber} ({drive.summary.playCount} plays, {drive.summary.yards > 0 ? '+' : ''}{drive.summary.yards} yds)</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-start gap-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                            {allDrives.length > 0 ? (
                                allDrives.map(drive => (
                                    <div key={drive.driveNumber} id={`drive-chart-${drive.driveNumber}`} className="w-full bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-primary)]">
                                        <div className="flex justify-between items-baseline mb-2 flex-wrap gap-x-4">
                                            <h4 className="font-bold text-lg text-[var(--text-primary)]">Drive #{drive.driveNumber}</h4>
                                            <p className="text-xs text-[var(--text-secondary)] font-mono">{drive.summary.playCount} plays | {drive.summary.yards > 0 ? '+' : ''}{drive.summary.yards} yds | {drive.summary.timeOfPossession}</p>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] mb-3"><span className="font-semibold">Result:</span> {drive.summary.result}</p>
                                        <DriveChart drivePlays={drive.plays.map(p => p.play)} fieldLogoUrl={fieldLogoUrl} players={players} />
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-[var(--text-secondary)] py-16">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-500" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p>No drives recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeInsightTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InsightCard title="Team Statistics">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-[var(--text-secondary)] font-bold mb-2">
                                        <span>{teamName}</span>
                                        <span>{opponentName}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <TeamStatRow label="First Downs" ourValue={ourStats.firstDowns} oppValue={opponentStats.firstDowns} />
                                        <TeamStatRow label="Total Yards" ourValue={ourStats.totalYards} oppValue={opponentStats.totalYards} />
                                        <TeamStatRow label="Passing Yards" ourValue={ourStats.passingYards} oppValue={opponentStats.passingYards} />
                                        <TeamStatRow label="Rushing Yards" ourValue={ourStats.rushingYards} oppValue={opponentStats.rushingYards} />
                                        <TeamStatRow label="Turnovers" ourValue={ourStats.turnovers} oppValue={opponentStats.turnovers} invertColors />
                                        <TeamStatRow label="Penalties" ourValue={`${ourStats.penalties} (${ourStats.penaltyYards}yds)`} oppValue={`${opponentStats.penalties} (${opponentStats.penaltyYards}yds)`} invertColors />
                                        <TeamStatRow label="3rd Down" ourValue={formatEfficiency(ourStats.thirdDownConversions, ourStats.thirdDownAttempts)} oppValue={formatEfficiency(opponentStats.thirdDownConversions, opponentStats.thirdDownAttempts)} />
                                        <TeamStatRow label="4th Down" ourValue={formatEfficiency(ourStats.fourthDownConversions, ourStats.fourthDownAttempts)} oppValue={formatEfficiency(opponentStats.fourthDownConversions, opponentStats.fourthDownAttempts)} />
                                        <TeamStatRow label="Possession" ourValue={formatTime(ourStats.timeOfPossession)} oppValue={formatTime(opponentStats.timeOfPossession)} />
                                    </div>
                                </div>
                            </div>
                        </InsightCard>
                        <div>
                            <MomentumChart playHistory={playHistory} teamName={teamName} opponentName={opponentName} />
                        </div>
                    </div>
                )}

                {activeInsightTab === 'summary' && (
                    <div className="bg-[var(--bg-tertiary)] p-6 rounded-lg min-h-[300px]">
                        {aiSummary ? (
                            <div className="space-y-6 animate-fade-in text-[var(--text-primary)]">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--accent-primary)] mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5"/> Game Breakdown</h3>
                                    <div className="prose prose-sm prose-invert max-w-none text-sm text-[var(--text-secondary)] whitespace-pre-line" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(aiSummary.gameBreakdown) }}></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-black/20 p-4 rounded-lg">
                                        <h4 className="font-bold text-[var(--text-primary)] mb-2 border-b border-[var(--border-primary)] pb-1">Impact Plays</h4>
                                        <ul className="space-y-3">
                                            {aiSummary.impactPlays.map((play, i) => (
                                                <li key={i} className="text-sm">
                                                    <span className="block font-semibold text-[var(--accent-secondary)]">{play.result}</span>
                                                    <span className="text-[var(--text-secondary)]">{play.playDescription} (Q{play.quarter} {play.gameTime})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-black/20 p-4 rounded-lg">
                                            <h4 className="font-bold text-[var(--text-primary)] mb-2 border-b border-[var(--border-primary)] pb-1">Key Areas to Improve</h4>
                                            <div className="prose prose-sm prose-invert max-w-none text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(aiSummary.thingsToWorkOn) }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-black/20 p-4 rounded-lg">
                                        <h4 className="font-bold text-[var(--text-primary)] mb-2 border-b border-[var(--border-primary)] pb-1">Formation Analysis</h4>
                                        <div className="prose prose-sm prose-invert max-w-none text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(aiSummary.formationAnalysis) }}></div>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-lg">
                                        <h4 className="font-bold text-[var(--text-primary)] mb-2 border-b border-[var(--border-primary)] pb-1">Player Highlights</h4>
                                        <div className="prose prose-sm prose-invert max-w-none text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(aiSummary.playerHighlights) }}></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                {isGeneratingSummary ? (
                                    <>
                                        <SpinnerIcon className="w-10 h-10 text-[var(--accent-primary)] mb-4" />
                                        <p className="text-[var(--text-primary)] font-semibold">Generating tactical analysis...</p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-2">This may take a few seconds.</p>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-12 h-12 text-[var(--text-secondary)] mb-4" />
                                        <p className="text-[var(--text-primary)] font-semibold mb-2">AI Tactical Breakdown</p>
                                        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">Generate a comprehensive summary of the game, including key plays, areas for improvement, and formation analysis.</p>
                                        <button 
                                            onClick={handleGenerateSummary}
                                            className="px-6 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)] flex items-center gap-2"
                                        >
                                            <SparklesIcon className="w-5 h-5" />
                                            Generate Analysis
                                        </button>
                                        {summaryError && <p className="text-red-400 text-sm mt-4">{summaryError}</p>}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsightsView;