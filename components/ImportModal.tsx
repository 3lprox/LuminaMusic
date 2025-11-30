

import React, { useState } from 'react';
import { extractVideoId, extractPlaylistId } from '../utils/youtubeUtils'; // CORRECTED: Path from components/ to utils/
import { searchYouTube, fetchVideoMetadata, fetchPlaylistItems } from '../services/youtubeService';
import { Song, User } from '../types'; // CORRECTED: Path from components/ to root/
import { getTranslation } from '../utils/i18n'; // CORRECTED: Path from components/ to utils/

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (songs: Song[]) => void;
  user: User;
  primaryColor: string; // Added primaryColor prop
}

type Tab = 'SEARCH' | 'URL';

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, user, primaryColor }) => {
  const [activeTab, setActiveTab] = useState<Tab>('SEARCH');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const t = (key: any) => getTranslation(user.apiKey ? 'EN' : 'ES', key); // Language based on API key availability for guest vs real mode

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  if (!isOpen) return null;
  const currentApiKey = user.apiKey;

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // SMART SEARCH: Detect URL
    const potentialPlaylistId = extractPlaylistId(searchQuery);
    const potentialVideoId = extractVideoId(searchQuery);

    if (potentialPlaylistId && currentApiKey) {
        setIsLoading(true);
        setLoadingMessage(t('fetchingPlaylist'));
        try {
            const songs = await fetchPlaylistItems(potentialPlaylistId, currentApiKey);
            if (songs.length > 0) {
                onImport(songs);
                onClose();
            } else {
                setError("No songs found in playlist or invalid key.");
            }
        } catch(e) { setError("Failed to load playlist."); }
        finally { setIsLoading(false); }
        return;
    }

    if (potentialVideoId) {
        setIsLoading(true);
        setLoadingMessage(t('linkDetected'));
        setError(null);
        try {
            const metadata = await fetchVideoMetadata(potentialVideoId, currentApiKey);
            if (metadata) {
                onImport([metadata]);
                onClose();
            } else { setError(t('couldNotLoadDetails')); }
        } catch (err) { setError(t('failedToImportLink')); } 
        finally { setIsLoading(false); }
        return;
    }

    setIsLoading(true);
    setLoadingMessage(currentApiKey ? t('searchingYoutube') : t('searchingMock'));
    setError(null);
    setSearchResults([]);

    try {
      const results = await searchYouTube(searchQuery, currentApiKey);
      setSearchResults(results);
      if (results.length === 0) setError(t('noResults'));
    } catch (err) {
      setError(t('searchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSearchResult = (song: Song) => {
    onImport([song]);
    onClose();
  };

  const handleYoutubeUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = String(formData.get('url') || '').trim();
    if (!url) return;

    // Check Playlist
    const playlistId = extractPlaylistId(url);
    if (playlistId && currentApiKey) {
        setIsLoading(true);
        setLoadingMessage(t('fetchingPlaylist'));
        try {
            const songs = await fetchPlaylistItems(playlistId, currentApiKey);
            if (songs.length > 0) {
                onImport(songs);
                onClose();
                return;
            }
        } catch(e) {}
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError(t('invalidYoutubeUrl'));
      return;
    }

    setIsLoading(true);
    setLoadingMessage(t('fetchingDetails'));
    setError(null);
    
    try {
      const metadata = await fetchVideoMetadata(videoId, currentApiKey);
      if (metadata) {
        onImport([metadata]);
        onClose();
      } else {
        setError(t('couldNotLoadDetails'));
      }
    } catch (err) {
      setError(t('failedToImport'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[28px] sm:rounded-[28px] bg-[#2B2930] shadow-2xl elevation-3 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        <div className="px-6 pt-6 pb-2 text-center relative">
            <div className="w-12 h-1.5 bg-[#49454F] rounded-full mx-auto mb-4 sm:hidden"></div>
            <h2 className="text-2xl font-normal text-[#E6E0E9]">{t('addMusic')}</h2>
        </div>

        <div className="flex px-4 border-b border-[#49454F]">
            {['SEARCH', 'URL'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab as Tab); setError(null); }}
                    className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-[#CAC4D0]'}`}
                >
                    {t(tab.toLowerCase())}
                </button>
            ))}
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'SEARCH' && (
                 <div className="flex flex-col gap-4">
                     <form onSubmit={handleSearchSubmit} className="flex gap-2">
                        <input 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setError(null); }}
                            type="text" 
                            placeholder={currentApiKey ? t('searchYoutube') : t('searchMockPlaceholder')}
                            className="flex-1 bg-[#141218] border border-[#938F99] rounded-full px-4 py-3 text-[#E6E0E9] outline-none focus:border-primary" 
                            autoFocus 
                        />
                        <button type="submit" disabled={isLoading} className="bg-primary text-on-primary rounded-full px-5 font-medium hover:opacity-90 flex items-center justify-center">
                            {isLoading ? <span className="material-symbols-rounded animate-spin">refresh</span> : t('go')}
                        </button>
                     </form>
                     
                     <div className="flex flex-col gap-2 mt-2">
                        {isLoading && <p className="text-center text-[#CAC4D0] animate-pulse">{loadingMessage}</p>}
                        {searchResults.map((song) => (
                            <div key={song.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#E6E0E9]/5 group active:bg-[#E6E0E9]/10">
                                <img src={song.thumbnailUrl} className="w-16 h-10 object-cover rounded-md bg-[#49454F]" alt="" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#E6E0E9] text-sm font-medium truncate">{song.title}</p>
                                    <p className="text-[#CAC4D0] text-xs truncate">{song.artist}</p>
                                </div>
                                <button onClick={() => handleAddSearchResult(song)} className="p-2 text-primary hover:bg-primary/10 rounded-full">
                                    <span className="material-symbols-rounded">add_circle</span>
                                </button>
                            </div>
                        ))}
                     </div>
                 </div>
            )}

            {activeTab === 'URL' && (
                 <form onSubmit={handleYoutubeUrlSubmit} className="flex flex-col gap-4">
                    <p className="text-[#CAC4D0] text-sm mb-2">{t('pasteYoutubeLink')}</p>
                     <div className="group relative">
                         <input 
                            name="url" 
                            type="url" 
                            placeholder="https://youtu.be/..." 
                            className="w-full bg-[#141218] border border-[#938F99] rounded-[4px] px-4 py-3 text-[#E6E0E9] outline-none focus:border-primary" 
                            onChange={() => setError(null)}
                         />
                     </div>
                     <button type="submit" disabled={isLoading} className="self-end px-6 py-2 rounded-full bg-primary text-on-primary text-sm font-medium disabled:opacity-50 mt-2">
                        {isLoading ? t('loading') : t('import')}
                     </button>
                 </form>
            )}
        </div>
        
        <div className="px-6 pb-6 pt-4 border-t border-[#49454F] flex justify-between items-center bg-[#2B2930]">
            <span className="text-xs text-[#CAC4D0]">{t('guestMode')}</span>
            <button type="button" onClick={onClose} className="px-6 py-2 bg-[#49454F] rounded-full text-[#E6E0E9] text-sm font-medium hover:bg-[#5b5763]">{t('close')}</button>
        </div>

        {error && (
            <div className="bg-error text-error text-xs text-center p-2 animate-in slide-in-from-bottom-2">
                {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;