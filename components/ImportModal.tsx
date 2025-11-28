import React, { useState } from 'react';
import { extractVideoId } from '../utils/youtubeUtils';
import { searchYouTube, fetchVideoMetadata } from '../services/geminiService'; // Actually youtubeService
import { Song, User } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (songs: Song[]) => void;
  user: User;
}

type Tab = 'SEARCH' | 'URL' | 'LOCAL';

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('SEARCH');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  if (!isOpen) return null;

  // Determine which credential to use
  const credential = user.accessToken || user.apiKey || undefined;

  // --- SEARCH TAB ---
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // SMART SEARCH: If user pastes a URL, auto-switch to import logic
    const potentialVideoId = extractVideoId(searchQuery);
    if (potentialVideoId) {
        setIsLoading(true);
        setLoadingMessage('Link detected! Fetching video...');
        setError(null);
        try {
            const metadata = await fetchVideoMetadata(potentialVideoId, credential);
            if (metadata) {
                onImport([metadata]);
                onClose();
            } else {
                setError("Could not load video details.");
            }
        } catch (err) {
            setError("Failed to import link.");
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // Normal Search
    setIsLoading(true);
    setLoadingMessage('Searching YouTube...');
    setError(null);
    setSearchResults([]);

    try {
      const results = await searchYouTube(searchQuery, credential);
      setSearchResults(results);
      if (results.length === 0) setError("No results found.");
    } catch (err) {
      setError("Search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSearchResult = (song: Song) => {
    onImport([song]);
    onClose();
  };

  // --- URL TAB ---
  const handleYoutubeUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = String(formData.get('url') || '');

    if (!url) return;

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Fetching details...');
    try {
      const metadata = await fetchVideoMetadata(videoId, credential);
      if (metadata) {
        onImport([metadata]);
        onClose();
      } else {
        setError("Could not load video details.");
      }
    } catch (err) {
      setError("Failed to import.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- LOCAL TAB ---
  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSongs: Song[] = Array.from(files).map((file: File) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : file.name + Date.now(),
      source: 'LOCAL',
      fileUrl: URL.createObjectURL(file),
      fileObj: file,
      url: file.name,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: 'Local File',
      thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/9324/9324739.png',
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
      <div className="w-full max-w-lg rounded-[28px] bg-[#2B2930] shadow-2xl elevation-3 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-2 text-center">
            <h2 className="text-2xl font-normal text-[#E6E0E9]">Add Music</h2>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b border-[#49454F]">
            <button 
                onClick={() => setActiveTab('SEARCH')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'SEARCH' ? 'border-[#D0BCFF] text-[#D0BCFF]' : 'border-transparent text-[#CAC4D0]'}`}
            >
                Search
            </button>
            <button 
                onClick={() => setActiveTab('URL')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'URL' ? 'border-[#D0BCFF] text-[#D0BCFF]' : 'border-transparent text-[#CAC4D0]'}`}
            >
                URL
            </button>
            <button 
                onClick={() => setActiveTab('LOCAL')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'LOCAL' ? 'border-[#D0BCFF] text-[#D0BCFF]' : 'border-transparent text-[#CAC4D0]'}`}
            >
                Upload
            </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'SEARCH' && (
                 <div className="flex flex-col gap-4">
                     <form onSubmit={handleSearchSubmit} className="flex gap-2">
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            type="text" 
                            placeholder={user.isGuest ? "Search or Paste Link..." : "Search YouTube or Paste Link..."}
                            className="flex-1 bg-[#141218] border border-[#938F99] rounded-full px-4 py-2 text-[#E6E0E9] outline-none focus:border-[#D0BCFF]" 
                            autoFocus 
                        />
                        <button type="submit" disabled={isLoading} className="bg-[#D0BCFF] text-[#381E72] rounded-full px-4 py-2 font-medium hover:opacity-90">
                            {isLoading ? '...' : 'Go'}
                        </button>
                     </form>
                     
                     <div className="flex flex-col gap-2 mt-2">
                        {isLoading && <p className="text-center text-[#CAC4D0] animate-pulse">{loadingMessage}</p>}
                        
                        {searchResults.map((song) => (
                            <div key={song.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#E6E0E9]/5 group">
                                <img src={song.thumbnailUrl} className="w-16 h-10 object-cover rounded-md bg-[#49454F]" alt="" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#E6E0E9] text-sm font-medium truncate">{song.title}</p>
                                    <p className="text-[#CAC4D0] text-xs truncate">{song.artist}</p>
                                </div>
                                <button onClick={() => handleAddSearchResult(song)} className="p-2 text-[#D0BCFF] hover:bg-[#D0BCFF]/10 rounded-full">
                                    <span className="material-symbols-rounded">add_circle</span>
                                </button>
                            </div>
                        ))}
                     </div>
                 </div>
            )}

            {activeTab === 'URL' && (
                 <form onSubmit={handleYoutubeUrlSubmit} className="flex flex-col gap-4">
                    <p className="text-[#CAC4D0] text-sm mb-2">Paste a YouTube Link directly.</p>
                     <div className="group relative">
                         <input name="url" type="text" placeholder="https://youtube.com/watch?v=..." className="w-full bg-[#141218] border border-[#938F99] rounded-[4px] px-4 py-3 text-[#E6E0E9] outline-none focus:border-[#D0BCFF]" />
                     </div>
                     <button type="submit" disabled={isLoading} className="self-end px-6 py-2 rounded-full bg-[#D0BCFF] text-[#381E72] text-sm font-medium disabled:opacity-50 mt-2">
                        {isLoading ? 'Loading...' : 'Import'}
                     </button>
                 </form>
            )}

            {activeTab === 'LOCAL' && (
                <div className="flex flex-col items-center gap-6 py-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#938F99] border-dashed rounded-[16px] cursor-pointer hover:bg-[#E6E0E9]/5 transition-colors">
                        <span className="material-symbols-rounded text-3xl text-[#D0BCFF] mb-2">audio_file</span>
                        <p className="mb-2 text-sm text-[#CAC4D0]">Click to upload MP3</p>
                        <input type="file" accept="audio/*" multiple className="hidden" onChange={handleLocalFile} />
                    </label>
                </div>
            )}
        </div>
        
        {/* Footer with Close */}
        <div className="px-6 pb-4 flex justify-between items-center border-t border-[#49454F] pt-4">
            <span className="text-xs text-[#CAC4D0]">
                {user.isGuest ? 'Guest Mode' : <span className="text-[#E6E0E9]">{user.username}</span>}
            </span>
            <button type="button" onClick={onClose} className="px-4 py-2 text-[#D0BCFF] text-sm font-medium">Close</button>
        </div>

        {error && (
            <div className="bg-[#601410] text-[#FFB4AB] text-xs text-center p-2">
                {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;