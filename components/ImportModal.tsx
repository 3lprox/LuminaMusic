import React, { useState } from 'react';
import { extractVideoId } from '../utils/youtubeUtils';
import { analyzeSongMetadata } from '../services/geminiService';
import { Song } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (song: Song) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* MD3 Dialog Container */}
      <div className="w-full max-w-sm rounded-[28px] bg-[#2B2930] shadow-2xl elevation-3 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center">
            <span className="material-symbols-rounded text-[#E6E0E9] text-4xl mb-4">add_link</span>
            <h2 className="text-2xl font-normal text-[#E6E0E9]">Import Track</h2>
            <p className="text-[#CAC4D0] text-sm text-center mt-2">
                Paste a YouTube URL. Gemini will analyze the vibe and metadata.
            </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const url = String(formData.get('url') || ''); // Strict casting
            const titleInput = String(formData.get('title') || '');

            if (!url) return;

            const videoId = extractVideoId(url);
            if (!videoId) {
              setError("Please enter a valid YouTube URL");
              return;
            }

            setIsLoading(true);
            try {
              const analysis = await analyzeSongMetadata(titleInput || "Unknown YouTube Video");
              
              const newSong: Song = {
                id: crypto.randomUUID(),
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
              
              onImport(newSong);
              onClose();
            } catch (err) {
              setError("Failed to process track.");
            } finally {
              setIsLoading(false);
            }
          }}
          className="px-6 pb-6 flex flex-col gap-4"
        >
          {/* MD3 Outlined Text Field */}
          <div className="group relative">
            <div className="absolute top-0 left-0 w-full h-full rounded-[4px] pointer-events-none border border-[#938F99] group-focus-within:border-[#D0BCFF] group-focus-within:border-2 transition-all" />
            <input
                name="url"
                type="text"
                placeholder=" "
                className="w-full bg-transparent px-4 py-3 pt-4 text-[#E6E0E9] outline-none peer"
                autoFocus
            />
            <label className="absolute left-4 top-4 text-[#CAC4D0] text-base duration-200 transform -translate-y-0 scale-100 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-[#D0BCFF] peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-75 bg-[#2B2930] px-1 pointer-events-none">
                YouTube URL
            </label>
          </div>

          <div className="group relative">
             <div className="absolute top-0 left-0 w-full h-full rounded-[4px] pointer-events-none border border-[#938F99] group-focus-within:border-[#D0BCFF] group-focus-within:border-2 transition-all" />
            <input
              name="title"
              type="text"
              placeholder=" "
              className="w-full bg-transparent px-4 py-3 pt-4 text-[#E6E0E9] outline-none peer"
              required
            />
             <label className="absolute left-4 top-4 text-[#CAC4D0] text-base duration-200 transform -translate-y-0 scale-100 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-[#D0BCFF] peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-75 bg-[#2B2930] px-1 pointer-events-none">
                Track Title (Hint)
            </label>
          </div>

          {error && (
            <p className="text-[#FFB4AB] text-xs px-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-[#D0BCFF] font-medium text-sm hover:bg-[#D0BCFF]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-[#D0BCFF] text-[#381E72] font-medium text-sm hover:shadow-md disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Analyzing...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;