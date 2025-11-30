

import React from 'react';
import { Song } from '../types'; // CORRECTED: Path from components/ to root/

interface SongListItemProps {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  index: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
}

const SongListItem: React.FC<SongListItemProps> = ({ song, isActive, isPlaying, onClick, onDelete, index, onDragStart, onDrop }) => {
  return (
    <div 
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart && onDragStart(e, index)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop && onDrop(e, index)}
        onClick={onClick}
        className={`group relative flex items-center gap-4 p-4 rounded-[16px] cursor-pointer transition-colors duration-200 overflow-hidden
            ${isActive ? 'bg-primary-container' : 'hover:bg-[#E6E0E9]/5'}
        `}
    >
      <div className="w-8 flex items-center justify-center text-sm font-medium text-[#CAC4D0] cursor-move">
        {isActive && isPlaying ? (
           <span className="material-symbols-rounded animate-pulse text-primary">graphic_eq</span>
        ) : (
            <span className="group-hover:hidden">{index + 1}</span>
        )}
        <span className="hidden group-hover:inline-block material-symbols-rounded text-[#E6E0E9]">drag_indicator</span>
      </div>

      <div className="relative h-12 w-12 rounded-[8px] overflow-hidden shrink-0 bg-[#49454F] shadow-sm">
        <img src={song.thumbnailUrl} alt={song.title} className="h-full w-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className={`text-base font-medium truncate ${isActive ? 'text-primary' : 'text-[#E6E0E9]'}`}>{song.title}</h4>
        <div className="flex items-center gap-2">
            <p className="text-sm text-[#CAC4D0] truncate">{song.artist}</p>
        </div>
      </div>

      <div className="flex items-center text-[#CAC4D0] gap-4">
         <span className="text-xs hidden sm:block">
            {song.duration ? `${Math.floor(song.duration / 60)}:${Math.floor(song.duration % 60).toString().padStart(2, '0')}` : '--:--'}
         </span>
         <button onClick={onDelete} className="p-2 rounded-full text-[#CAC4D0] hover:text-error hover:bg-error/10 transition-colors z-10">
            <span className="material-symbols-rounded text-xl">delete</span>
         </button>
      </div>
    </div>
  );
};

export default SongListItem;