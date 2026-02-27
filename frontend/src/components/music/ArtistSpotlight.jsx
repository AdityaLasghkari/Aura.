import { useState } from 'react';
import { useMobileInView } from '../../hooks/useMobileInView';
import { motion } from 'framer-motion';

const ArtistSpotlight = () => {
    const [imageError, setImageError] = useState(false);
    const { ref, isInView, isMobile } = useMobileInView(0.3);

    return (
        <section className="py-24 px-6 md:px-12 bg-muted/30">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="relative aspect-square md:aspect-[4/5] bg-muted overflow-hidden"
                >
                    {!imageError ? (
                        <img
                            ref={ref}
                            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop"
                            alt="Featured Artist"
                            className={`w-full h-full object-cover transition-all duration-1000 
                                ${isMobile && isInView ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                            <h2 className="text-white font-serif text-6xl opacity-20">AURA</h2>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                    className="space-y-8"
                >
                    <div className="space-y-2">
                        <span className="label-text text-foreground">ARTIST OF THE MONTH</span>
                        <h2 className="hero-title pt-4 leading-[0.9]">ELARA<br />VOX</h2>
                    </div>

                    <p className="body-text max-w-lg text-lg text-gray-400 leading-relaxed font-light">
                        Copenhagen-based Elara Vox blends skeletal techno rhythms with lush, expansive ambient textures. Her latest project, 'Silica', explores the intersection of organic soundscapes and digital decay.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
                        <button className="px-12 py-4 bg-foreground text-background text-[10px] tracking-[0.4em] uppercase border border-transparent hover:bg-background hover:text-foreground hover:border-foreground transition-all duration-500 font-bold">
                            EXPLORE WORKS
                        </button>
                        <button className="px-12 py-4 border border-border text-foreground text-[10px] tracking-[0.4em] uppercase hover:bg-foreground hover:text-background transition-all duration-500 font-bold">
                            READ INTERVIEW
                        </button>
                    </div>

                    <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-border">
                        <div>
                            <p className="text-xl md:text-2xl font-serif">1.2M</p>
                            <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-400 mt-1">MONTHLY LISTENERS</p>
                        </div>
                        <div>
                            <p className="text-xl md:text-2xl font-serif">14</p>
                            <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-400 mt-1">RELEASES</p>
                        </div>
                        <div className="col-span-2 md:col-span-1 border-t border-border md:border-t-0 pt-8 md:pt-0">
                            <p className="text-xl md:text-2xl font-serif">32</p>
                            <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-400 mt-1">SESSIONS</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ArtistSpotlight;
