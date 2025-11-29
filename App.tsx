
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, RepeatMode, LyricLine, User, AudioQuality, Language } from './types';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import ImportModal from './components/ImportModal';
import NowPlayingBar from './components/NowPlayingBar';
import SongListItem from './components/SongListItem';
import LyricsOverlay from './components/LyricsOverlay';
import SettingsModal from './components/SettingsModal';
import { saveState, loadState, saveApiKey, loadApiKey } from './utils/storage';
import { DEFAULT_SONG } from './services/youtubeService';
import { getTranslation } from './utils/i18n';

const INITIAL_QUEUE: Song[] = [];

function App() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const user: User = { username: "Guest", isGuest: true, apiKey };

  const [queue, setQueue] = useState<Song[]>(INITIAL_QUEUE);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.NONE);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('NORMAL');
  const [language, setLanguage] = useState<Language>('EN'); // Default EN
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const t = (key: any) => getTranslation(language, key);

  useEffect(() => {
    const savedApiKey = loadApiKey();
    if (savedApiKey) setApiKey(savedApiKey);

    const saved = loadState();
    if (saved.queue && saved.queue.length > 0) setQueue(saved.queue);
    else if (queue.length === 0) setQueue([DEFAULT_SONG]);
    
    if (saved.volume !== undefined) setVolume(saved.volume);
    if (saved.repeatMode !== undefined) setRepeatMode(saved.repeatMode);
    if (saved.audioQuality !== undefined) setAudioQuality(saved.audioQuality);
    if (saved.language !== undefined) setLanguage(saved.language);
    setHasLoadedState(true);
  }, []);

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
  
  const handleUpdateApiKey = (newKey: string | undefined) => {
    setApiKey(newKey);
    saveApiKey(newKey);
    showToast(t('apiKeyUpdated'));
  }

  useEffect(() => {
    if (hasLoadedState) {
      saveState(queue, volume, repeatMode, audioQuality, language);
    }
  }, [queue, volume, repeatMode, audioQuality, language, hasLoadedState]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
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
            if (Array.isArray(importedData)) {
                const existingIds = new Set(queue.map(s => s.id));
                const uniqueNew = importedData.filter((s: Song) => !existingIds.has(s.id));
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

  const handleSeek = useCallback((seconds: number) => {
    setProgress(seconds);
    seekYT(seconds);
  }, []);

  const handleNext = useCallback((auto = false) => {
    if (queue.length === 0) return;
    if (repeatMode === RepeatMode.ONE && auto) {
      handleSeek(0);
      return;
    }
    if (currentSongIndex < queue.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
    } else if (repeatMode === RepeatMode.ALL) {
        setCurrentSongIndex(0);
    } else {
        setIsPlaying(false);
        setCurrentSongIndex(-1);
    }
  }, [currentSongIndex, queue.length, repeatMode, handleSeek]);

  const handlePrev = useCallback(() => {
    if (progress > 3) {
        handleSeek(0);
        setProgress(0);
    } else if (currentSongIndex > 0) {
        setCurrentSongIndex(prev => prev - 1);
    } else if (repeatMode === RepeatMode.ALL) {
        setCurrentSongIndex(queue.length - 1);
    } else {
        handleSeek(0);
        setProgress(0);
    }
  }, [currentSongIndex, progress, repeatMode, queue.length, handleSeek]);

  const { loadVideo, play: playYT, pause: pauseYT, seekTo: seekYT, setVolume: setVolumeYT, setPlaybackQuality, getVideoData, getDuration, isReady: isYTReady } = useYouTubePlayer({
    onStateChange: (state) => {
      if (state === 1) { // Playing
             setIsPlaying(true);
             setPlaybackQuality(audioQuality);
             if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
             if (currentSong) {
                 const realDuration = getDuration ? getDuration() : 0;
                 if (realDuration > 0 && Math.abs((currentSong.duration || 0) - realDuration) > 1) {
                     updateSongDuration(currentSongIndex, realDuration);
                 }
                 const data = getVideoData();
                 if (data && data.title && data.author) {
                     if (currentSong.title.startsWith('Loading Video') || currentSong.artist === 'Unknown Artist') {
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
            showToast(t('videoUnavailable'));
            setTimeout(() => handleNext(true), 1500);
        } else showToast(t('errorPlaying'));
    }
  });

  useEffect(() => { if(isYTReady) setPlaybackQuality(audioQuality); }, [audioQuality, isYTReady, setPlaybackQuality]);
  useEffect(() => { if (isYTReady && currentSong) isPlaying ? playYT() : pauseYT(); }, [isPlaying, currentSong, isYTReady, playYT, pauseYT]);
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
  }, [currentSong, isYTReady, currentSongIndex, loadVideo, volume, setVolumeYT]);

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
    if (index === currentSongIndex) setIsPlaying(!isPlaying);
    else {
        setCurrentSongIndex(index);
        setIsPlaying(true);
        setProgress(0);
    }
  };

  // SHUFFLE: Randomize queue starting after current song
  const handleShuffle = () => {
    if (queue.length <= 1) return;
    const current = queue[currentSongIndex];
    const rest = queue.filter((_, i) => i !== currentSongIndex);
    
    // Fisher-Yates
    for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    
    setQueue(currentSongIndex >= 0 ? [current, ...rest] : rest);
    setCurrentSongIndex(currentSongIndex >= 0 ? 0 : -1);
    showToast("Queue Shuffled");
  };

  // REORDER (Drag & Drop)
  const handleReorder = (dragIndex: number, dropIndex: number) => {
      if (dragIndex === dropIndex) return;
      setQueue(prev => {
          const updated = [...prev];
          const [moved] = updated.splice(dragIndex, 1);
          updated.splice(dropIndex, 0, moved);
          
          // Fix current index
          if (currentSongIndex === dragIndex) setCurrentSongIndex(dropIndex);
          else if (currentSongIndex > dragIndex && currentSongIndex <= dropIndex) setCurrentSongIndex(currentSongIndex - 1);
          else if (currentSongIndex < dragIndex && currentSongIndex >= dropIndex) setCurrentSongIndex(currentSongIndex + 1);
          
          return updated;
      });
  };

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      const artwork = currentSong.thumbnailUrl 
        ? [{ src: currentSong.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }]
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
  }, [currentSong, currentSongIndex, queue, handlePrev, handleNext, handleSeek]);

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  const handleImport = (newSongs: Song[]) => {
    const existingIds = new Set(queue.map(s => s.videoId || s.id));
    const uniqueSongs = newSongs.filter(s => !existingIds.has(s.videoId || s.id));
    if (uniqueSongs.length === 0) { showToast(t('songExists')); return; }
    setQueue(prev => [...prev, ...uniqueSongs]);
    showToast(`${t('added')} ${uniqueSongs.length} ${t('tracks')}`);
    if (queue.length === 0) {
        setCurrentSongIndex(0);
        setIsPlaying(true);
    }
  };

  const handleToggleRepeat = () => {
      const modes = [RepeatMode.NONE, RepeatMode.ALL, RepeatMode.ONE];
      const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
      setRepeatMode(modes[nextIndex]);
      showToast(`${t('repeatMode')}: ${t(modes[nextIndex].toLowerCase())}`);
  };

  const handleRemoveSong = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    setQueue(prev => prev.filter((_, i) => i !== indexToRemove));
    if (indexToRemove < currentSongIndex) setCurrentSongIndex(prev => prev - 1);
    else if (indexToRemove === currentSongIndex) {
        if (queue.length === 1) { setIsPlaying(false); setCurrentSongIndex(-1); setProgress(0); }
        else if (indexToRemove === queue.length - 1) setCurrentSongIndex(prev => prev - 1);
    }
    showToast(t('songRemoved'));
  };

  const handleClearAll = () => {
      if (window.confirm(t('confirmClear'))) {
          setIsPlaying(false);
          setCurrentSongIndex(-1);
          setProgress(0);
          setQueue([]);
          showToast(t('libraryCleared'));
      }
  };
  
  const handleGoogleSearch = () => {
    if (!currentSong) return;
    const query = `${currentSong.title} ${currentSong.artist} lyrics`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const activeThumbnail = currentSong?.thumbnailUrl || null;

  return (
    <div className="relative min-h-screen bg-[#141218] text-[#E6E0E9] font-sans selection:bg-[#D0BCFF] selection:text-[#381E72] overflow-x-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
           <div className="absolute inset-0 bg-[#141218]" />
           {activeThumbnail && (
               <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                    <img src={activeThumbnail} alt="" className="w-full h-full object-cover blur-3xl opacity-40 scale-110" />
               </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-[#141218]/60 via-[#141218]/80 to-[#141218]" />
      </div>

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
            <div className="h-10 w-10 rounded-full bg-[#D0BCFF] flex items-center justify-center text-[#381E72] overflow-hidden">
               <span className="material-symbols-rounded text-2xl">person_outline</span>
            </div>
            <h1 className="text-xl font-normal tracking-tight text-[#E6E0E9]">Lumina Music</h1>
        </div>
        <div className="flex items-center gap-2">
             <span className="text-sm text-[#CAC4D0] hidden sm:inline-block mr-2">{t('guest')}</span>
             {deferredPrompt && (
                <button onClick={handleInstallClick} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D0BCFF] text-[#381E72] text-xs font-medium hover:shadow-md animate-pulse">
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
                    <button onClick={handleClearAll} className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] text-[#FFB4AB] hover:bg-[#FFB4AB]/10 transition-colors">
                        <span className="material-symbols-rounded">delete_sweep</span>
                        <span className="text-sm font-medium hidden sm:inline">{t('clearAll')}</span>
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
      />

      <ImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onImport={handleImport} user={user} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} audioQuality={audioQuality} setAudioQuality={setAudioQuality} language={language} setLanguage={setLanguage} apiKey={apiKey} onUpdateApiKey={handleUpdateApiKey} />
      
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
