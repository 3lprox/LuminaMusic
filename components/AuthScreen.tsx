import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [clientId, setClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load saved Client ID
    const saved = localStorage.getItem('lumina_client_id');
    if (saved) setClientId(saved);
  }, []);

  const handleGoogleLogin = () => {
    if (!clientId) {
        setError("Please enter a Google Cloud Client ID first.");
        return;
    }
    setError(null);
    localStorage.setItem('lumina_client_id', clientId);

    if (!window.google) {
        setError("Google Identity Services not loaded. Check internet connection.");
        return;
    }

    try {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/youtube.readonly',
            callback: (response: any) => {
                if (response.access_token) {
                    fetchProfile(response.access_token);
                } else {
                    setError("Login failed. No access token.");
                }
            },
        });
        client.requestAccessToken();
    } catch (e) {
        setError("Error initializing Google Sign-In. Check Client ID.");
    }
  };

  const fetchProfile = async (token: string) => {
    setIsLoading(true);
    try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        const user: User = {
            username: data.name,
            email: data.email,
            picture: data.picture,
            accessToken: token,
            clientId: clientId,
            isGuest: false
        };
        
        onLogin(user);
    } catch (e) {
        setError("Failed to fetch user profile.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
        username: "Guest",
        isGuest: true,
        picture: "https://lh3.googleusercontent.com/a/default-user=s96-c"
    };
    onLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-[#141218] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2B2930] rounded-[28px] p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Logo */}
        <div className="h-20 w-20 bg-[#D0BCFF] rounded-full flex items-center justify-center mb-6 text-[#381E72] shadow-lg shadow-[#D0BCFF]/20">
            <span className="material-symbols-rounded text-5xl">play_circle</span>
        </div>

        <h1 className="text-3xl text-[#E6E0E9] font-normal mb-2">Lumina Music</h1>
        <p className="text-[#CAC4D0] text-sm mb-8 max-w-xs">
            Sign in to sync your YouTube playlists and liked videos.
        </p>

        {/* Client ID Input (Since we are client-side only) */}
        <div className="w-full mb-6">
            <div className="relative group text-left">
                <label className="text-xs text-[#CAC4D0] ml-3 mb-1 block">Google Client ID (Required for Sign In)</label>
                <input 
                    type="text" 
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="728...apps.googleusercontent.com"
                    className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-[#D0BCFF] focus:border-2 transition-all"
                />
                <p className="text-[10px] text-[#CAC4D0] mt-1 ml-1">
                    Get this from Google Cloud Console &gt; Credentials.
                </p>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 w-full">
            <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#E8DEF8] text-[#1D192B] font-medium text-base hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <span>Loading...</span>
                ) : (
                    <>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5" alt="G" />
                        <span>Sign in with Google</span>
                    </>
                )}
            </button>

            <div className="flex items-center gap-4 w-full my-1">
                <div className="h-px bg-[#49454F] flex-1"></div>
                <span className="text-[#CAC4D0] text-xs uppercase">Or</span>
                <div className="h-px bg-[#49454F] flex-1"></div>
            </div>

            <button 
                onClick={handleGuestLogin}
                className="w-full py-3 rounded-full bg-transparent border border-[#938F99] text-[#E6E0E9] font-medium text-base hover:bg-[#E6E0E9]/5 transition-all"
            >
                Continue as Guest
            </button>
        </div>

        {error && (
            <div className="mt-6 p-3 rounded-xl bg-[#601410] text-[#FFB4AB] text-sm flex items-center gap-2 text-left w-full">
                <span className="material-symbols-rounded text-lg">error</span>
                <span className="flex-1">{error}</span>
            </div>
        )}

      </div>
    </div>
  );
};

export default AuthScreen;