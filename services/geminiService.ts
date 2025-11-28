import { Song } from '../types';

// Interfaces for API Responses
interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { high: { url: string }, default: { url: string } };
  };
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { maxres?: { url: string }, high: { url: string }, medium?: { url: string } };
  };
}

// Fallback Mock Data (Simulating a dataset for Guests)
const MOCK_DB: Song[] = [
  { id: 'm1', source: 'YOUTUBE', videoId: 'jfKfPfyJRdk', url: 'https://youtube.com/watch?v=jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', artist: 'Lofi Girl', thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg', duration: 0, addedAt: Date.now(), mood: 'Lofi', colorHex: '#6d5c56' },
  { id: 'm2', source: 'YOUTUBE', videoId: '5qap5aO4i9A', url: 'https://youtube.com/watch?v=5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to', artist: 'Lofi Girl', thumbnailUrl: 'https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg', duration: 0, addedAt: Date.now(), mood: 'Lofi', colorHex: '#3d3c56' },
  { id: 'm3', source: 'YOUTUBE', videoId: 'bM7SZ5SBzyY', url: 'https://youtube.com/watch?v=bM7SZ5SBzyY', title: 'Alan Walker - Fade [NCS Release]', artist: 'NoCopyrightSounds', thumbnailUrl: 'https://img.youtube.com/vi/bM7SZ5SBzyY/maxresdefault.jpg', duration: 260, addedAt: Date.now(), mood: 'NCS', colorHex: '#8cb0c4' },
  { id: 'm4', source: 'YOUTUBE', videoId: 'K4DyBUG242c', url: 'https://youtube.com/watch?v=K4DyBUG242c', title: 'Cartoon - On & On (feat. Daniel Levi) [NCS Release]', artist: 'NoCopyrightSounds', thumbnailUrl: 'https://img.youtube.com/vi/K4DyBUG242c/maxresdefault.jpg', duration: 208, addedAt: Date.now(), mood: 'NCS', colorHex: '#a0a0a0' },
  { id: 'm5', source: 'YOUTUBE', videoId: '4Tr0otuiQuU', url: 'https://youtube.com/watch?v=4Tr0otuiQuU', title: 'Beethoven - Moonlight Sonata (Full)', artist: 'Classical Music', thumbnailUrl: 'https://img.youtube.com/vi/4Tr0otuiQuU/maxresdefault.jpg', duration: 900, addedAt: Date.now(), mood: 'Classical', colorHex: '#2b2930' },
  { id: 'm6', source: 'YOUTUBE', videoId: '5qx7yNRvw9c', url: 'https://youtube.com/watch?v=5qx7yNRvw9c', title: 'Earth, Wind & Fire - September', artist: 'Earth, Wind & Fire', thumbnailUrl: 'https://img.youtube.com/vi/5qx7yNRvw9c/maxresdefault.jpg', duration: 216, addedAt: Date.now(), mood: 'Disco', colorHex: '#b3404a' },
  { id: 'm7', source: 'YOUTUBE', videoId: 'dQw4w9WgXcQ', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', artist: 'Rick Astley', thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', duration: 212, addedAt: Date.now(), mood: 'Pop', colorHex: '#c48b6c' },
];

const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = (parseInt(match[1] || '0') || 0);
  const minutes = (parseInt(match[2] || '0') || 0);
  const seconds = (parseInt(match[3] || '0') || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Sync Library: Fetches user's "Liked Videos" playlist
 */
export const fetchUserLikedVideos = async (accessToken: string): Promise<Song[]> => {
  if (!accessToken) return [];

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&myRating=like&maxResults=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error("Sync Failed");

    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : item.id + Date.now(),
      source: 'YOUTUBE',
      videoId: item.id,
      url: `https://youtube.com/watch?v=${item.id}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      duration: parseDuration(item.contentDetails.duration),
      addedAt: Date.now(),
      mood: 'Liked',
      colorHex: '#D0BCFF'
    }));

  } catch (e) {
    console.error("Sync Error:", e);
    return [];
  }
};

/**
 * Searches YouTube (API or Fallback)
 */
export const searchYouTube = async (query: string, tokenOrKey?: string): Promise<Song[]> => {
  const q = query.toLowerCase();

  // FALLBACK MODE (Guest or No Token)
  if (!tokenOrKey) {
    // Smart Filter Mock DB
    return MOCK_DB.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.artist.toLowerCase().includes(q) ||
        s.mood?.toLowerCase().includes(q)
    );
  }

  // API MODE
  try {
    const isBearer = tokenOrKey.length > 50; // Simple heuristic for Bearer token vs API Key
    let searchUrl = '';
    const headers: any = {};

    if (isBearer) {
      searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video`;
      headers['Authorization'] = `Bearer ${tokenOrKey}`;
    } else {
      searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${tokenOrKey}`;
    }

    const searchRes = await fetch(searchUrl, { headers });
    
    if (!searchRes.ok) throw new Error("API Error");
    
    const searchData = await searchRes.json();
    if (!searchData.items || searchData.items.length === 0) return [];

    const videoIds = searchData.items.map((item: YouTubeSearchResult) => item.id.videoId).join(',');
    
    // Fetch Details
    let detailsUrl = '';
    if (isBearer) {
        detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}`;
    } else {
        detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${tokenOrKey}`;
    }

    const detailsRes = await fetch(detailsUrl, { headers });
    if (!detailsRes.ok) throw new Error("Details Error");
    const detailsData = await detailsRes.json();

    return detailsData.items.map((item: YouTubeVideoDetails) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : item.id + Date.now(),
      source: 'YOUTUBE',
      videoId: item.id,
      url: `https://youtube.com/watch?v=${item.id}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high.url,
      duration: parseDuration(item.contentDetails.duration),
      addedAt: Date.now(),
      mood: 'YouTube',
      colorHex: '#D0BCFF',
    }));

  } catch (error) {
    console.warn("YouTube API failed, falling back to local DB.", error);
    return MOCK_DB.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.artist.toLowerCase().includes(q)
    );
  }
};

export const fetchVideoMetadata = async (videoId: string, tokenOrKey?: string): Promise<Song | null> => {
   // 1. Check Mock DB first (Instant match)
   const mock = MOCK_DB.find(s => s.videoId === videoId);
   if (mock) return { ...mock, id: crypto.randomUUID() };

   // 2. If User has Token/Key, use Official API
   if (tokenOrKey) {
       try {
            const isBearer = tokenOrKey.length > 50;
            const headers: any = {};
            let detailsUrl = '';

            if (isBearer) {
                detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}`;
                headers['Authorization'] = `Bearer ${tokenOrKey}`;
            } else {
                detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${tokenOrKey}`;
            }

            const res = await fetch(detailsUrl, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data.items && data.items.length > 0) {
                    const item = data.items[0];
                    return {
                        id: crypto.randomUUID(),
                        source: 'YOUTUBE',
                        videoId: videoId,
                        url: `https://youtube.com/watch?v=${videoId}`,
                        title: item.snippet.title,
                        artist: item.snippet.channelTitle,
                        thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
                        duration: parseDuration(item.contentDetails.duration),
                        addedAt: Date.now(),
                        mood: 'Imported',
                        colorHex: '#D0BCFF'
                    };
                }
            }
       } catch (e) {
           console.warn("Metadata API fetch failed", e);
       }
   }

   // 3. Fallback: Try OEmbed (Public No-Auth method)
   // This works for Guests to get the Title/Thumbnail without an API Key
   try {
       const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
       const res = await fetch(oembedUrl);
       if (res.ok) {
           const data = await res.json();
           if (data.title) {
               return {
                   id: crypto.randomUUID(),
                   source: 'YOUTUBE',
                   videoId: videoId,
                   url: `https://youtube.com/watch?v=${videoId}`,
                   title: data.title,
                   artist: data.author_name || 'YouTube',
                   thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                   duration: 0, // OEmbed doesn't give duration, player will fix this on load
                   addedAt: Date.now(),
                   mood: 'Imported',
                   colorHex: '#D0BCFF'
               };
           }
       }
   } catch (e) {
       console.warn("OEmbed fetch failed", e);
   }

   // 4. Last Resort: Blind Import
   // The player will auto-update the metadata when it starts playing
   return {
        id: crypto.randomUUID(),
        source: 'YOUTUBE',
        videoId: videoId,
        url: `https://youtube.com/watch?v=${videoId}`,
        title: `Loading Video (${videoId})...`,
        artist: 'YouTube',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: 0,
        addedAt: Date.now(),
        mood: 'Unknown',
        colorHex: '#888'
   };
};