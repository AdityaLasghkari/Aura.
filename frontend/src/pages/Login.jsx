import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();

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

                <div className="space-y-8">
                    <button
                        onClick={login}
                        className="w-full py-5 bg-foreground text-background text-[11px] tracking-[0.4em] uppercase flex items-center justify-center space-x-4 group border border-transparent hover:bg-background hover:text-foreground hover:border-foreground transition-all font-bold"
                    >
                        <span>PROCEED TO AUTHENTICATION</span>
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

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
