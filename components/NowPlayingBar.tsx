import React, { useEffect, useState } from 'react';
import { Song, PlayerState, RepeatMode } from '../types';

interface NowPlayingBarProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleRepeat: () => void;
  onToggleLyrics: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const NowPlayingBar: React.FC<NowPlayingBarProps> = ({ 
  playerState, 
  onTogglePlay, 
  onNext, 
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleRepeat,
  onToggleLyrics
}) => {
  const { currentSong, isPlaying, progress, volume, repeatMode } = playerState;
  const [localProgress, setLocalProgress] = useState(progress);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(Number(e.target.value));
  };

  const handleSeekCommit = () => {
    setIsDragging(false);
    onSeek(localProgress);
  };

  if (!currentSong) return null;

  const repeatIcon = repeatMode === RepeatMode.ONE ? 'repeat_one' : 'repeat';
  const repeatColor = repeatMode !== RepeatMode.NONE ? 'text-[#D0BCFF]' : 'text-[#CAC4D0]';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2B2930] text-[#E6E0E9] rounded-t-[28px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] border-t border-white/5 pb-safe transition-transform duration-300">
      
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex flex-col gap-2">
        
        {/* Progress Bar (Top of player) */}
        <div className="flex items-center gap-3 w-full">
             <span className="text-xs font-medium text-[#CAC4D0] w-8 text-right">{formatTime(localProgress)}</span>
             <div className="relative flex-1 h-6 flex items-center group">
                <div className="absolute w-full h-1 bg-[#49454F] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D0BCFF] transition-all duration-100 ease-linear" style={{ width: `${(localProgress / (currentSong.duration || 1)) * 100}%` }} />
                </div>
                <input 
                    type="range" min={0} max={currentSong.duration || 100} value={localProgress}
                    onChange={handleSeekChange} onMouseDown={() => setIsDragging(true)} onMouseUp={handleSeekCommit} onTouchStart={() => setIsDragging(true)} onTouchEnd={handleSeekCommit}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
            </div>
            <span className="text-xs font-medium text-[#CAC4D0] w-8">{formatTime(currentSong.duration)}</span>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-between gap-4">
            
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <img 
                    src={currentSong.thumbnailUrl} alt="Album Art" 
                    className={`h-12 w-12 rounded-[12px] object-cover bg-[#49454F] ${isPlaying ? 'animate-pulse-slow' : ''}`}
                />
                <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="font-medium text-sm text-[#E6E0E9] truncate leading-tight">{currentSong.title}</h3>
                    <p className="text-xs text-[#CAC4D0] truncate leading-tight mt-0.5">{currentSong.artist}</p>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={onPrev} className="text-[#CAC4D0] hover:text-[#E6E0E9] p-2 rounded-full hover:bg-[#E6E0E9]/10">
                    <span className="material-symbols-rounded text-2xl">skip_previous</span>
                </button>
                
                <button 
                    onClick={onTogglePlay}
                    className="h-12 w-12 rounded-[16px] bg-[#D0BCFF] text-[#381E72] flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                >
                    <span className="material-symbols-rounded text-3xl fill-1">{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>

                <button onClick={onNext} className="text-[#CAC4D0] hover:text-[#E6E0E9] p-2 rounded-full hover:bg-[#E6E0E9]/10">
                    <span className="material-symbols-rounded text-2xl">skip_next</span>
                </button>
            </div>

            {/* Volume & Repeat (Desktop/Tablet) */}
            <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
                {/* Volume */}
                <div className="group flex items-center gap-2 mr-2">
                    <span className="material-symbols-rounded text-[#CAC4D0] text-xl">volume_up</span>
                    <input 
                        type="range" min="0" max="100" value={volume} 
                        onChange={(e) => onVolumeChange(Number(e.target.value))}
                        className="w-20 h-1 bg-[#49454F] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D0BCFF]"
                    />
                </div>

                <button onClick={onToggleRepeat} className={`p-2 rounded-full hover:bg-[#E6E0E9]/10 ${repeatColor} transition-colors relative`}>
                    <span className="material-symbols-rounded text-xl">{repeatIcon}</span>
                    {repeatMode !== RepeatMode.NONE && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#D0BCFF] rounded-full"></div>
                    )}
                </button>

                <button onClick={onToggleLyrics} className={`p-2 rounded-full hover:bg-[#E6E0E9]/10 transition-colors ${currentSong.lyrics ? 'text-[#D0BCFF]' : 'text-[#CAC4D0]'}`}>
                   <span className="material-symbols-rounded text-xl">mic</span>
                </button>
            </div>
            
            {/* Mobile Lyrics Button (Only visible on small screens) */}
            <button onClick={onToggleLyrics} className="sm:hidden text-[#CAC4D0] p-2">
                <span className="material-symbols-rounded text-2xl">mic</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingBar;