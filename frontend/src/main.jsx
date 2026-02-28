import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { SyncProvider } from './context/SyncContext';
import { ThemeProvider } from './context/ThemeContext';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <KindeProvider
        clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
        domain={import.meta.env.VITE_KINDE_DOMAIN}
        redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URL}
        logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URL}
      >
        <ThemeProvider>
          <AuthProvider>
            <MusicProvider>
              <SyncProvider>
                <App />
              </SyncProvider>
            </MusicProvider>
          </AuthProvider>
        </ThemeProvider>
      </KindeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
