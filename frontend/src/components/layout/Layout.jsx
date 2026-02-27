import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import MusicPlayer from './MusicPlayer';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col pt-20">
            <Navigation />

            <main className="flex-grow">
                <Outlet />
            </main>

            <Footer />
            <MusicPlayer />

            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'var(--foreground)',
                        color: 'var(--background)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontWeight: '600'
                    },
                }}
            />
        </div>
    );
};

export default Layout;
