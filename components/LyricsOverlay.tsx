import React, { useEffect, useRef, useState } from 'react';
import { Song, LyricLine } from '../types';

interface LyricsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  currentTime: number;
  onImportLyrics: (lyrics: LyricLine[]) => void;
}

const LyricsOverlay: React.FC<LyricsOverlayProps> = ({ 
  isOpen, 
  onClose, 
  currentSong, 
  currentTime,
  onImportLyrics 
}) => {
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync lyrics to time
  useEffect(() => {
    if (!currentSong?.lyrics) return;

    // Find the current line
    // A line is active if currentTime is >= start. 
    // We want the *last* line that satisfies this condition.
    let index = -1;
    for (let i = 0; i < currentSong.lyrics.length; i++) {
      if (currentTime >= currentSong.lyrics[i].start) {
        index = i;
      } else {
        break; // Sorted assumption
      }
    }
    setActiveLineIndex(index);
  }, [currentTime, currentSong]);

  // Auto-scroll
  useEffect(() => {
    if (activeLineIndex >= 0 && scrollRef.current) {
      const activeEl = scrollRef.current.children[activeLineIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineIndex]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const json = JSON.parse(text);
        
        // Basic validation
        if (!Array.isArray(json)) throw new Error("Format must be an array");
        if (json.length > 0 && (typeof json[0].start !== 'number' || typeof json[0].text !== 'string')) {
          throw new Error("Invalid lyric format. Expected [{start: number, end: number, text: string}, ...]");
        }

        onImportLyrics(json as LyricLine[]);
        setError(null);
      } catch (err) {
        setError("Invalid JSON file. Ensure it matches the required format.");
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#141218] animate-in slide-in-from-bottom duration-300">
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none blur-3xl scale-110 transition-colors duration-1000"
        style={{ backgroundColor: currentSong.colorHex || '#49454F' }}
      />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6">
        <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#E6E0E9] transition-colors">
          <span className="material-symbols-rounded text-3xl">expand_more</span>
        </button>
        <div className="text-center">
            <h3 className="text-[#D0BCFF] text-sm font-medium tracking-wide uppercase">Lyrics</h3>
            <p className="text-white/60 text-xs truncate max-w-[200px]">{currentSong.title}</p>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden flex flex-col items-center justify-center pb-24 px-8">
        
        {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
          <div ref={scrollRef} className="w-full max-w-2xl h-full overflow-y-auto no-scrollbar py-[50vh] text-center space-y-8">
            {currentSong.lyrics.map((line, index) => {
              const isActive = index === activeLineIndex;
              const isPast = index < activeLineIndex;
              return (
                <p 
                  key={index}
                  className={`
                    transition-all duration-500 ease-out font-bold leading-tight cursor-pointer
                    ${isActive ? 'text-4xl sm:text-5xl text-white scale-100 opacity-100' : 'text-2xl sm:text-3xl text-[#CAC4D0] scale-95 opacity-30 hover:opacity-60'}
                  `}
                  onClick={() => {
                      // Optional: Seek to this line (would require callback prop)
                  }}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full max-w-md text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-4xl text-[#CAC4D0]">lyrics</span>
            </div>
            <h2 className="text-2xl font-normal text-[#E6E0E9] mb-2">No lyrics available</h2>
            <p className="text-[#CAC4D0] mb-8">Import a JSON file to see synchronized lyrics for this track.</p>
            
            <label className="cursor-pointer group">
                <div className="px-6 py-3 rounded-full bg-[#D0BCFF] text-[#381E72] font-medium shadow-lg hover:shadow-[#D0BCFF]/20 transition-all active:scale-95 flex items-center gap-2">
                    <span className="material-symbols-rounded">upload_file</span>
                    Import .JSON
                </div>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            {error && <p className="mt-4 text-[#FFB4AB] bg-[#690005]/20 px-4 py-2 rounded-lg text-sm">{error}</p>}
            
            <div className="mt-8 text-left bg-white/5 p-4 rounded-xl border border-white/10 w-full">
                <p className="text-xs text-[#CAC4D0] font-mono mb-2">Example Format:</p>
                <pre className="text-[10px] text-[#E6E0E9] font-mono overflow-x-auto whitespace-pre-wrap">
{`[
  { "start": 0, "end": 4.5, "text": "Hello world" },
  { "start": 4.6, "end": 10, "text": "This is a line" }
]`}
                </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default LyricsOverlay;