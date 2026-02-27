import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare } from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../context/AuthContext';

const LiveChat = ({ isOpen, onClose }) => {
    const { messages, sendMessage, roomCode } = useSync();
    const { user } = useAuth();
    const [msgInput, setMsgInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (msgInput.trim()) {
            sendMessage(msgInput);
            setMsgInput('');
        }
    };

    if (!roomCode) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70] lg:hidden" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed bottom-32 right-6 w-80 h-[500px] max-h-[70vh] bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] flex flex-col overflow-hidden z-[80] [backdrop-filter:blur(20px)]"
                    >
                        {/* Dark gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                        <div className="p-4 border-b border-white/10 flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-2">
                                <MessageSquare size={14} className="text-white/30" />
                                <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-white/50">Live Chat</span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide relative z-10">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-2">
                                    <MessageSquare size={32} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No messages yet</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.user === user.name ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[9px] text-white/40 font-bold mb-1 uppercase tracking-widest">
                                            {msg.user}
                                        </span>
                                        <div className={`px-4 py-2 rounded-2xl text-[12px] max-w-[90%] break-words ${msg.user === user.name ? 'bg-foreground text-background font-medium' : 'bg-white/5 border border-white/10'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 border-t border-white/10 relative z-10">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={msgInput}
                                    onChange={(e) => setMsgInput(e.target.value)}
                                    placeholder="TYPE A MESSAGE..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-2.5 pr-12 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white/20 transition-colors placeholder:opacity-50"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LiveChat;
