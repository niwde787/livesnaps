import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

interface GameClockContextType {
    gameTime: number;
    isClockRunning: boolean;
    setGameTime: (time: number) => void;
    setIsClockRunning: (running: boolean) => void;
    handleToggleClock: () => void;
    getGameTime: () => number;
}

const GameClockContext = createContext<GameClockContextType | undefined>(undefined);

export const useGameClock = (): GameClockContextType => {
    const context = useContext(GameClockContext);
    if (context === undefined) {
        throw new Error('useGameClock must be used within a GameClockProvider');
    }
    return context;
};

export const GameClockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameTime, setGameTime] = useState(10 * 60);
    const [isClockRunning, setIsClockRunning] = useState(false);
    const gameTimeRef = React.useRef(gameTime);

    useEffect(() => {
        gameTimeRef.current = gameTime;
    }, [gameTime]);

    const getGameTime = useCallback(() => gameTimeRef.current, []);

    const handleToggleClock = useCallback(() => {
        setIsClockRunning(prev => !prev);
    }, []);

    useEffect(() => {
        let interval: number | undefined;
        if (isClockRunning && gameTime > 0) {
            interval = window.setInterval(() => {
                setGameTime(prev => {
                    const next = Math.max(0, prev - 1);
                    return next;
                });
            }, 1000);
        } else if (gameTime === 0 && isClockRunning) {
            setIsClockRunning(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isClockRunning, gameTime]);

    return (
        <GameClockContext.Provider value={{
            gameTime,
            isClockRunning,
            setGameTime,
            setIsClockRunning,
            handleToggleClock,
            getGameTime
        }}>
            {children}
        </GameClockContext.Provider>
    );
};
