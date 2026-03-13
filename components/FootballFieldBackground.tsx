import React from 'react';

interface FootballFieldBackgroundProps {
    logoUrl?: string;
}

const FootballFieldBackground: React.FC<FootballFieldBackgroundProps> = ({ logoUrl = "https://raw.githubusercontent.com/niwde787/CJF/1f4df5f83d0fbb85bc6ea1ac8ed36765f518e995/SNAPS_H.svg" }) => {
    const yardMarkers = [10, 20, 30, 40, 50, 60, 70, 80, 90]; 

    return (
        <div className="absolute inset-0 bg-green-800/80 border-4 border-gray-600 overflow-hidden text-white/80 rounded-lg">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 50%, transparent 50%)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(rgba(0,0,0,0.2), transparent, transparent, rgba(0,0,0,0.2))' }}></div>
            
             <img 
                src={logoUrl} 
                alt="Field Logo" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1/3 opacity-20 pointer-events-none" 
            />

            {yardMarkers.map(yard => {
                const displayYard = yard <= 50 ? yard : 100 - yard;
                return (
                    <React.Fragment key={`line-${yard}`}>
                        <div className={`absolute top-0 bottom-0 ${yard === 50 ? 'w-1' : 'w-px'} bg-white/70`} style={{ left: `${yard}%` }} />
                        {displayYard !== 50 && (
                            <>
                                <div className="absolute -translate-x-1/2" style={{ left: `${yard}%`, top: '8%' }}>
                                    <span className="font-bold text-base transform -rotate-90 inline-block select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{displayYard}</span>
                                </div>
                                <div className="absolute -translate-x-1/2" style={{ left: `${yard}%`, bottom: '8%' }}>
                                    <span className="font-bold text-base transform rotate-90 inline-block select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{displayYard}</span>
                                </div>
                            </>
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    );
};

export default FootballFieldBackground;