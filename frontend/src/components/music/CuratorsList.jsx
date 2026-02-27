import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import userService from '../../services/userService';

const CuratorsList = () => {
    const [curators, setCurators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurators = async () => {
            try {
                const res = await userService.getCurators();
                setCurators(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCurators();
    }, []);

    if (loading || curators.length === 0) return null;

    return (
        <section className="py-24 border-y border-gray-50 bg-[#fafafa]/50">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
                <div className="flex justify-between items-baseline mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-black">
                            <Sparkles size={14} />
                            <span className="text-[10px] tracking-[0.4em] font-bold uppercase">SONIC ARCHITECTS</span>
                        </div>
                        <h2 className="text-5xl font-serif leading-none tracking-tight">FEATURED<br />CURATORS</h2>
                    </div>

                    <Link to="/curators" className="group flex items-center space-x-4 text-[10px] tracking-[0.3em] font-bold text-gray-400 hover:text-black transition-all">
                        <span>EXPLORE ALL ARCHITECTS</span>
                        <div className="w-12 h-px bg-gray-200 group-hover:w-16 group-hover:bg-black transition-all duration-500" />
                    </Link>
                </div>

                <div className="flex space-x-16 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                    {curators.slice(0, 8).map((curator, index) => (
                        <motion.div
                            key={curator._id}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                            className="flex-shrink-0"
                        >
                            <Link to={`/curator/${curator._id}`} className="group block text-center space-y-8">
                                <div className="relative">
                                    {/* Rotating Border for Active Feel */}
                                    <div className="absolute -inset-4 border border-dashed border-gray-100 rounded-full group-hover:rotate-90 group-hover:border-black/20 transition-all duration-[2000ms]" />

                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden relative z-10 shadow-sm border-4 border-white">
                                        {curator.avatar ? (
                                            <img
                                                src={curator.avatar}
                                                alt={curator.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                                <span className="font-serif text-3xl text-gray-200 group-hover:text-black/5 transition-colors">
                                                    {curator.name.substring(0, 1).toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Minimal Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <ArrowRight className="text-white -rotate-45" size={24} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-serif text-xl tracking-tight group-hover:text-black transition-colors">
                                        {curator.name}
                                    </h4>
                                    <div className="flex items-center justify-center space-x-2 text-[9px] tracking-widest text-gray-400 uppercase font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-black transition-colors" />
                                        <span>{curator.followers?.length || 0} RESONATORS</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default CuratorsList;
