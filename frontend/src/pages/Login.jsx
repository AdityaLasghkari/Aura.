import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
            toast.success('WELCOME BACK TO AURA');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'LOGIN FAILED');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
            {/* Background Grid Design */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.05)_0%,transparent_100%)] -z-10" />
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none -z-10" style={{
                backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                backgroundSize: '100px 100px',
                maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
            }} />

            <div className="max-w-md w-full space-y-16 relative z-10 py-20">

                <div className="text-center space-y-4">
                    <span className="label-text">IDENTIFICATION</span>
                    <h1 className="section-heading">WELCOME<br />BACK.</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-1 group">
                            <label className="text-[10px] tracking-widest text-gray-400 uppercase">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-colors text-foreground"
                                placeholder="EMAIL@EXAMPLE.COM"
                            />
                        </div>
                        <div className="space-y-1 group">
                            <label className="text-[10px] tracking-widest text-gray-400 uppercase">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-colors text-foreground"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-foreground text-background text-[11px] tracking-[0.4em] uppercase flex items-center justify-center space-x-4 group disabled:opacity-50 border border-transparent hover:bg-background hover:text-foreground hover:border-foreground transition-all font-bold"
                    >
                        {loading ? 'AUTHENTICATING...' : (
                            <>
                                <span>ENTER THE PLATFORM</span>
                                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-8 border-t border-border flex flex-col space-y-4">
                    <p className="text-[11px] text-gray-400 tracking-widest uppercase">New to the curation?</p>
                    <Link to="/register" className="text-[11px] tracking-widest uppercase font-bold hover:opacity-50 transition-opacity">
                        CREATE AN ACCOUNT
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
