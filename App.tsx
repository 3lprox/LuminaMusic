import React, { useState, useEffect, useCallback } from 'react';
import { Song } from './types';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import ImportModal from './components/ImportModal';
import NowPlayingBar from './components/NowPlayingBar';
import SongListItem from './components/SongListItem';

// Initial Mock Data
const INITIAL_QUEUE: Song[] = [
  {
    id: '1',
    videoId: 'jfKfPfyJRdk',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio',
    artist: 'Lofi Girl',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    duration: 0,
    addedAt: Date.now(),
    mood: 'Chill Focus',
    colorHex: '#6d8eab',
    summary: 'Beats to relax/study to, featuring the iconic animated girl.'
  }
];

function App() {
  const [queue, setQueue] = useState<Song[]>(INITIAL_QUEUE);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Player Hooks
  const { loadVideo, play, pause, seekTo, isReady } = useYouTubePlayer({
    onStateChange: (state) => {
      // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
      if (state === 1) setIsPlaying(true);
      if (state === 2) setIsPlaying(false);
      if (state === 0) handleNext();
    },
    onProgress: (currentTime, duration) => {
      setProgress(currentTime);
      // Update duration if we haven't yet for the current song
      // FIXED: Immutable state update to prevent cyclic reference errors
      if (currentSongIndex >= 0 && duration > 0) {
        setQueue(prev => {
            const current = prev[currentSongIndex];
            if (Math.abs(current.duration - duration) < 1) return prev; // No change needed

            const newQueue = [...prev];
            newQueue[currentSongIndex] = { ...current, duration };
            return newQueue;
        });
      }
    },
    onError: (e) => console.error("Player Error", e)
  });

  const currentSong = currentSongIndex >= 0 ? queue[currentSongIndex] : null;

  // Effects
  useEffect(() => {
    if (currentSong && isReady) {
        loadVideo(currentSong.videoId);
        // Auto play on song change
        setTimeout(() => play(), 500); 
    }
  }, [currentSong, isReady, loadVideo, play]);

  // Handlers
  const handlePlaySong = (index: number) => {
    if (index === currentSongIndex) {
        if (isPlaying) pause();
        else play();
    } else {
        setCurrentSongIndex(index);
        setIsPlaying(true);
        setProgress(0);
    }
  };

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    if (currentSongIndex < queue.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
    } else {
        // Loop back to start
        setCurrentSongIndex(0);
    }
  }, [currentSongIndex, queue.length]);

  const handlePrev = useCallback(() => {
    if (currentSongIndex > 0) {
        setCurrentSongIndex(prev => prev - 1);
    }
  }, [currentSongIndex]);

  const handleImport = (newSong: Song) => {
    setQueue(prev => [newSong, ...prev]);
    // Auto play imported song
    setCurrentSongIndex(0);
  };

  const activeColor = currentSong?.colorHex || '#D0BCFF';

  return (
    <div className="relative min-h-screen bg-[#141218] text-[#E6E0E9] font-sans selection:bg-[#D0BCFF] selection:text-[#381E72] overflow-x-hidden">
      
      {/* Dynamic Background Mesh */}
      <div 
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-10 z-0"
        style={{ 
            background: `radial-gradient(circle at 50% 0%, ${activeColor}, transparent 70%)` 
        }}
      />

      {/* Hidden YouTube Player */}
      <div id="youtube-player-hidden" className="absolute top-0 left-0 h-0 w-0 opacity-0 pointer-events-none" />

      {/* Navigation / Header (MD3 Top App Bar) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#141218]/90 backdrop-blur-md">
        <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 rounded-full bg-[#D0BCFF] flex items-center justify-center text-[#381E72]">
                <span className="material-symbols-rounded text-2xl">play_circle</span>
            </div>
            <h1 className="text-xl font-normal tracking-tight text-[#E6E0E9]">Lumina Music</h1>
        </div>
        <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full hover:bg-[#E6E0E9]/10 flex items-center justify-center transition-colors text-[#E6E0E9]">
                <span className="material-symbols-rounded">search</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-[#49454F] overflow-hidden ml-2">
                <img src="https://picsum.photos/100" alt="User" className="h-full w-full object-cover opacity-80" />
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 pb-40 pt-6">
        
        {/* FAB / Action Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
            <div>
                <h2 className="text-[28px] leading-9 font-normal mb-1">Your Library</h2>
                <p className="text-[#CAC4D0] text-sm tracking-wide">
                   {queue.length} tracks • AI Enhanced
                </p>
            </div>
            {/* MD3 Floating Action Button (Extended) */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 bg-[#D0BCFF] text-[#381E72] px-6 py-4 rounded-[16px] font-medium hover:shadow-lg hover:shadow-[#D0BCFF]/20 active:scale-95 transition-all"
            >
                <span className="material-symbols-rounded">add</span>
                <span className="text-sm font-medium tracking-wide">Import URL</span>
            </button>
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
                />
            ))}

            {queue.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-[#CAC4D0] bg-[#1D1B20] rounded-[28px] mt-4 border border-[#49454F]">
                    <span className="material-symbols-rounded text-6xl mb-4 opacity-50">queue_music</span>
                    <p className="text-center max-w-xs">Your library is empty. Use the import button to add songs from YouTube.</p>
                </div>
            )}
        </div>
      </main>

      {/* Sticky Bottom Player */}
      <NowPlayingBar 
        playerState={{
            currentSong,
            isPlaying,
            progress,
            volume: 100,
            isMuted: false,
            queue
        }}
        onTogglePlay={() => isPlaying ? pause() : play()}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={seekTo}
      />

      {/* Import Modal */}
      <ImportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleImport}
      />

    </div>
  );
}

export default App;