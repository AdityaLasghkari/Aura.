import React from 'react';

const DefaultCover = ({ title, artist, genre }) => {
    return (
        <div className="w-full h-full bg-[#A9A9A9] flex flex-col items-center justify-center p-12 text-white text-center select-none relative overflow-hidden">
            <div className="flex flex-col items-center space-y-10 z-10">
                <div className="space-y-4">
                    <h2 className="text-[16px] md:text-[22px] font-serif italic tracking-tight leading-none max-w-[90%] mx-auto uppercase">
                        {title || 'MINIMAL ALBUM'}
                    </h2>
                    <p className="text-[9px] tracking-[0.5em] font-light uppercase opacity-60">
                        NATURAL SELECTION
                    </p>
                </div>

                <div className="w-8 h-px bg-white/40" />

                <div className="space-y-3">
                    <p className="text-[9px] md:text-[11px] tracking-[0.4em] font-medium uppercase">
                        {artist || 'AURA ARCHIVE'}
                    </p>
                    <div className="flex flex-col space-y-1 opacity-50">
                        <p className="text-[7px] md:text-[9px] tracking-[0.3em] font-light uppercase">
                            SONIC ARCHIVE BOUTIQUE
                        </p>
                        <p className="text-[7px] md:text-[9px] tracking-[0.3em] font-light uppercase">
                            COLLECTION OF VIBRATIONS
                        </p>
                        <p className="text-[7px] md:text-[9px] tracking-[0.3em] font-light uppercase">
                            {genre?.toUpperCase() || 'ESSENTIAL'} SELECTION
                        </p>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Very subtle grain */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
        </div>
    );
};

export default DefaultCover;
