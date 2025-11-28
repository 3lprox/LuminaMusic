import React, { useEffect, useState } from 'react';
import { Song, PlayerState } from '../types';

interface NowPlayingBarProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
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
  onSeek
}) => {
  const { currentSong, isPlaying, progress } = playerState;
  const [localProgress, setLocalProgress] = useState(progress);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(Number(e.target.value));
  };

  const handleSliderCommit = () => {
    setIsDragging(false);
    onSeek(localProgress);
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2B2930] text-[#E6E0E9] rounded-t-[28px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] border-t border-white/5 pb-safe">
      
      {/* Container */}
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col gap-2">
        
        <div className="flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative group shrink-0">
                    <img 
                        src={currentSong.thumbnailUrl} 
                        alt="Album Art" 
                        className={`h-14 w-14 rounded-[12px] object-cover bg-[#49454F] ${isPlaying ? 'animate-pulse-slow' : ''}`}
                    />
                </div>
                <div className="min-w-0">
                    <h3 className="font-medium text-base text-[#E6E0E9] truncate">{currentSong.title}</h3>
                    <p className="text-sm text-[#CAC4D0] truncate">{currentSong.artist}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button onClick={onPrev} className="text-[#CAC4D0] hover:text-[#E6E0E9] p-2">
                    <span className="material-symbols-rounded text-3xl">skip_previous</span>
                </button>
                
                {/* Play Button - MD3 FAB Style */}
                <button 
                    onClick={onTogglePlay}
                    className="h-14 w-14 rounded-[16px] bg-[#D0BCFF] text-[#381E72] flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                >
                    <span className="material-symbols-rounded text-3xl fill-1">
                        {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                </button>

                <button onClick={onNext} className="text-[#CAC4D0] hover:text-[#E6E0E9] p-2">
                    <span className="material-symbols-rounded text-3xl">skip_next</span>
                </button>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-medium text-[#CAC4D0] w-10 text-right">{formatTime(localProgress)}</span>
            
            <div className="relative flex-1 h-8 flex items-center group">
                {/* Track */}
                <div className="absolute w-full h-1 bg-[#49454F] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#D0BCFF] transition-all duration-100 ease-linear"
                        style={{ width: `${(localProgress / (currentSong.duration || 1)) * 100}%` }}
                    />
                </div>
                {/* Input */}
                <input 
                    type="range"
                    min={0}
                    max={currentSong.duration || 100}
                    value={localProgress}
                    onChange={handleSliderChange}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={handleSliderCommit}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={handleSliderCommit}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
            </div>

            <span className="text-xs font-medium text-[#CAC4D0] w-10">{formatTime(currentSong.duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingBar;