
import React, { useState, useEffect, useCallback } from 'react';
import { Song, RepeatMode, LyricLine, User, AudioQuality } from './types';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import ImportModal from './components/ImportModal';
import NowPlayingBar from './components/NowPlayingBar';
import SongListItem from './components/SongListItem';
import LyricsOverlay from './components/LyricsOverlay';
import AuthScreen from './components/AuthScreen';
import SettingsModal from './components/SettingsModal';
import { saveState, loadState, loadUser, saveUser } from './utils/storage';
import { fetchUserLikedVideos } from './services/youtubeService';

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false); // New Video Mode State
  const [hasLoadedState, setHasLoadedState] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check Auth on Mount
  useEffect(() => {
    const savedUser = loadUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    saveUser(loggedInUser);

    // Sync if we have an access token
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
    }
    if (saved.volume !== undefined) setVolume(saved.volume);
    if (saved.repeatMode !== undefined) setRepeatMode(saved.repeatMode);
    if (saved.audioQuality !== undefined) setAudioQuality(saved.audioQuality);
    setHasLoadedState(true);
  }, []);

  // Save State on Change
  useEffect(() => {
    if (hasLoadedState) {
      saveState(queue, volume, repeatMode, audioQuality);
    }
  }, [queue, volume, repeatMode, audioQuality, hasLoadedState]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const currentSong = currentSongIndex >= 0 ? queue[currentSongIndex] : null;

  // --- YouTube Player Hook ---
  const { loadVideo, play: playYT, pause: pauseYT, seekTo: seekYT, setVolume: setVolumeYT, setPlaybackQuality, getVideoData, isReady: isYTReady } = useYouTubePlayer({
    onStateChange: (state) => {
      // 1 = Playing, 2 = Paused, 0 = Ended
      if (state === 1) {
             setIsPlaying(true);
             // Apply Quality Setting whenever a video starts/plays
             setPlaybackQuality(audioQuality);
             
             // SELF-HEALING METADATA:
             if (currentSong && (currentSong.title.startsWith('Loading Video') || currentSong.duration === 0)) {
                 const data = getVideoData();
                 if (data) {
                     updateSongMetadata(currentSongIndex, data.title, data.author);
                 }
             }
      }
      if (state === 2) setIsPlaying(false);
      if (state === 0) handleNext(true); // Auto advance
    },
    onProgress: (currentTime, duration) => {
        setProgress(currentTime);
        // Update duration if needed
        if (duration > 0 && currentSong && Math.abs((currentSong.duration || 0) - duration) > 1) {
            updateSongDuration(currentSongIndex, duration);
        }
    },
    onError: (e) => {
        console.error("YT Error", e);
        // Common YouTube Error Codes: 100, 101, 150 = Restricted/Embed Blocked
        if (e === 150 || e === 101) {
            showToast("Playback Restricted: This video cannot be played in a 3rd party app.");
        } else {
            showToast("Error playing video.");
        }
    }
  });

  // Apply Quality when setting changes
  useEffect(() => {
      if(isYTReady) {
          setPlaybackQuality(audioQuality);
      }
  }, [audioQuality, isYTReady, setPlaybackQuality]);

  // --- Pure YouTube Player Controller ---
  useEffect(() => {
    if (!currentSong) {
      if (isYTReady) pauseYT();
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    if (isYTReady) {
       setVolumeYT(volume);
       // Check if song changed
       loadVideo(currentSong.videoId || '');
    }
  }, [currentSong, isYTReady, currentSongIndex, queue]);

  // Sync Play/Pause State specifically
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
          const updatedSong = { ...newQueue[currentSongIndex], lyrics };
          newQueue[currentSongIndex] = updatedSong;
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
    showToast(`Added ${uniqueSongs.length} track${uniqueSongs.length > 1 ? 's' : ''}`);
    
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
      if (window.confirm("Are you sure you want to delete all songs from your library?")) {
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

  const activeColor = currentSong?.colorHex || '#D0BCFF';

  return (
    <div className="relative min-h-screen bg-[#141218] text-[#E6E0E9] font-sans selection:bg-[#D0BCFF] selection:text-[#381E72] overflow-x-hidden">
      
      {/* Background */}
      <div 
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-10 z-0"
        style={{ background: `radial-gradient(circle at 50% 0%, ${activeColor}, transparent 70%)` }}
      />

      {/* 
        YouTube Player Container Logic 
        - Default (Audio Mode): Positioned bottom-right but BEHIND content.
          Using z-0 with relative main content z-10 makes it functionally "background"
          but technically "visible" in the viewport stack, fixing the 1-second pause bug.
        - Video Mode: Fixed inset-0, z-20 (above everything).
      */}
      <div 
        className={`transition-all duration-300 ease-in-out
            ${isVideoMode 
                ? 'fixed inset-0 z-20 bg-black flex items-center justify-center p-0 pb-[120px] sm:pb-[90px]' 
                : 'fixed bottom-4 right-4 w-16 h-16 opacity-[0.01] z-0 pointer-events-none'
            }
        `}
      >
          {/* 
             FORCE IFRAME SIZE OVERRIDE 
             The hook sets width=100% height=100%. We just need to ensure the container behaves.
          */}
          <style>{`
            #youtube-player-hidden {
                width: 100% !important;
                height: 100% !important;
                max-width: 100%;
                max-height: 100%;
            }
          `}</style>
          
          {/* The Hook mounts the iframe to this ID */}
          <div id="youtube-player-hidden" className="w-full h-full" />
          
          {/* Close Button for Video Mode */}
          {isVideoMode && (
              <button 
                onClick={() => setIsVideoMode(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
              >
                  <span className="material-symbols-rounded text-2xl">close</span>
              </button>
          )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-[#E6E0E9] text-[#141218] px-6 py-3 rounded-full shadow-xl font-medium text-sm flex items-center gap-2">
                  <span className="material-symbols-rounded text-lg">info</span>
                  {toastMessage}
              </div>
          </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#141218]/90 backdrop-blur-md border-b border-white/5">
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
             
             {/* Settings Button */}
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#E6E0E9]" title="Settings">
                <span className="material-symbols-rounded">settings</span>
             </button>

             <button onClick={handleLogout} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#FFB4AB]" title="Log Out">
                <span className="material-symbols-rounded">logout</span>
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 pb-40 pt-6">
        
        {/* Sync Status Banner */}
        {isSyncing && (
             <div className="mb-4 bg-[#2B2930] rounded-xl p-4 flex items-center gap-3 animate-pulse border border-[#D0BCFF]/30">
                 <span className="material-symbols-rounded text-[#D0BCFF] animate-spin">sync</span>
                 <p className="text-sm text-[#E6E0E9]">Syncing your library from YouTube...</p>
             </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h2 className="text-[28px] leading-9 font-normal mb-1">Your Library</h2>
                <p className="text-[#CAC4D0] text-sm tracking-wide">
                   {queue.length} tracks
                </p>
            </div>
            <div className="flex gap-2">
                {queue.length > 0 && (
                    <button 
                        onClick={handleClearAll}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] text-[#FFB4AB] hover:bg-[#FFB4AB]/10 transition-colors"
                    >
                        <span className="material-symbols-rounded">delete_sweep</span>
                        <span className="text-sm font-medium">Clear All</span>
                    </button>
                )}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-[#D0BCFF] text-[#381E72] px-6 py-3 rounded-[16px] font-medium hover:shadow-lg hover:shadow-[#D0BCFF]/20 active:scale-95 transition-all"
                >
                    <span className="material-symbols-rounded">search</span>
                    <span className="text-sm font-medium tracking-wide">Add Tracks</span>
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
                <div className="py-24 flex flex-col items-center justify-center text-[#CAC4D0] bg-[#1D1B20] rounded-[28px] mt-4 border border-[#49454F]">
                    <span className="material-symbols-rounded text-6xl mb-4 opacity-50">library_music</span>
                    <p className="text-center max-w-xs mb-6">
                        {user.isGuest ? "Search to add songs or paste a URL." : "Syncing your library or add new tracks."}
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
