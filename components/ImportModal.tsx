import React, { useState } from 'react';
import { extractVideoId, extractVideoIdsFromText } from '../utils/youtubeUtils';
import { analyzeSongMetadata } from '../services/geminiService';
import { Song } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (songs: Song[]) => void;
}

type Tab = 'YOUTUBE' | 'BATCH' | 'LOCAL';

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<Tab>('YOUTUBE');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  if (!isOpen) return null;

  const handleYoutubeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = String(formData.get('url') || '');
    const titleInput = String(formData.get('title') || '');

    if (!url) return;

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Analyzing vibe...');
    try {
      const analysis = await analyzeSongMetadata(titleInput || "Unknown Video");
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

      const newSong: Song = {
        id,
        source: 'YOUTUBE',
        videoId,
        url,
        title: analysis.title,
        artist: analysis.artist,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: 0,
        addedAt: Date.now(),
        mood: analysis.mood,
        colorHex: analysis.colorHex,
        summary: analysis.summary
      };

      onImport([newSong]);
      onClose();
    } catch (err) {
      setError("Failed to import.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = String(formData.get('batchText') || '');
    
    const ids = extractVideoIdsFromText(text);
    if (ids.length === 0) {
      setError("No valid YouTube links found.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`Found ${ids.length} tracks. Importing...`);

    const newSongs: Song[] = ids.map(videoId => ({
      id: crypto.randomUUID ? crypto.randomUUID() : videoId + Date.now(),
      source: 'YOUTUBE',
      videoId,
      url: `https://youtube.com/watch?v=${videoId}`,
      title: `Track ${videoId}`,
      artist: 'YouTube Import',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0,
      addedAt: Date.now(),
      mood: 'Imported',
      colorHex: '#49454F'
    }));

    // Simulate small delay for UX
    await new Promise(r => setTimeout(r, 800));
    
    onImport(newSongs);
    onClose();
    setIsLoading(false);
  };

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Explicitly type 'file' as File to avoid unknown type errors
    const newSongs: Song[] = Array.from(files).map((file: File) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : file.name + Date.now(),
      source: 'LOCAL',
      fileUrl: URL.createObjectURL(file),
      fileObj: file,
      url: file.name,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      artist: 'Local File',
      thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/9324/9324739.png', // Generic audio icon
      duration: 0,
      addedAt: Date.now(),
      mood: 'Local',
      colorHex: '#9ECAFF'
    }));

    onImport(newSongs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[28px] bg-[#2B2930] shadow-2xl elevation-3 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-2 text-center">
            <h2 className="text-2xl font-normal text-[#E6E0E9]">Add to Library</h2>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b border-[#49454F]">
            <button 
                onClick={() => setActiveTab('YOUTUBE')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'YOUTUBE' ? 'border-[#D0BCFF] text-[#D0BCFF]' : 'border-transparent text-[#CAC4D0]'}`}
            >
                YouTube URL
            </button>
            <button 
                onClick={() => setActiveTab('BATCH')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'BATCH' ? 'border-[#D0BCFF] text-[#D0BCFF]' : 'border-transparent text-[#CAC4D0]'}`}
            >
                Paste List
            </button>
            <button 
                onClick={() => setActiveTab('LOCAL')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'LOCAL' ? 'border-[#D0BCFF] text-[#D0BCFF]' : 'border-transparent text-[#CAC4D0]'}`}
            >
                MP3 File
            </button>
        </div>

        <div className="p-6">
            {activeTab === 'YOUTUBE' && (
                 <form onSubmit={handleYoutubeSubmit} className="flex flex-col gap-4">
                    <p className="text-[#CAC4D0] text-sm mb-2">Paste a single YouTube URL. Gemini will analyze it.</p>
                     <div className="group relative">
                         <div className="absolute top-0 left-0 w-full h-full rounded-[4px] pointer-events-none border border-[#938F99] group-focus-within:border-[#D0BCFF] group-focus-within:border-2 transition-all" />
                         <input name="url" type="text" placeholder=" " className="w-full bg-transparent px-4 py-3 pt-4 text-[#E6E0E9] outline-none peer" autoFocus />
                         <label className="absolute left-4 top-4 text-[#CAC4D0] text-base duration-200 transform -translate-y-3 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-[#D0BCFF] bg-[#2B2930] px-1 pointer-events-none">Video URL</label>
                     </div>
                     <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-[#D0BCFF] text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-full bg-[#D0BCFF] text-[#381E72] text-sm font-medium disabled:opacity-50">
                            {isLoading ? 'Processing...' : 'Add Track'}
                        </button>
                     </div>
                 </form>
            )}

            {activeTab === 'BATCH' && (
                <form onSubmit={handleBatchSubmit} className="flex flex-col gap-4">
                     <p className="text-[#CAC4D0] text-sm mb-2">Paste a text block containing multiple YouTube links (e.g. from a playlist description).</p>
                     <div className="relative">
                        <textarea 
                            name="batchText" 
                            rows={5}
                            className="w-full bg-[#141218] rounded-[8px] p-3 text-[#E6E0E9] text-sm border border-[#938F99] focus:border-[#D0BCFF] outline-none resize-none"
                            placeholder="https://youtube.com/watch?v=...\nhttps://youtube.com/watch?v=..."
                        />
                     </div>
                     <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-[#D0BCFF] text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-full bg-[#D0BCFF] text-[#381E72] text-sm font-medium disabled:opacity-50">
                            {isLoading ? 'Import All' : 'Import Batch'}
                        </button>
                     </div>
                </form>
            )}

            {activeTab === 'LOCAL' && (
                <div className="flex flex-col items-center gap-6 py-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#938F99] border-dashed rounded-[16px] cursor-pointer hover:bg-[#E6E0E9]/5 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="material-symbols-rounded text-3xl text-[#D0BCFF] mb-2">audio_file</span>
                            <p className="mb-2 text-sm text-[#CAC4D0]"><span className="font-semibold text-[#E6E0E9]">Click to upload</span> MP3</p>
                        </div>
                        <input type="file" accept="audio/*" multiple className="hidden" onChange={handleLocalFile} />
                    </label>
                    <p className="text-xs text-[#FFB4AB]">Note: Local files are not saved to cookies/storage and will disappear on refresh.</p>
                     <div className="flex justify-end w-full">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-[#D0BCFF] text-sm font-medium">Cancel</button>
                     </div>
                </div>
            )}
        </div>

        {(error || loadingMessage) && (
            <div className="px-6 pb-4">
                {error && <p className="text-[#FFB4AB] text-sm text-center">{error}</p>}
                {loadingMessage && <p className="text-[#E6E0E9] text-sm text-center animate-pulse">{loadingMessage}</p>}
            </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;