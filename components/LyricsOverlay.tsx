import React, { useEffect, useRef, useState } from 'react';
import { Song, LyricLine } from '../types';

interface LyricsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  currentTime: number;
  onImportLyrics: (lyrics: LyricLine[]) => void;
}

type ImportTab = 'FILE' | 'PASTE';

const EXAMPLE_JSON = `[
  { 
    "start": 12.5, 
    "end": 15.0, 
    "text": "Start of the first line" 
  },
  { 
    "start": 15.2, 
    "end": 20.0, 
    "text": "Here is the second line" 
  }
]`;

const LyricsOverlay: React.FC<LyricsOverlayProps> = ({ 
  isOpen, 
  onClose, 
  currentSong, 
  currentTime,
  onImportLyrics 
}) => {
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [importTab, setImportTab] = useState<ImportTab>('PASTE');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync lyrics to time
  useEffect(() => {
    if (!currentSong?.lyrics) return;

    let index = -1;
    for (let i = 0; i < currentSong.lyrics.length; i++) {
      // Basic synchronization: if current time is past start time
      if (currentTime >= currentSong.lyrics[i].start) {
        index = i;
      } else {
        break; 
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

  // --- Import Logic ---

  const sanitizeAndParse = (rawText: string) => {
    try {
      // 1. Replace smart quotes (“” or ‘’) with straight quotes (" or ')
      let cleaned = rawText.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
      
      // 2. Remove trailing commas (common JSON error)
      cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

      const json = JSON.parse(cleaned);

      if (!Array.isArray(json)) throw new Error("Root must be an Array []");
      
      const validLyrics: LyricLine[] = json.map((item, idx) => {
        if (typeof item.start !== 'number' || typeof item.text !== 'string') {
          throw new Error(`Item at index ${idx} is missing 'start' (number) or 'text' (string).`);
        }
        return {
          start: item.start,
          end: item.end || item.start + 2, // Default duration if missing
          text: item.text
        };
      });

      // Sort by time just in case
      validLyrics.sort((a, b) => a.start - b.start);

      onImportLyrics(validLyrics);
      setError(null);
      setTextInput(''); // Clear input
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sanitizeAndParse(textInput);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      sanitizeAndParse(text);
    };
    reader.readAsText(file);
  };

  if (!isOpen || !currentSong) return null;

  const hasLyrics = currentSong.lyrics && currentSong.lyrics.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#141218] animate-in slide-in-from-bottom duration-300">
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none blur-3xl scale-110 transition-colors duration-1000"
        style={{ backgroundColor: currentSong.colorHex || '#49454F' }}
      />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-[#141218]/50 backdrop-blur-md">
        <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#E6E0E9] transition-colors">
          <span className="material-symbols-rounded text-3xl">expand_more</span>
        </button>
        <div className="text-center">
            <h3 className="text-[#D0BCFF] text-sm font-medium tracking-wide uppercase">Lyrics</h3>
            <p className="text-white/60 text-xs truncate max-w-[200px]">{currentSong.title}</p>
        </div>
        
        {/* If lyrics exist, show an 'edit' or 'replace' button by just showing a spacer or icon */}
        <div className="w-12 flex justify-end">
           {hasLyrics && (
             <button 
                onClick={() => onImportLyrics([])} // Clear lyrics to trigger import view
                title="Replace Lyrics"
                className="p-2 text-[#CAC4D0] hover:text-[#D0BCFF]"
             >
                <span className="material-symbols-rounded">edit_note</span>
             </button>
           )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden flex flex-col items-center justify-center w-full">
        
        {hasLyrics ? (
          // --- KARAOKE VIEW ---
          <div ref={scrollRef} className="w-full max-w-2xl h-full overflow-y-auto no-scrollbar py-[50vh] text-center space-y-8 px-6">
            {currentSong.lyrics!.map((line, index) => {
              const isActive = index === activeLineIndex;
              return (
                <p 
                  key={index}
                  className={`
                    transition-all duration-500 ease-out font-bold leading-tight cursor-pointer origin-center
                    ${isActive ? 'text-3xl sm:text-5xl text-white scale-100 opacity-100 blur-none' : 'text-2xl sm:text-3xl text-[#CAC4D0] scale-95 opacity-30 hover:opacity-60 blur-[1px]'}
                  `}
                  onClick={() => {
                      // Optional seek logic could go here
                  }}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : (
          // --- IMPORT VIEW ---
          <div className="flex flex-col h-full w-full max-w-2xl px-6 py-8 overflow-y-auto">
            
            <div className="flex items-center justify-center gap-4 mb-6">
                <span className="material-symbols-rounded text-5xl text-[#D0BCFF] opacity-80">lyrics</span>
                <div>
                    <h2 className="text-xl font-normal text-[#E6E0E9]">Add Synced Lyrics</h2>
                    <p className="text-sm text-[#CAC4D0]">Paste JSON or upload a file</p>
                </div>
            </div>

            {/* Example Block - "Example Before Anything" */}
            <div className="bg-[#1D1B20] border border-[#49454F] rounded-[12px] p-4 mb-6 relative group">
                <p className="text-[10px] text-[#D0BCFF] uppercase tracking-widest font-bold mb-2">Required Format</p>
                <pre className="text-xs text-[#E6E0E9] font-mono overflow-x-auto whitespace-pre bg-black/20 p-3 rounded-lg border border-white/5 select-all">
{EXAMPLE_JSON}
                </pre>
                <p className="text-xs text-[#CAC4D0] mt-2 italic">
                    Tip: Timestamps are in seconds. "start" is required.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#2B2930] p-1 rounded-full mb-6 self-center">
                <button 
                    onClick={() => setImportTab('PASTE')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${importTab === 'PASTE' ? 'bg-[#D0BCFF] text-[#381E72] shadow-sm' : 'text-[#CAC4D0] hover:text-[#E6E0E9]'}`}
                >
                    Paste JSON
                </button>
                <button 
                    onClick={() => setImportTab('FILE')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${importTab === 'FILE' ? 'bg-[#D0BCFF] text-[#381E72] shadow-sm' : 'text-[#CAC4D0] hover:text-[#E6E0E9]'}`}
                >
                    Upload File
                </button>
            </div>

            {/* Actions */}
            <div className="flex-1 flex flex-col">
                {importTab === 'PASTE' ? (
                    <form onSubmit={handleTextSubmit} className="flex flex-col gap-4 h-full">
                        <textarea 
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder='Paste your JSON here...'
                            className="flex-1 w-full bg-[#1D1B20] border border-[#49454F] rounded-[12px] p-4 text-sm text-[#E6E0E9] font-mono focus:border-[#D0BCFF] outline-none resize-none min-h-[150px]"
                        />
                        <button 
                            type="submit" 
                            disabled={!textInput.trim()}
                            className="w-full py-3 rounded-full bg-[#D0BCFF] text-[#381E72] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#D0BCFF]/20 transition-all"
                        >
                            Save Lyrics
                        </button>
                    </form>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#49454F] rounded-[16px] hover:bg-[#E6E0E9]/5 transition-colors cursor-pointer relative">
                        <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <span className="material-symbols-rounded text-3xl text-[#CAC4D0] mb-2">upload_file</span>
                        <p className="text-sm text-[#E6E0E9] font-medium">Click to browse</p>
                        <p className="text-xs text-[#CAC4D0]">Supports .json files</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-[#690005]/20 border border-[#FFB4AB]/20 rounded-lg flex items-start gap-3">
                    <span className="material-symbols-rounded text-[#FFB4AB] text-lg">error</span>
                    <p className="text-sm text-[#FFB4AB]">{error}</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsOverlay;