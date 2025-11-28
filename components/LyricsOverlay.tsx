import React, { useEffect, useRef, useState } from 'react';
import { Song, LyricLine } from '../types';

interface LyricsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  currentTime: number;
  onImportLyrics: (lyrics: LyricLine[]) => void;
}

type Mode = 'VIEW' | 'EDIT' | 'IMPORT';
type ImportTab = 'PASTE' | 'FILE';

const LyricsOverlay: React.FC<LyricsOverlayProps> = ({ 
  isOpen, 
  onClose, 
  currentSong, 
  currentTime,
  onImportLyrics 
}) => {
  const [mode, setMode] = useState<Mode>('VIEW');
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [importTab, setImportTab] = useState<ImportTab>('PASTE');
  
  // Edit State
  const [editedLyrics, setEditedLyrics] = useState<LyricLine[]>([]);
  
  // Import State
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    if (isOpen && currentSong) {
      if (currentSong.lyrics && currentSong.lyrics.length > 0) {
        setMode('VIEW');
        setEditedLyrics(currentSong.lyrics);
      } else {
        setMode('IMPORT');
        setEditedLyrics([]);
      }
    }
  }, [isOpen, currentSong]);

  // Sync lyrics to time (Only in View mode)
  useEffect(() => {
    if (mode !== 'VIEW' || !currentSong?.lyrics) return;

    let index = -1;
    for (let i = 0; i < currentSong.lyrics.length; i++) {
      if (currentTime >= currentSong.lyrics[i].start) {
        index = i;
      } else {
        break; 
      }
    }
    setActiveLineIndex(index);
  }, [currentTime, currentSong, mode]);

  // Auto-scroll
  useEffect(() => {
    if (mode === 'VIEW' && activeLineIndex >= 0 && scrollRef.current) {
      const activeEl = scrollRef.current.children[activeLineIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineIndex, mode]);


  // --- Logic ---

  const saveEdits = () => {
    // Sort by start time before saving
    const sorted = [...editedLyrics].sort((a, b) => a.start - b.start);
    onImportLyrics(sorted);
    setMode('VIEW');
  };

  const updateLine = (index: number, field: keyof LyricLine, value: string | number) => {
    const newLyrics = [...editedLyrics];
    newLyrics[index] = { ...newLyrics[index], [field]: value };
    setEditedLyrics(newLyrics);
  };

  const deleteLine = (index: number) => {
    setEditedLyrics(prev => prev.filter((_, i) => i !== index));
  };

  const addLine = () => {
    const lastTime = editedLyrics.length > 0 ? editedLyrics[editedLyrics.length - 1].start : 0;
    setEditedLyrics([...editedLyrics, { start: lastTime + 2, end: lastTime + 5, text: "New Lyric Line" }]);
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
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141218]/80 backdrop-blur-md">
        <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#E6E0E9] transition-colors">
          <span className="material-symbols-rounded text-2xl">expand_more</span>
        </button>
        
        <div className="text-center">
            <h3 className="text-[#E6E0E9] text-base font-medium">{currentSong.title}</h3>
            <p className="text-[#CAC4D0] text-xs">{mode === 'VIEW' ? 'Lyrics' : mode === 'EDIT' ? 'Editing' : 'Import'}</p>
        </div>
        
        <div className="flex items-center gap-2">
           {mode === 'VIEW' && (
             <button 
                onClick={() => { setEditedLyrics(currentSong.lyrics || []); setMode('EDIT'); }}
                className="p-2 text-[#D0BCFF] bg-[#D0BCFF]/10 rounded-full hover:bg-[#D0BCFF]/20"
                title="Edit Lyrics"
             >
                <span className="material-symbols-rounded text-xl">edit</span>
             </button>
           )}
           {mode === 'EDIT' && (
              <button 
                onClick={saveEdits}
                className="px-4 py-1.5 bg-[#D0BCFF] text-[#381E72] rounded-full text-sm font-medium hover:shadow-lg"
              >
                Save
              </button>
           )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden w-full flex flex-col">
        
        {/* VIEW MODE */}
        {mode === 'VIEW' && (
           <div ref={scrollRef} className="w-full max-w-2xl mx-auto h-full overflow-y-auto no-scrollbar py-[40vh] text-center space-y-8 px-6">
            {currentSong.lyrics?.map((line, index) => {
              const isActive = index === activeLineIndex;
              return (
                <p 
                  key={index}
                  className={`
                    transition-all duration-500 ease-out font-bold leading-tight cursor-pointer origin-center
                    ${isActive ? 'text-3xl sm:text-4xl text-white scale-100 opacity-100 blur-none' : 'text-xl sm:text-2xl text-[#CAC4D0] scale-95 opacity-30 hover:opacity-60 blur-[1px]'}
                  `}
                >
                  {line.text}
                </p>
              );
            })}
            {(!currentSong.lyrics || currentSong.lyrics.length === 0) && (
                 <div className="flex flex-col items-center justify-center h-full pb-32">
                    <p className="text-[#CAC4D0] mb-4">No lyrics found.</p>
                    <button onClick={() => setMode('IMPORT')} className="text-[#D0BCFF] underline">Add Lyrics</button>
                 </div>
            )}
           </div>
        )}

        {/* EDIT MODE */}
        {mode === 'EDIT' && (
           <div className="w-full max-w-3xl mx-auto h-full overflow-y-auto p-4 sm:p-6 pb-24">
              <div className="flex justify-end mb-4">
                  <button onClick={addLine} className="flex items-center gap-2 text-[#D0BCFF] text-sm hover:bg-[#D0BCFF]/10 px-3 py-1.5 rounded-lg transition-colors">
                      <span className="material-symbols-rounded text-lg">add</span> Add Line
                  </button>
              </div>
              
              <div className="space-y-2">
                  {editedLyrics.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <input 
                            type="number" 
                            value={line.start} 
                            step="0.1"
                            onChange={(e) => updateLine(idx, 'start', parseFloat(e.target.value))}
                            className="w-20 bg-[#2B2930] text-[#D0BCFF] text-right font-mono text-sm p-3 rounded-[12px] outline-none focus:ring-1 focus:ring-[#D0BCFF]"
                            placeholder="0.0s"
                          />
                          <input 
                            type="text" 
                            value={line.text} 
                            onChange={(e) => updateLine(idx, 'text', e.target.value)}
                            className="flex-1 bg-[#1D1B20] text-[#E6E0E9] text-base p-3 rounded-[12px] border border-transparent focus:border-[#49454F] outline-none"
                            placeholder="Lyric text..."
                          />
                          <button onClick={() => deleteLine(idx)} className="p-2 text-[#FFB4AB] opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-rounded">delete</span>
                          </button>
                      </div>
                  ))}
                  {editedLyrics.length === 0 && (
                      <div className="text-center py-10 text-[#CAC4D0]">List is empty. Add a line.</div>
                  )}
              </div>
           </div>
        )}

        {/* IMPORT MODE */}
        {mode === 'IMPORT' && (
           <div className="w-full max-w-2xl mx-auto h-full overflow-y-auto p-6 flex flex-col items-center">
             
             {/* Example Format */}
             <div className="w-full bg-[#2B2930] rounded-[16px] p-4 mb-6 text-xs text-[#CAC4D0] font-mono border border-[#49454F]">
                <p className="text-[#D0BCFF] mb-2 font-bold uppercase">Required JSON Format:</p>
                <pre className="overflow-x-auto whitespace-pre-wrap">
{`[
  { "start": 12.5, "text": "First line of lyrics" },
  { "start": 16.2, "text": "Second line here" }
]`}
                </pre>
             </div>

             {/* Manual / Paste */}
             <div className="w-full mt-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[#E6E0E9] font-medium">Import JSON</h3>
                    <div className="flex bg-[#2B2930] rounded-full p-0.5">
                        <button onClick={() => setImportTab('PASTE')} className={`px-4 py-1 rounded-full text-xs font-medium ${importTab === 'PASTE' ? 'bg-[#49454F] text-white' : 'text-[#CAC4D0]'}`}>Paste</button>
                        <button onClick={() => setImportTab('FILE')} className={`px-4 py-1 rounded-full text-xs font-medium ${importTab === 'FILE' ? 'bg-[#49454F] text-white' : 'text-[#CAC4D0]'}`}>File</button>
                    </div>
                </div>

                {importTab === 'PASTE' ? (
                    <div className="flex-1 flex flex-col gap-3 min-h-[200px]">
                        <textarea 
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Paste your JSON here..."
                            className="flex-1 w-full bg-[#1D1B20] border border-[#49454F] rounded-[16px] p-4 text-sm text-[#E6E0E9] font-mono outline-none focus:border-[#D0BCFF] resize-none"
                        />
                        <button 
                            onClick={() => {
                                try {
                                    // Basic sanitization for smart quotes/trailing commas
                                    const sanitized = textInput
                                        .replace(/[\u201C\u201D]/g, '"')
                                        .replace(/,(\s*[\]}])/g, '$1');
                                    const parsed = JSON.parse(sanitized);
                                    if(Array.isArray(parsed)) {
                                        setEditedLyrics(parsed);
                                        setMode('EDIT');
                                    } else {
                                        throw new Error("Not an array");
                                    }
                                } catch(e) { setError("Invalid JSON format. Please check syntax."); }
                            }}
                            className="px-6 py-3 rounded-[12px] bg-[#D0BCFF] text-[#381E72] font-medium hover:shadow-lg transition-all active:scale-95"
                        >
                            Process JSON
                        </button>
                    </div>
                ) : (
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#49454F] rounded-[16px] hover:bg-[#E6E0E9]/5 transition-colors cursor-pointer min-h-[200px]">
                        <input type="file" accept=".json" onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                                 const reader = new FileReader();
                                 reader.onload = (ev) => {
                                     setTextInput(ev.target?.result as string);
                                     setImportTab('PASTE'); // Switch to paste view to review
                                 };
                                 reader.readAsText(file);
                             }
                        }} className="hidden" />
                        <span className="material-symbols-rounded text-3xl text-[#CAC4D0] mb-2">upload_file</span>
                        <p className="text-sm text-[#E6E0E9]">Upload JSON File</p>
                    </label>
                )}
             </div>

             {error && (
                <div className="mt-4 w-full p-3 bg-[#601410] rounded-lg text-[#FFB4AB] text-sm text-center animate-in slide-in-from-bottom-2">
                    {error}
                </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};

export default LyricsOverlay;