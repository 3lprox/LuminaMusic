import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, RepeatMode, LyricLine } from './types';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import ImportModal from './components/ImportModal';
import NowPlayingBar from './components/NowPlayingBar';
import SongListItem from './components/SongListItem';
import LyricsOverlay from './components/LyricsOverlay';
import { saveState, loadState } from './utils/storage';

// Empty start as requested
const INITIAL_QUEUE: Song[] = [];

function App() {
  // State
  const [queue, setQueue] = useState<Song[]>(INITIAL_QUEUE);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.NONE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [hasLoadedState, setHasLoadedState] = useState(false);

  // Audio Ref for Local Files
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Persistence on Mount
  useEffect(() => {
    const saved = loadState();
    if (saved.queue && saved.queue.length > 0) {
      setQueue(saved.queue);
    }
    if (saved.volume !== undefined) setVolume(saved.volume);
    if (saved.repeatMode !== undefined) setRepeatMode(saved.repeatMode);
    setHasLoadedState(true);
  }, []);

  // Save State on Change
  useEffect(() => {
    if (hasLoadedState) {
      saveState(queue, volume, repeatMode);
    }
  }, [queue, volume, repeatMode, hasLoadedState]);

  const currentSong = currentSongIndex >= 0 ? queue[currentSongIndex] : null;

  // --- YouTube Player Hook ---
  const { loadVideo, play: playYT, pause: pauseYT, seekTo: seekYT, setVolume: setVolumeYT, isReady: isYTReady } = useYouTubePlayer({
    onStateChange: (state) => {
      // 1 = Playing, 2 = Paused, 0 = Ended
      if (currentSong?.source === 'YOUTUBE') {
        if (state === 1) setIsPlaying(true);
        if (state === 2) setIsPlaying(false);
        if (state === 0) handleNext(true); // Auto advance
      }
    },
    onProgress: (currentTime, duration) => {
      if (currentSong?.source === 'YOUTUBE') {
        setProgress(currentTime);
        // Update duration if needed
        if (duration > 0 && Math.abs((currentSong.duration || 0) - duration) > 1) {
            updateSongDuration(currentSongIndex, duration);
        }
      }
    },
    onError: (e) => console.error("YT Error", e)
  });

  // --- Local Audio Logic ---
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      });
      audioRef.current.addEventListener('ended', () => {
        handleNext(true);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        if(audioRef.current && audioRef.current.duration !== Infinity) {
             updateSongDuration(currentSongIndex, audioRef.current.duration);
        }
      });
    }
  }, [currentSongIndex]); // Re-bind if index changes

  // --- Hybrid Player Controller ---
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!currentSong) {
      if (audio) { audio.pause(); audio.src = ''; }
      if (isYTReady) pauseYT();
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    // Handle Volume Global
    if (audio) audio.volume = volume / 100;
    if (isYTReady) setVolumeYT(volume);

    // Source Switching
    if (currentSong.source === 'LOCAL') {
       // Stop YT
       if (isYTReady) pauseYT();

       // Load Audio if new
       if (audio && (!audio.src || !audio.src.includes(currentSong.fileUrl || ''))) {
          if (currentSong.fileUrl) {
            audio.src = currentSong.fileUrl;
            audio.load();
            if (isPlaying) audio.play().catch(e => console.error("Audio play failed", e));
          }
       } else if (audio) {
          // Already loaded, just sync play state
          if (isPlaying && audio.paused) audio.play();
          if (!isPlaying && !audio.paused) audio.pause();
       }

    } else if (currentSong.source === 'YOUTUBE') {
       // Stop Local
       if (audio) audio.pause();

       // Load YT
       if (isYTReady) {
         loadVideo(currentSong.videoId || '');
         // The YT hook handles play/pause via the loadVideo but we explicitly check state
       }
    }
  }, [currentSong, isYTReady, currentSongIndex, queue]);

  // Sync Play/Pause State specifically
  useEffect(() => {
    const audio = audioRef.current;
    if (currentSong?.source === 'LOCAL' && audio) {
        isPlaying ? audio.play().catch(() => {}) : audio.pause();
    } else if (currentSong?.source === 'YOUTUBE' && isYTReady) {
        isPlaying ? playYT() : pauseYT();
    }
  }, [isPlaying, currentSong, isYTReady]);


  // --- Helper Functions ---

  const updateSongDuration = (index: number, duration: number) => {
    setQueue(prev => {
        if (!prev[index]) return prev;
        if (Math.abs(prev[index].duration - duration) < 1) return prev;
        const newQueue = [...prev];
        newQueue[index] = { ...newQueue[index], duration };
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
      // Replay current
      if (currentSong?.source === 'YOUTUBE') seekYT(0);
      if (currentSong?.source === 'LOCAL' && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
      }
      return;
    }

    if (currentSongIndex < queue.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
    } else if (repeatMode === RepeatMode.ALL) {
        setCurrentSongIndex(0); // Loop back
    } else {
        setIsPlaying(false); // Stop at end
    }
  }, [currentSongIndex, queue.length, repeatMode, currentSong, seekYT]);

  const handlePrev = useCallback(() => {
    if (progress > 3) {
        // Restart song if > 3s in
        if (currentSong?.source === 'YOUTUBE') seekYT(0);
        if (currentSong?.source === 'LOCAL' && audioRef.current) audioRef.current.currentTime = 0;
        setProgress(0);
    } else if (currentSongIndex > 0) {
        setCurrentSongIndex(prev => prev - 1);
    } else if (repeatMode === RepeatMode.ALL) {
        setCurrentSongIndex(queue.length - 1); // Loop to end
    }
  }, [currentSongIndex, progress, repeatMode, queue.length, currentSong, seekYT]);

  const handleSeek = (seconds: number) => {
    setProgress(seconds);
    if (currentSong?.source === 'YOUTUBE') seekYT(seconds);
    if (currentSong?.source === 'LOCAL' && audioRef.current) {
        audioRef.current.currentTime = seconds;
    }
  };

  const handleImport = (newSongs: Song[]) => {
    setQueue(prev => [...prev, ...newSongs]);
    // If queue was empty, start playing first imported
    if (queue.length === 0 && newSongs.length > 0) {
        setCurrentSongIndex(0);
        setIsPlaying(true);
    }
  };

  const handleToggleRepeat = () => {
      const modes = [RepeatMode.NONE, RepeatMode.ALL, RepeatMode.ONE];
      const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
      setRepeatMode(modes[nextIndex]);
  };

  // --- Deletion Logic ---

  const handleRemoveSong = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();

    // 1. Remove from Queue
    setQueue(prev => prev.filter((_, i) => i !== indexToRemove));

    // 2. Adjust Current Song Index
    if (indexToRemove < currentSongIndex) {
        // Song before current was removed, shift index left
        setCurrentSongIndex(prev => prev - 1);
    } else if (indexToRemove === currentSongIndex) {
        // Current song removed
        if (queue.length === 1) {
            // Was the only song
            setIsPlaying(false);
            setCurrentSongIndex(-1);
            setProgress(0);
        } else if (indexToRemove === queue.length - 1) {
            // Was last song, go to previous
            setCurrentSongIndex(prev => prev - 1);
            // Optionally stop playing if you don't want to auto-play prev
            setIsPlaying(false); 
        } else {
            // Was in middle, current index now points to next song
            // React state update will trigger useEffect to play new song
        }
    }
  };

  const handleClearAll = () => {
      if (window.confirm("Are you sure you want to delete all songs from your library?")) {
          setIsPlaying(false);
          setCurrentSongIndex(-1);
          setProgress(0);
          setQueue([]);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
          }
      }
  };

  const activeColor = currentSong?.colorHex || '#D0BCFF';

  return (
    <div className="relative min-h-screen bg-[#141218] text-[#E6E0E9] font-sans selection:bg-[#D0BCFF] selection:text-[#381E72] overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-10 z-0"
        style={{ background: `radial-gradient(circle at 50% 0%, ${activeColor}, transparent 70%)` }}
      />

      {/* Hidden YouTube Player */}
      <div id="youtube-player-hidden" className="absolute top-0 left-0 h-0 w-0 opacity-0 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#141218]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 rounded-full bg-[#D0BCFF] flex items-center justify-center text-[#381E72]">
                <span className="material-symbols-rounded text-2xl">play_circle</span>
            </div>
            <h1 className="text-xl font-normal tracking-tight text-[#E6E0E9]">Lumina Music</h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#49454F] overflow-hidden ml-2 flex items-center justify-center text-xs text-[#CAC4D0]">
               AI
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 pb-40 pt-6">
        
        {/* Action Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h2 className="text-[28px] leading-9 font-normal mb-1">Your Library</h2>
                <p className="text-[#CAC4D0] text-sm tracking-wide">
                   {queue.length} tracks • {queue.filter(s => s.source === 'LOCAL').length > 0 ? 'Local & Cloud' : 'Cloud'}
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
                    <span className="material-symbols-rounded">add</span>
                    <span className="text-sm font-medium tracking-wide">Add Tracks</span>
                </button>
            </div>
        </div>

        {/* Playlist */}
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
                    <p className="text-center max-w-xs mb-6">Your library is empty.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-[#D0BCFF] hover:underline">Import from YouTube or MP3</button>
                </div>
            )}
        </div>
      </main>

      {/* Overlays */}
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
      />

      {/* Bottom Player */}
      <NowPlayingBar 
        playerState={{
            currentSong,
            isPlaying,
            progress,
            volume,
            isMuted: volume === 0,
            queue,
            repeatMode
        }}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={() => handleNext(false)}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleRepeat={handleToggleRepeat}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
      />

    </div>
  );
}

export default App;