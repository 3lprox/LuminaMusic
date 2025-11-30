

import { LyricLine, Song } from '../types'; // CORRECTED: Path to types.ts

export const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // 1. Recursive Decode
  let decodedUrl = url;
  try {
    for(let i=0; i<3; i++) {
        if (decodedUrl.indexOf('%') === -1) break;
        decodedUrl = decodeURIComponent(decodedUrl);
    }
  } catch (e) { }

  // 2. Regex for YouTube IDs
  const regExp = /(?:https?:\/\/)?(?:www\.|music\.|m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  
  const match = decodedUrl.match(regExp);
  return (match && match[1]) ? match[1] : null;
};

export const extractPlaylistId = (url: string): string | null => {
  if (!url) return null;
  let decodedUrl = url;
  try { decodedUrl = decodeURIComponent(url); } catch(e){}
  
  const regExp = /[?&]list=([a-zA-Z0-9_-]+)/;
  const match = decodedUrl.match(regExp);
  return match ? match[1] : null;
}

export const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const extractVideoIdsFromText = (text: string): string[] => {
  const ids = new Set<string>();
  const tokens = text.split(/[\s\n,]+/);
  for (const token of tokens) {
      const id = extractVideoId(token);
      if (id) ids.add(id);
  }
  return Array.from(ids);
};

// Parse timestamps from description (e.g., "0:00 Intro")
export const parseLyricsFromDescription = (description: string): LyricLine[] => {
  const lines = description.split('\n');
  const lyrics: LyricLine[] = [];
  
  const timeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
        // Calculate seconds
        let seconds = 0;
        if (match[3]) { // H:M:S
            seconds = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
        } else { // M:S
            seconds = parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        
        // Clean text (remove timestamp)
        const text = line.replace(timeRegex, '').trim().replace(/^[-–—]\s*/, '');
        
        if (text.length > 0) {
            lyrics.push({
                start: seconds,
                end: seconds + 5, // Default duration until next line
                text: text
            });
        }
    }
  }
  
  // Fix 'end' times
  for(let i=0; i<lyrics.length-1; i++) {
      lyrics[i].end = lyrics[i+1].start;
  }
  
  return lyrics;
};