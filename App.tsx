
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, RepeatMode, LyricLine, User, AudioQuality, Language } from './types';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import ImportModal from './components/ImportModal';
import NowPlayingBar from './components/NowPlayingBar';
import SongListItem from './components/SongListItem';
import LyricsOverlay from './components/LyricsOverlay';
import AuthScreen from './components/AuthScreen';
import SettingsModal from './components/SettingsModal';
import { saveState, loadState, loadUser, saveUser } from './utils/storage';
import { fetchUserLikedVideos, DEFAULT_SONG } from './services/youtubeService';
import { getTranslation } from './utils/i18n';

const INITIAL_QUEUE: Song[] = [];

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // App State
  const [queue, setQueue] = useState<Song[]>(INITIAL_QUEUE);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.NONE);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('NORMAL');
  const [language, setLanguage] = useState<Language>('ES'); // Default to Spanish as requested by banner
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  
  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const t = (key: any) => getTranslation(language, key);

  // Check Auth on Mount
  useEffect(() => {
    const savedUser = loadUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Listen for PWA install prompt
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
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    saveUser(loggedInUser);

    if (loggedInUser.accessToken && !loggedInUser.isGuest) {
        setIsSyncing(true);
        showToast("Syncing your Liked Videos...");
        const likedSongs = await fetchUserLikedVideos(loggedInUser.accessToken);
        if (likedSongs.length > 0) {
            handleImport(likedSongs);
            showToast(`Synced ${likedSongs.length} songs!`);
        } else {
            showToast("No new songs to sync.");
        }
        setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_active_user'); 
    setQueue([]); 
  };

  // Load Persistence on Mount
  useEffect(() => {
    const saved = loadState();
    if (saved.queue && saved.queue.length > 0) {
      setQueue(saved.queue);
    } else {
        setQueue([DEFAULT_SONG]);
    }
    
    if (saved.volume !== undefined) setVolume(saved.volume);
    if (saved.repeatMode !== undefined) setRepeatMode(saved.repeatMode);
    if (saved.audioQuality !== undefined) setAudioQuality(saved.audioQuality);
    if (saved.language !== undefined) setLanguage(saved.language);
    setHasLoadedState(true);
  }, []);

  // Save State on Change
  useEffect(() => {
    if (hasLoadedState) {
      saveState(queue, volume, repeatMode, audioQuality, language);
    }
  }, [queue, volume, repeatMode, audioQuality, language, hasLoadedState]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  // --- IMPORT / EXPORT DATA ---
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

  const handleImportDataClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target?.result as string);
            if (Array.isArray(importedData)) {
                // We append imported songs to queue, or replace? 
                // Let's replace for a full restore feel, or append unique.
                // For simplicity of "restore", let's append unique ones.
                const existingIds = new Set(queue.map(s => s.id));
                const uniqueNew = importedData.filter((s: Song) => !existingIds.has(s.id));
                
                if (uniqueNew.length > 0) {
                    setQueue(prev => [...prev, ...uniqueNew]);
                    showToast(t('dataImported'));
                } else {
                    showToast("No new songs found in file.");
                }
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            console.error(err);
            showToast(t('invalidFile'));
        } finally {
            // Reset input so same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  };

  const currentSong = currentSongIndex >= 0 ? queue[currentSongIndex] : null;

  // --- MEDIA SESSION API INTEGRATION ---
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      const artwork = currentSong.thumbnailUrl 
        ? [
            { src: currentSong.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' },
            { src: currentSong.thumbnailUrl, sizes: '128x128', type: 'image/jpeg' }
          ]
        : [];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || 'Unknown Title',
        artist: currentSong.artist || 'Unknown Artist',
        artwork: artwork
      });

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext(false));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime || details.seekTime === 0) handleSeek(details.seekTime);
      });
    }
  }, [currentSong, currentSongIndex, queue]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);


  // --- YouTube Player Hook ---
  const { loadVideo, play: playYT, pause: pauseYT, seekTo: seekYT, setVolume: setVolumeYT, setPlaybackQuality, getVideoData, getDuration, isReady: isYTReady } = useYouTubePlayer({
    onStateChange: (state) => {
      if (state === 1) {
             setIsPlaying(true);
             setPlaybackQuality(audioQuality);
             if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';

             if (currentSong) {
                 const realDuration = getDuration ? getDuration() : 0;
                 if (realDuration > 0 && Math.abs((currentSong.duration || 0) - realDuration) > 1) {
                     updateSongDuration(currentSongIndex, realDuration);
                 }
                 if (currentSong.title.startsWith('Loading Video') || !currentSong.artist) {
                     const data = getVideoData();
                     if (data && data.title && data.author) {
                         updateSongMetadata(currentSongIndex, data.title, data.author);
                     }
                 }
             }
      }
      if (state === 2) {
          setIsPlaying(false);
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      }
      if (state === 0) handleNext(true);
    },
    onProgress: (currentTime, duration) => {
        setProgress(currentTime);
        if (duration > 0 && currentSong && Math.abs((currentSong.duration || 0) - duration) > 1) {
            updateSongDuration(currentSongIndex, duration);
        }
    },
    onError: (e) => {
        if (e === 150 || e === 101) {
            showToast("Video Unavailable (Restricted).");
            setTimeout(() => handleNext(true), 1500);
        } else {
            showToast("Error playing video.");
        }
    }
  });

  useEffect(() => {
      if(isYTReady) {
          setPlaybackQuality(audioQuality);
      }
  }, [audioQuality, isYTReady, setPlaybackQuality]);

  useEffect(() => {
    if (!currentSong) {
      if (isYTReady) pauseYT();
      setIsPlaying(false);
      setProgress(0);
      return;
    }
    if (isYTReady) {
       setVolumeYT(volume);
       loadVideo(currentSong.videoId || '');
    }
  }, [currentSong, isYTReady, currentSongIndex, queue]);

  useEffect(() => {
    if (isYTReady && currentSong) {
        isPlaying ? playYT() : pauseYT();
    }
  }, [isPlaying, currentSong, isYTReady]);

  const updateSongDuration = (index: number, duration: number) => {
    setQueue(prev => {
        if (!prev[index]) return prev;
        if (Math.abs(prev[index].duration - duration) < 1) return prev;
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

  const handleLyricsImport = (lyrics: LyricLine[]) => {
      if (!currentSong) return;
      setQueue(prev => {
          const newQueue = [...prev];
          newQueue[currentSongIndex] = { ...newQueue[currentSongIndex], lyrics };
          return newQueue;
      });
  };

  const handlePlaySong = (index: number) => {
    if (index === currentSongIndex) {
        setIsPlaying(!isPlaying);
    } else {
        setCurrentSongIndex(index);
        setIsPlaying(true);
        setProgress(0);
    }
  };

  const handleNext = useCallback((auto = false) => {
    if (queue.length === 0) return;
    if (repeatMode === RepeatMode.ONE && auto) {
      seekYT(0);
      return;
    }
    if (currentSongIndex < queue.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
    } else if (repeatMode === RepeatMode.ALL) {
        setCurrentSongIndex(0);
    } else {
        setIsPlaying(false);
    }
  }, [currentSongIndex, queue.length, repeatMode, seekYT]);

  const handlePrev = useCallback(() => {
    if (progress > 3) {
        seekYT(0);
        setProgress(0);
    } else if (currentSongIndex > 0) {
        setCurrentSongIndex(prev => prev - 1);
    } else if (repeatMode === RepeatMode.ALL) {
        setCurrentSongIndex(queue.length - 1);
    }
  }, [currentSongIndex, progress, repeatMode, queue.length, seekYT]);

  const handleSeek = (seconds: number) => {
    setProgress(seconds);
    seekYT(seconds);
  };

  const handleImport = (newSongs: Song[]) => {
    const existingIds = new Set(queue.map(s => s.videoId || s.id));
    const uniqueSongs = newSongs.filter(s => !existingIds.has(s.videoId || s.id));
    if (uniqueSongs.length === 0) {
        showToast("Song already in library.");
        return;
    }
    setQueue(prev => [...prev, ...uniqueSongs]);
    showToast(`Added ${uniqueSongs.length} tracks`);
    if (queue.length === 0) {
        setCurrentSongIndex(0);
        setIsPlaying(true);
    }
  };

  const handleToggleRepeat = () => {
      const modes = [RepeatMode.NONE, RepeatMode.ALL, RepeatMode.ONE];
      const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
      setRepeatMode(modes[nextIndex]);
      showToast(`Repeat: ${modes[nextIndex]}`);
  };

  const handleRemoveSong = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    setQueue(prev => prev.filter((_, i) => i !== indexToRemove));
    if (indexToRemove < currentSongIndex) {
        setCurrentSongIndex(prev => prev - 1);
    } else if (indexToRemove === currentSongIndex) {
        if (queue.length === 1) {
            setIsPlaying(false);
            setCurrentSongIndex(-1);
            setProgress(0);
        } else if (indexToRemove === queue.length - 1) {
            setCurrentSongIndex(prev => prev - 1);
            setIsPlaying(false); 
        }
    }
  };

  const handleClearAll = () => {
      if (window.confirm(t('confirmClear'))) {
          setIsPlaying(false);
          setCurrentSongIndex(-1);
          setProgress(0);
          setQueue([]);
      }
  };
  
  const handleGoogleSearch = () => {
    if (!currentSong) return;
    const query = `${currentSong.title} ${currentSong.artist} lyrics`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const activeThumbnail = currentSong?.thumbnailUrl || null;

  return (
    <div className="relative min-h-screen bg-[#141218] text-[#E6E0E9] font-sans selection:bg-[#D0BCFF] selection:text-[#381E72] overflow-x-hidden">
      
      {/* Hidden File Input for Import */}
      <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileImport} 
          accept=".json" 
          className="hidden" 
      />

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
           <div className="absolute inset-0 bg-[#141218]" />
           {activeThumbnail && (
               <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                    <img src={activeThumbnail} alt="" className="w-full h-full object-cover blur-3xl opacity-40 scale-110" />
               </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-[#141218]/60 via-[#141218]/80 to-[#141218]" />
      </div>

      {/* Hidden Player */}
      <div className={`transition-all duration-300 ease-in-out ${isVideoMode ? 'fixed inset-0 z-20 bg-black flex items-center justify-center p-0 pb-[120px] sm:pb-[90px]' : 'fixed bottom-4 right-4 w-16 h-16 opacity-[0.01] z-0 pointer-events-none'}`}>
          <style>{`#youtube-player-hidden { width: 100% !important; height: 100% !important; max-width: 100%; max-height: 100%; }`}</style>
          <div id="youtube-player-hidden" className="w-full h-full" />
          {isVideoMode && (
              <button onClick={() => setIsVideoMode(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                  <span className="material-symbols-rounded text-2xl">close</span>
              </button>
          )}
      </div>

      {/* Toast */}
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-[#E6E0E9] text-[#141218] px-6 py-3 rounded-full shadow-xl font-medium text-sm flex items-center gap-2">
                  <span className="material-symbols-rounded text-lg">info</span>
                  {toastMessage}
              </div>
          </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#141218]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 rounded-full bg-[#D0BCFF] flex items-center justify-center text-[#381E72] overflow-hidden">
                {user.picture ? (
                    <img src={user.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span className="material-symbols-rounded text-2xl">play_circle</span>
                )}
            </div>
            <h1 className="text-xl font-normal tracking-tight text-[#E6E0E9]">Lumina Music</h1>
        </div>
        <div className="flex items-center gap-2">
             <span className="text-sm text-[#CAC4D0] hidden sm:inline-block mr-2">
                {user.isGuest ? 'Guest' : `Hi, ${user.username.split(' ')[0]}`}
             </span>
             {deferredPrompt && (
                <button onClick={handleInstallClick} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D0BCFF] text-[#381E72] text-xs font-medium hover:shadow-md animate-pulse">
                    <span className="material-symbols-rounded text-lg">install_mobile</span>
                    <span className="hidden sm:inline">Install App</span>
                </button>
             )}
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#E6E0E9]" title={t('settings')}>
                <span className="material-symbols-rounded">settings</span>
             </button>
             <button onClick={handleLogout} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#FFB4AB]" title="Log Out">
                <span className="material-symbols-rounded">logout</span>
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 pb-40 pt-6">
        
        {/* Migration Banner (Bilingual) */}
        <div className="mb-6 bg-gradient-to-r from-[#381E72] to-[#4F378B] p-4 rounded-[16px] shadow-lg border border-[#D0BCFF]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
                <span className="material-symbols-rounded text-[#D0BCFF] text-2xl mt-1">campaign</span>
                <div>
                    <h3 className="text-[#E6E0E9] font-medium text-lg">{t('bannerTitle')}</h3>
                    <p className="text-[#D0BCFF] text-sm mt-1">
                        {t('bannerText')} <a href="https://lumina-music.netlify.app" target="_blank" rel="noreferrer" className="underline font-bold hover:text-white">Lumina-music.netlify.app</a>
                    </p>
                    <p className="text-[#CAC4D0] text-xs mt-1 italic opacity-80">{t('bannerIgnore')}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 self-end md:self-center">
                <button 
                    onClick={handleExportData}
                    className="flex items-center justify-center gap-2 bg-[#EADDFF] text-[#21005D] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#D0BCFF] transition-colors shadow-sm whitespace-nowrap"
                >
                    <span className="material-symbols-rounded text-lg">download</span>
                    {t('downloadData')}
                </button>
                <button 
                    onClick={handleImportDataClick}
                    className="flex items-center justify-center gap-2 bg-[#21005D] text-[#EADDFF] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#381E72] border border-[#EADDFF]/20 transition-colors shadow-sm whitespace-nowrap"
                >
                    <span className="material-symbols-rounded text-lg">upload</span>
                    {t('importData')}
                </button>
            </div>
        </div>

        {isSyncing && (
             <div className="mb-4 bg-[#2B2930] rounded-xl p-4 flex items-center gap-3 animate-pulse border border-[#D0BCFF]/30">
                 <span className="material-symbols-rounded text-[#D0BCFF] animate-spin">sync</span>
                 <p className="text-sm text-[#E6E0E9]">{t('syncing')}</p>
             </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h2 className="text-[28px] leading-9 font-normal mb-1">{t('libraryTitle')}</h2>
                <p className="text-[#CAC4D0] text-sm tracking-wide">
                   {queue.length} {t('tracks')}
                </p>
            </div>
            <div className="flex gap-2">
                {queue.length > 0 && (
                    <button onClick={handleClearAll} className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] text-[#FFB4AB] hover:bg-[#FFB4AB]/10 transition-colors">
                        <span className="material-symbols-rounded">delete_sweep</span>
                        <span className="text-sm font-medium">{t('clearAll')}</span>
                    </button>
                )}
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-3 bg-[#D0BCFF] text-[#381E72] px-6 py-3 rounded-[16px] font-medium hover:shadow-lg hover:shadow-[#D0BCFF]/20 active:scale-95 transition-all">
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
                />
            ))}

            {queue.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-[#CAC4D0] bg-[#1D1B20]/50 rounded-[28px] mt-4 border border-[#49454F]/50 backdrop-blur-sm">
                    <span className="material-symbols-rounded text-6xl mb-4 opacity-50">library_music</span>
                    <p className="text-center max-w-xs mb-6">
                        {user.isGuest ? t('guestSearch') : t('userSync')}
                    </p>
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
      />

      <ImportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleImport}
        user={user}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        audioQuality={audioQuality}
        setAudioQuality={setAudioQuality}
        language={language}
        setLanguage={setLanguage}
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
      />
    </div>
  );
}

export default App;
