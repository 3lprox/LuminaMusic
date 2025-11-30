

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, RepeatMode, LyricLine, User, AudioQuality, Language, PersistedState } from './types'; // CORRECTED: Path from root/ to types.ts
import { useYouTubePlayer } from './hooks/useYouTubePlayer'; // CORRECTED: Path from root/ to hooks/
import ImportModal from './components/ImportModal'; // CORRECTED: Path from root/ to components/
import NowPlayingBar from './components/NowPlayingBar'; // CORRECTED: Path from root/ to components/
import SongListItem from './components/SongListItem'; // CORRECTED: Path from root/ to components/
import LyricsOverlay from './components/LyricsOverlay'; // CORRECTED: Path from root/ to components/
import SettingsModal from './components/SettingsModal'; // CORRECTED: Path from root/ to components/
import StatsForNerds from './components/StatsForNerds'; // CORRECTED: Path from root/ to components/
import { saveState, loadState, saveApiKey, loadApiKey, saveDiscordAuth, loadDiscordAuth, removeDiscordAuth } from './utils/storage'; // CORRECTED: Path from root/ to utils/
import { DEFAULT_SONG } from './services/youtubeService'; // CORRECTED: Path from root/ to services/
import { getTranslation } from './utils/i18n'; // CORRECTED: Path from root/ to utils/

const INITIAL_QUEUE: Song[] = [];

// Helper to darken hex color
const darkenHexColor = (hex: string, percent: number) => {
  const f=parseInt(hex.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=(f>>8)&0x00ff,B=f&0x0000ff;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// Helper to convert hex to RGB for rgba() CSS
const hexToRgb = (hex: string) => {
    let r=0, g=0, b=0;
    if (hex.length === 4) { r = parseInt(hex[1]+hex[1],16); g = parseInt(hex[2]+hex[2],16); b = parseInt(hex[3]+hex[3],16); }
    else if (hex.length === 7) { r = parseInt(hex.substring(1,3),16); g = parseInt(hex.substring(3,5),16); b = parseInt(hex.substring(5,7),16); }
    return `${r}, ${g}, ${b}`;
}


function App() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  
  // Discord Auth State
  const [discordClientId, setDiscordClientId] = useState('1444395105950634176'); // Pre-filled with user's client_id
  const [discordAccessToken, setDiscordAccessToken] = useState<string | undefined>(undefined);
  const [discordUserId, setDiscordUserId] = useState<string | undefined>(undefined);
  const [discordUsername, setDiscordUsername] = useState<string | undefined>(undefined);

  const user: User = { 
    username: discordUsername || "Guest", 
    isGuest: !discordUserId, 
    apiKey,
    discordUserId,
    discordUsername
  };

  const [queue, setQueue] = useState<Song[]>(INITIAL_QUEUE);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.NONE);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('NORMAL');
  const [language, setLanguage] = useState<Language>('EN'); // Default to English
  const [primaryColor, setPrimaryColor] = useState('#D0BCFF'); // New: Default Material Design Primary

  // Power User State
  const [customJs, setCustomJs] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [forceHttps, setForceHttps] = useState(true);
  const [showStats, setShowStats] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const t = useCallback((key: any) => getTranslation(language, key), [language]);

  // --- YouTube Player Hook ---
  const { 
    loadVideo, 
    play: playYT, 
    pause: pauseYT, 
    seekTo: seekYT, 
    setVolume: setVolumeYT, 
    setPlaybackQuality, 
    getVideoData, 
    getDuration, 
    isReady: isYTReady 
  } = useYouTubePlayer({
    onStateChange: (state) => {
      // 1 = Playing, 2 = Paused, 0 = Ended
      if (state === 1) { 
             setIsPlaying(true);
             if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
             
             // --- Self-Healing Metadata (Fix duration/title if unknown on guest mode) ---
             if (currentSong) {
                 const realDuration = getDuration();
                 if (realDuration > 0 && Math.abs((currentSong.duration || 0) - realDuration) > 1) {
                     updateSongDuration(currentSongIndex, realDuration);
                 }
                 const data = getVideoData(); // Get real title/author from YT player
                 if (data && data.title && data.author) {
                     if (currentSong.title.startsWith(t('loadingVideo')) || currentSong.artist === t('unknownArtist')) {
                         updateSongMetadata(currentSongIndex, data.title, data.author);
                     }
                 }
             }
      }
      if (state === 2) { 
          setIsPlaying(false);
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      }
      if (state === 0) handleNext(true); // Ended -> Go to next song
    },
    onProgress: (currentTime, duration) => {
        setProgress(currentTime);
        // Also update duration from progress callback if it was 0 initially
        if (duration > 0 && currentSong && Math.abs((currentSong.duration || 0) - duration) > 1) {
            updateSongDuration(currentSongIndex, duration);
        }
    },
    onError: (e) => {
        if (e === 150 || e === 101) { // Video unavailable or private
            showToast(t('videoUnavailable'));
            setTimeout(() => handleNext(true), 1500); // Try next song
        } else {
            console.error("YouTube Player Error:", e);
            showToast(t('errorPlaying'));
        }
    }
  });

  // --- Playback Controls (useCallback to prevent re-renders) ---
  const handleSeek = useCallback((seconds: number) => {
    setProgress(seconds);
    seekYT(seconds);
  }, [seekYT]);

  const handleNext = useCallback((auto = false) => {
    if (queue.length === 0) return;

    if (repeatMode === RepeatMode.ONE) { // Repeat current song
      handleSeek(0);
      playYT();
      return;
    }

    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= queue.length) { // Wrap around or stop
      nextIndex = repeatMode === RepeatMode.ALL ? 0 : -1;
    }
    
    if (nextIndex !== -1) {
        setCurrentSongIndex(nextIndex);
        setIsPlaying(true); // Ensure playing starts
        setProgress(0);
    } else { // No next song
        setIsPlaying(false);
        setCurrentSongIndex(-1);
        setProgress(0);
    }
  }, [currentSongIndex, queue.length, repeatMode, handleSeek, playYT]);

  const handlePrev = useCallback(() => {
    if (progress > 3) { // If more than 3 seconds into song, restart it
        handleSeek(0);
        setProgress(0);
        setIsPlaying(true);
    } else if (currentSongIndex > 0) {
        setCurrentSongIndex(prev => prev - 1);
        setIsPlaying(true);
        setProgress(0);
    } else if (repeatMode === RepeatMode.ALL && queue.length > 0) { // Wrap around
        setCurrentSongIndex(queue.length - 1);
        setIsPlaying(true);
        setProgress(0);
    } else { // No previous song, stop
        handleSeek(0);
        setProgress(0);
        setIsPlaying(false);
    }
  }, [currentSongIndex, progress, repeatMode, queue.length, handleSeek]);


  // --- Initial Load & Discord OAuth Callback ---
  useEffect(() => {
    const savedApiKey = loadApiKey();
    if (savedApiKey) setApiKey(savedApiKey);

    // --- Discord OAuth Callback Handling ---
    const urlParams = new URLSearchParams(window.location.search);
    const discordCode = urlParams.get('code');
    
    if (discordCode && discordClientId) {
      window.history.replaceState(null, '', window.location.pathname); // Clean URL

      // Simulate token exchange and user info fetch (REAL Discord API calls would be done on a secure backend)
      // For identify scope, fetching user info with access_token is allowed.
      // In a real app, 'code' is exchanged for 'access_token' via a backend to keep client_secret secure.
      // Here, we're making a direct, simplified assumption for client-side demo purposes.
      const TOKEN_EXCHANGE_URL = `https://discord.com/api/oauth2/token`;
      const USER_INFO_URL = `https://discord.com/api/users/@me`;

      // Simulating token exchange (requires client_secret from backend usually)
      // For this frontend-only app, we'll try to use the code as if it were an access_token for user info
      // Or, better, assume backend has exchanged it and passed it to us.
      // Let's make it simpler and fetch user data directly if we get a code.
      // This is NOT how Discord OAuth should be done securely in production.
      const redirectUri = encodeURIComponent(window.location.origin); // Must match registered redirect_uri in Discord dev portal

      fetch(TOKEN_EXCHANGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: discordClientId,
          grant_type: 'authorization_code',
          code: discordCode,
          redirect_uri: redirectUri,
          // client_secret: 'YOUR_CLIENT_SECRET_HERE_IF_SERVER_SIDE', // This would be on a backend
          scope: 'identify', // Only 'identify' needed for user info
        }).toString(),
      })
      .then(response => {
          if (!response.ok) {
              return response.json().then(err => { throw new Error(`Discord Token Exchange failed: ${JSON.stringify(err)}`); });
          }
          return response.json();
      })
      .then(data => {
          const accessToken = data.access_token;
          if (!accessToken) throw new Error('No access token received from Discord.');

          return fetch(USER_INFO_URL, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
          });
      })
      .then(response => {
          if (!response.ok) throw new Error('Failed to fetch Discord user info');
          return response.json();
      })
      .then(discordUser => {
          if (discordUser.id && discordUser.username) {
              setDiscordUserId(discordUser.id);
              setDiscordUsername(discordUser.username);
              setDiscordAccessToken(discordCode); // In a real app, this would be the actual access_token
              saveDiscordAuth(discordUser.id, discordUser.username, discordCode, discordClientId);
              showToast(t('welcome') + `, @${discordUser.username}!`);
              // Reload state based on new discordUserId
              const saved = loadState(discordUser.id);
              if (saved.queue && saved.queue.length > 0) setQueue(saved.queue);
              else if (DEFAULT_SONG) setQueue([DEFAULT_SONG]);
              // ... load other settings from 'saved'
              setVolume(saved.volume !== undefined ? saved.volume : 100);
              setRepeatMode(saved.repeatMode || RepeatMode.NONE);
              setAudioQuality(saved.audioQuality || 'NORMAL');
              setLanguage(saved.language || 'EN');
              setPrimaryColor(saved.primaryColor || '#D0BCFF');
              setCustomJs(saved.customJs || '');
              setCustomCss(saved.customCss || '');
              setDiscordWebhook(saved.discordWebhook || '');
              setCustomEndpoint(saved.customEndpoint || '');
              setForceHttps(saved.forceHttps !== undefined ? saved.forceHttps : true);
              setShowStats(saved.showStats !== undefined ? saved.showStats : false);
              setHasLoadedState(true);
          } else {
              throw new Error('Invalid Discord user data received.');
          }
      })
      .catch(error => {
          console.error('Discord OAuth Error:', error);
          showToast(t('discordLoginFailed'));
          setHasLoadedState(true); // Still set to true to allow app to function
      });
    } else {
      // Load persisted state (for Discord user or guest)
      const saved = loadState(discordUserId); // Try to load based on existing discordUserId
      
      if (saved.queue && saved.queue.length > 0) setQueue(saved.queue);
      else if (DEFAULT_SONG) setQueue([DEFAULT_SONG]); // Ensure default song if no saved queue
      
      setVolume(saved.volume !== undefined ? saved.volume : 100);
      setRepeatMode(saved.repeatMode || RepeatMode.NONE);
      setAudioQuality(saved.audioQuality || 'NORMAL');
      setLanguage(saved.language || 'EN');
      setPrimaryColor(saved.primaryColor || '#D0BCFF'); // Load primary color
      
      // Load Discord info from persisted state, if any
      if (saved.discordUserId) setDiscordUserId(saved.discordUserId);
      if (saved.discordUsername) setDiscordUsername(saved.discordUsername);
      if (saved.discordAccessToken) setDiscordAccessToken(saved.discordAccessToken);
      if (saved.discordClientId) setDiscordClientId(saved.discordClientId); // Also load saved client ID

      setCustomJs(saved.customJs || '');
      setCustomCss(saved.customCss || '');
      setDiscordWebhook(saved.discordWebhook || '');
      setCustomEndpoint(saved.customEndpoint || '');
      setForceHttps(saved.forceHttps !== undefined ? saved.forceHttps : true);
      setShowStats(saved.showStats !== undefined ? saved.showStats : false);

      setHasLoadedState(true);
    }
  }, [discordClientId, t]); // Only run once for initial load and Discord auth

  // --- Dynamic Primary Color Injection ---
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-primary-dark', darkenHexColor(primaryColor, 0.3));
      document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(primaryColor));
    }
  }, [primaryColor]);


  // --- Custom CSS/JS Injection ---
  useEffect(() => {
    if (!hasLoadedState) return;
    
    // CSS
    const styleId = 'lumina-custom-css';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    styleTag.textContent = customCss || '';

    // JS (Execute safely)
    if (customJs) {
        try {
            // eslint-disable-next-line no-new-func
            const func = new Function(customJs);
            func();
        } catch(e) { console.error("Custom JS Injection Error:", e); showToast(t('customJsError')); }
    }
  }, [customCss, customJs, hasLoadedState, t]);

  // --- PWA Install Prompt ---
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };
  
  // --- API Key & Persistence ---
  const handleUpdateApiKey = (newKey: string | undefined) => {
    setApiKey(newKey);
    saveApiKey(newKey); // Save independently for guest/API key fallback
    showToast(t('apiKeyUpdated'));
  }

  useEffect(() => {
    if (hasLoadedState) {
      saveState(
        queue, volume, repeatMode, audioQuality, language, primaryColor, 
        discordClientId, discordAccessToken, discordUserId, discordUsername, 
        customJs, customCss, discordWebhook, customEndpoint, forceHttps, showStats
      );
    }
  }, [queue, volume, repeatMode, audioQuality, language, primaryColor, hasLoadedState, 
      discordClientId, discordAccessToken, discordUserId, discordUsername, 
      customJs, customCss, discordWebhook, customEndpoint, forceHttps, showStats]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadSource = () => {
      const source: PersistedState & { apiKey?: string } = {
          queue: queue,
          language, audioQuality, primaryColor, 
          discordClientId, discordAccessToken, discordUserId, discordUsername, 
          customJs, customCss, discordWebhook, customEndpoint, showStats, forceHttps,
          volume, repeatMode,
          apiKey: apiKey 
      };

      const dataStr = JSON.stringify(source, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "lumina_source_config.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(t('sourceDownloaded'));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(queue, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "lumina_library_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('downloadData') + " OK!");
  };

  const handleImportDataClick = () => fileInputRef.current?.click();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target?.result as string);
            // Check if it's a Source Config
            if (importedData.queue && importedData.language) { // Basic check for PersistedState
                setQueue(importedData.queue);
                setLanguage(importedData.language || 'EN');
                setAudioQuality(importedData.audioQuality || 'NORMAL');
                setPrimaryColor(importedData.primaryColor || '#D0BCFF'); 
                setCustomJs(importedData.customJs || '');
                setCustomCss(importedData.customCss || '');
                setDiscordWebhook(importedData.discordWebhook || '');
                setCustomEndpoint(importedData.customEndpoint || '');
                setForceHttps(importedData.forceHttps !== undefined ? importedData.forceHttps : true);
                setShowStats(importedData.showStats || false);
                if (importedData.apiKey) handleUpdateApiKey(importedData.apiKey);
                // Discord info also imported
                if(importedData.discordUserId) setDiscordUserId(importedData.discordUserId);
                if(importedData.discordUsername) setDiscordUsername(importedData.discordUsername);
                if(importedData.discordAccessToken) setDiscordAccessToken(importedData.discordAccessToken);
                if(importedData.discordClientId) setDiscordClientId(importedData.discordClientId);

                showToast(t('sourceConfigRestored'));
            }
            // Or just library
            else if (Array.isArray(importedData)) {
                const existingIds = new Set(queue.map(s => s.videoId || s.id));
                const uniqueNew = importedData.filter((s: Song) => !existingIds.has(s.videoId || s.id));
                if (uniqueNew.length > 0) {
                    setQueue(prev => [...prev, ...uniqueNew]);
                    showToast(t('dataImported'));
                } else showToast(t('noNewSongs'));
            } else throw new Error("Invalid format");
        } catch (err) { showToast(t('invalidFile')); } 
        finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
    };
    reader.readAsText(file);
  };

  const currentSong = currentSongIndex >= 0 ? queue[currentSongIndex] : null;

  // Discord Webhook Trigger
  useEffect(() => {
      if (currentSong && discordWebhook) {
          try {
              fetch(discordWebhook, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                      content: `Now Playing on Lumina Music: **${currentSong.title}** by ${currentSong.artist}`,
                      embeds: [{
                          title: currentSong.title,
                          description: currentSong.artist,
                          thumbnail: { url: currentSong.thumbnailUrl },
                          color: parseInt(primaryColor.replace('#', ''), 16) // Dynamic color
                      }]
                  })
              }).catch(e => console.error("Discord webhook failed", e));
          } catch(e) {}
      }
  }, [currentSong, discordWebhook, primaryColor]);


  // --- YouTube Player Effects ---
  useEffect(() => {
    if (!currentSong) {
      if (isYTReady) pauseYT();
      setIsPlaying(false);
      setProgress(0);
      return;
    }
    // Load and play video when currentSong or isPlaying changes, if player is ready
    if (isYTReady) {
       setVolumeYT(volume);
       setPlaybackQuality(audioQuality); // Set quality here
       loadVideo(currentSong.videoId || '');
       if (isPlaying) {
           playYT(); // Explicitly play after loading if it should be playing
       } else {
           pauseYT(); // Ensure it's paused if not playing
       }
    }
  }, [currentSong, isPlaying, isYTReady, loadVideo, playYT, pauseYT, setVolumeYT, setPlaybackQuality, volume, audioQuality]);


  const updateSongDuration = (index: number, duration: number) => {
    setQueue(prev => {
        if (!prev[index]) return prev;
        if (Math.abs((prev[index].duration || 0) - duration) < 1) return prev; // Avoid unnecessary updates
        const newQueue = [...prev];
        newQueue[index] = { ...newQueue[index], duration };
        return newQueue;
    });
  };

  const updateSongMetadata = (index: number, title: string, artist: string) => {
    setQueue(prev => {
        if (!prev[index]) return prev;
        const newQueue = [...prev];
        newQueue[index] = { ...newQueue[index], title, artist, mood: 'YouTube' };
        return newQueue;
    });
  };

  const handleLyricsImport = (lyrics: LyricLine[], offset: number) => {
      if (!currentSong) return;
      setQueue(prev => {
          const newQueue = [...prev];
          newQueue[currentSongIndex] = { ...newQueue[currentSongIndex], lyrics, lyricsOffset: offset };
          return newQueue;
      });
      showToast(t('lyricsSaved'));
  };

  const handlePlaySong = (index: number) => {
    if (index === currentSongIndex) { // Clicked active song
      setIsPlaying(prev => !prev);
    } else { // Clicked new song
        setCurrentSongIndex(index);
        setIsPlaying(true);
        setProgress(0);
    }
  };

  const handleShuffle = useCallback(() => {
    if (queue.length <= 1) return;
    const current = currentSongIndex !== -1 ? queue[currentSongIndex] : null;
    let rest = queue.filter((_, i) => i !== currentSongIndex);
    
    // Fisher-Yates shuffle
    for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    
    // Reconstruct queue: current song first, then shuffled rest
    const newQueue = current ? [current, ...rest] : rest;
    setQueue(newQueue);
    // If there was a current song, it's now at index 0. If not, play first of shuffled or nothing.
    setCurrentSongIndex(current ? 0 : (newQueue.length > 0 ? 0 : -1)); 
    showToast(t('queueShuffled'));
  }, [queue, currentSongIndex, t]);

  const handleReorder = useCallback((dragIndex: number, dropIndex: number) => {
      if (dragIndex === dropIndex) return;
      setQueue(prev => {
          const updated = [...prev];
          const [moved] = updated.splice(dragIndex, 1);
          updated.splice(dropIndex, 0, moved);
          
          // Adjust currentSongIndex if the active song was moved or affected
          if (currentSongIndex === dragIndex) {
              setCurrentSongIndex(dropIndex);
          } else if (currentSongIndex > dragIndex && currentSongIndex <= dropIndex) {
              setCurrentSongIndex(currentSongIndex - 1);
          } else if (currentSongIndex < dragIndex && currentSongIndex >= dropIndex) {
              setCurrentSongIndex(currentSongIndex + 1);
          }
          return updated;
      });
  }, [currentSongIndex]);


  // --- Media Session API ---
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      const artwork = currentSong.thumbnailUrl 
        ? [{ src: currentSong.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }]
        : [];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || t('unknownTitle'),
        artist: currentSong.artist || t('unknownArtist'),
        artwork: artwork
      });
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext(false));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime || details.seekTime === 0) handleSeek(details.seekTime);
      });
      // Additional media session actions for seek forward/backward
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details.seekOffset || 10; // Default 10 seconds
          handleSeek(Math.max(0, progress - skipTime));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10; // Default 10 seconds
          if (currentSong) handleSeek(Math.min(currentSong.duration, progress + skipTime));
      });
    }
  }, [currentSong, handlePrev, handleNext, handleSeek, progress, t]);

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  const handleImport = (newSongs: Song[]) => {
    const existingIds = new Set(queue.map(s => s.videoId || s.id));
    const uniqueSongs = newSongs.filter(s => !existingIds.has(s.videoId || s.id));
    if (uniqueSongs.length === 0) { showToast(t('songExists')); return; }
    setQueue(prev => [...prev, ...uniqueSongs]);
    showToast(`${t('added')} ${uniqueSongs.length} ${t('tracks')}`);
    if (currentSongIndex === -1 && uniqueSongs.length > 0) { // If queue was empty or no song playing
        setCurrentSongIndex(0); // Start playing first imported
        setIsPlaying(true);
    }
  };

  const handleToggleRepeat = useCallback(() => {
      const modes = [RepeatMode.NONE, RepeatMode.ALL, RepeatMode.ONE];
      const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
      setRepeatMode(modes[nextIndex]);
      showToast(`${t('repeatMode')}: ${t(modes[nextIndex].toLowerCase())}`);
  }, [repeatMode, t]);

  const handleRemoveSong = useCallback((e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    setQueue(prev => prev.filter((_, i) => i !== indexToRemove));
    
    if (indexToRemove < currentSongIndex) { // Song before current was removed
      setCurrentSongIndex(prev => prev - 1);
    } else if (indexToRemove === currentSongIndex) { // Current song was removed
        if (queue.length === 1) { // It was the only song
            setIsPlaying(false);
            setCurrentSongIndex(-1);
            setProgress(0);
        } else if (indexToRemove === queue.length - 1) { // Last song in queue was removed
            setCurrentSongIndex(prev => prev - 1); // Play previous
        } else { // Song in middle was removed, currentSongIndex points to next song
            // Current song index doesn't need to change, it now points to the song that shifted into its place
            // Playback will continue with the new song at currentSongIndex due to useEffect
        }
    }
    showToast(t('songRemoved'));
  }, [currentSongIndex, queue.length, t]);

  const handleClearAll = useCallback(() => {
      if (window.confirm(t('confirmClear'))) {
          setIsPlaying(false);
          setCurrentSongIndex(-1);
          setProgress(0);
          setQueue([]);
          showToast(t('libraryCleared'));
      }
  }, [t]);
  
  const handleGoogleSearch = useCallback(() => {
    if (!currentSong) return;
    const query = `${currentSong.title} ${currentSong.artist} lyrics`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }, [currentSong]);

  const activeThumbnail = currentSong?.thumbnailUrl || null;

  return (
    <div className="relative min-h-screen bg-[#141218] text-[#E6E0E9] font-sans selection:bg-primary selection:text-on-primary-container overflow-x-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
           <div className="absolute inset-0 bg-[#141218]" />
           {activeThumbnail && (
               <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                    <img src={activeThumbnail} alt="" className="w-full h-full object-cover blur-3xl opacity-40 scale-110" />
               </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-[#141218]/60 via-[#141218]/80 to-[#141218]" />
      </div>

      {/* Stats Overlay */}
      {showStats && <StatsForNerds currentSong={currentSong} volume={volume} videoMode={isVideoMode} primaryColor={primaryColor} />}

      {/* YouTube Player */}
      <div className={`transition-all duration-300 ease-in-out ${isVideoMode ? 'fixed inset-0 z-20 bg-black flex items-center justify-center p-0 pb-[120px] sm:pb-[90px]' : 'fixed bottom-4 right-4 w-16 h-16 opacity-[0.01] z-0 pointer-events-none'}`}>
          <style>{`#youtube-player-hidden { width: 100% !important; height: 100% !important; max-width: 100%; max-height: 100%; }`}</style>
          <div id="youtube-player-hidden" className="w-full h-full" />
          {isVideoMode && (
              <button onClick={() => setIsVideoMode(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                  <span className="material-symbols-rounded text-2xl">close</span>
              </button>
          )}
      </div>

      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-[#E6E0E9] text-[#141218] px-6 py-3 rounded-full shadow-xl font-medium text-sm flex items-center gap-2">
                  <span className="material-symbols-rounded text-lg">info</span>
                  {toastMessage}
              </div>
          </div>
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#141218]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-on-primary overflow-hidden">
               <span className="material-symbols-rounded text-2xl">person_outline</span>
            </div>
            <h1 className="text-xl font-normal tracking-tight text-[#E6E0E9]">Lumina Music</h1>
        </div>
        <div className="flex items-center gap-2">
             <span className="text-sm text-[#CAC4D0] hidden sm:inline-block mr-2">
                {user.discordUsername ? `@${user.discordUsername}` : t('guest')}
             </span>
             {deferredPrompt && (
                <button onClick={handleInstallClick} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-medium hover:shadow-md animate-pulse">
                    <span className="material-symbols-rounded text-lg">install_mobile</span>
                    <span className="hidden sm:inline">{t('installApp')}</span>
                </button>
             )}
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#E6E0E9]" title={t('settings')}>
                <span className="material-symbols-rounded">settings</span>
             </button>
        </div>
      </header>

      <main className="relative z-10 max-w-screen-xl mx-auto px-4 pb-40 pt-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h2 className="text-[28px] leading-9 font-normal mb-1">{t('libraryTitle')}</h2>
                <p className="text-[#CAC4D0] text-sm tracking-wide">{queue.length} {t('tracks')}</p>
            </div>
            <div className="flex gap-2">
                <div className="flex gap-2 mr-2">
                    <button onClick={handleExportData} className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] bg-[#2B2930] hover:bg-[#49454F] transition-colors" title={t('downloadData')}>
                        <span className="material-symbols-rounded">download</span>
                    </button>
                    <button onClick={handleImportDataClick} className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] bg-[#2B2930] hover:bg-[#49454F] transition-colors" title={t('importData')}>
                        <span className="material-symbols-rounded">upload</span>
                    </button>
                </div>
                {queue.length > 0 && (
                    <button onClick={handleClearAll} className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] text-error hover:bg-error/10 transition-colors">
                        <span className="material-symbols-rounded">delete_sweep</span>
                        <span className="text-sm font-medium hidden sm:inline">{t('clearAll')}</span>
                    </button>
                )}
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-3 bg-primary text-on-primary px-6 py-3 rounded-[16px] font-medium hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all">
                    <span className="material-symbols-rounded">search</span>
                    <span className="text-sm font-medium tracking-wide">{t('addTracks')}</span>
                </button>
            </div>
        </div>

        <div className="flex flex-col gap-1">
            {queue.map((song, index) => (
                <SongListItem
                    key={song.id}
                    song={song}
                    index={index}
                    isActive={index === currentSongIndex}
                    isPlaying={isPlaying && index === currentSongIndex}
                    onClick={() => handlePlaySong(index)}
                    onDelete={(e) => handleRemoveSong(e, index)}
                    onDragStart={(e, i) => e.dataTransfer.setData('text/plain', i.toString())}
                    onDrop={(e, dropIndex) => {
                        e.preventDefault();
                        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        handleReorder(dragIndex, dropIndex);
                    }}
                />
            ))}
            {queue.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-[#CAC4D0] bg-[#1D1B20]/50 rounded-[28px] mt-4 border border-[#49454F]/50 backdrop-blur-sm">
                    <span className="material-symbols-rounded text-6xl mb-4 opacity-50">library_music</span>
                    <p className="text-center max-w-xs mb-6">{t('guestSearch')}</p>
                </div>
            )}
        </div>
      </main>

      <LyricsOverlay 
        isOpen={isLyricsOpen} 
        onClose={() => setIsLyricsOpen(false)}
        currentSong={currentSong}
        currentTime={progress}
        onImportLyrics={handleLyricsImport}
        apiKey={apiKey}
        t={t}
      />

      <ImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onImport={handleImport} user={user} primaryColor={primaryColor} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        audioQuality={audioQuality} setAudioQuality={setAudioQuality} 
        language={language} setLanguage={setLanguage} 
        primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
        apiKey={apiKey} onUpdateApiKey={handleUpdateApiKey}
        
        customJs={customJs} setCustomJs={setCustomJs}
        customCss={customCss} setCustomCss={setCustomCss}
        showStats={showStats} setShowStats={setShowStats}
        
        discordWebhook={discordWebhook} setDiscordWebhook={setDiscordWebhook}
        customEndpoint={customEndpoint} setCustomEndpoint={setCustomEndpoint}
        forceHttps={forceHttps} setForceHttps={setForceHttps}
        
        discordClientId={discordClientId} setDiscordClientId={setDiscordClientId}
        discordAccessToken={discordAccessToken} setDiscordAccessToken={setDiscordAccessToken}
        discordUserId={discordUserId} setDiscordUserId={setDiscordUserId}
        discordUsername={discordUsername} setDiscordUsername={setDiscordUsername}
        
        onDownloadSource={handleDownloadSource}
        t={t}
      />
      
      <NowPlayingBar 
        playerState={{ currentSong, isPlaying, progress, volume, isMuted: volume === 0, queue, repeatMode, audioQuality }}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={() => handleNext(false)}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleRepeat={handleToggleRepeat}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        onGoogleSearch={handleGoogleSearch}
        onToggleVideo={() => setIsVideoMode(!isVideoMode)}
        isVideoMode={isVideoMode}
        onShuffle={handleShuffle}
      />
    </div>
  );
}

export default App;