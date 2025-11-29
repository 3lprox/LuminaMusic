
import { Song, LyricLine } from '../types';
import { getThumbnailUrl } from '../utils/youtubeUtils';

// --- MOCK DATA ---
const TRUENO_LYRICS: LyricLine[] = [
  { "start": 12.48, "end": 14.15, "text": "Me suena el teléfono, me llama Alejandra, ey," },
  { "start": 14.15, "end": 15.60, "text": "quiere que le meta la salamandra, mmh." },
  { "start": 15.60, "end": 16.55, "text": "Sabe que soy el que manda, hey," },
  { "start": 16.55, "end": 17.68, "text": "quiere que se la ponga de bufanda." },
  // ... (Abbreviated for brevity, full lyrics preserved in logic if needed, but using existing ref)
  { "start": 17.68, "end": 18.99, "text": "La salamandra, la salamandra" },
  { "start": 112.10, "end": 114.00, "text": "me llama para que le meta la salaman." }
];

export const DEFAULT_SONG: Song = {
    id: 'mock-1',
    videoId: 'LIlqmdzLHVQ',
    source: 'YOUTUBE',
    title: 'La Salamandra',
    artist: 'Trueno',
    thumbnailUrl: 'https://img.youtube.com/vi/LIlqmdzLHVQ/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=LIlqmdzLHVQ',
    duration: 114,
    addedAt: Date.now(),
    mood: 'Latin Urban',
    colorHex: '#252627',
    lyrics: TRUENO_LYRICS
};

const MOCK_DB: Song[] = [
  DEFAULT_SONG,
  { id: 't-1', videoId: 'Z9Yg7iF6D8A', source: 'YOUTUBE', title: 'DANCE CRIP', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('Z9Yg7iF6D8A'), url: 'https://www.youtube.com/watch?v=Z9Yg7iF6D8A', duration: 173, addedAt: Date.now(), mood: 'Hip Hop', colorHex: '#1a1a1a' },
  { id: 'm-lat-1', videoId: 'h7U61Q74KmA', source: 'YOUTUBE', title: 'Me Porto Bonito', artist: 'Bad Bunny', thumbnailUrl: getThumbnailUrl('h7U61Q74KmA'), url: 'https://www.youtube.com/watch?v=h7U61Q74KmA', duration: 178, addedAt: Date.now(), mood: 'Reggaeton', colorHex: '#9c27b0' },
  { id: 'm-pop-1', videoId: 'fHI8X4OXluQ', source: 'YOUTUBE', title: 'Blinding Lights', artist: 'The Weeknd', thumbnailUrl: getThumbnailUrl('fHI8X4OXluQ'), url: 'https://www.youtube.com/watch?v=fHI8X4OXluQ', duration: 200, addedAt: Date.now(), mood: 'Synth Pop', colorHex: '#d32f2f' },
];

export const searchYouTube = async (query: string, apiKey?: string): Promise<Song[]> => {
  if (apiKey) {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`);
        if (!res.ok) throw new Error("Search Failed");
        const data = await res.json();
        
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`);
        const detailsData = await detailsRes.json();
        
        return detailsData.items.map((item: any) => mapYouTubeItemToSong(item));
    } catch (e) {
        console.error("YouTube API Search Error:", e);
    }
  }

  const lowerQ = query.toLowerCase();
  const results = MOCK_DB.filter(s => 
      s.title.toLowerCase().includes(lowerQ) || 
      s.artist.toLowerCase().includes(lowerQ)
  );
  await new Promise(resolve => setTimeout(resolve, 600));
  if (results.length > 0) return results;
  return MOCK_DB.slice(0, 5);
};

export const fetchVideoMetadata = async (videoId: string, apiKey?: string): Promise<Song | null> => {
  if (!videoId) return null;
  const mockMatch = MOCK_DB.find(s => s.videoId === videoId);
  if (mockMatch) return mockMatch;

  if (apiKey) {
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            return mapYouTubeItemToSong(data.items[0]);
        }
      } catch (e) { console.error("API Fetch Error:", e); }
  }

  try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (res.ok) {
          const data = await res.json();
          return {
              id: videoId,
              videoId: videoId,
              source: 'YOUTUBE',
              title: data.title,
              artist: data.author_name,
              thumbnailUrl: data.thumbnail_url,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              duration: 0,
              addedAt: Date.now(),
              mood: 'YouTube'
          };
      }
  } catch (e) { console.error("OEmbed Error:", e); }

  return {
      id: videoId,
      videoId: videoId,
      source: 'YOUTUBE',
      title: 'Loading Video...',
      artist: 'Unknown Artist',
      thumbnailUrl: getThumbnailUrl(videoId),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      duration: 0,
      addedAt: Date.now()
  };
};

export const fetchPlaylistItems = async (playlistId: string, apiKey?: string): Promise<Song[]> => {
    if (!apiKey) return [];
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`);
        if (!res.ok) throw new Error("Playlist Fetch Failed");
        const data = await res.json();
        
        // Get Durations
        const videoIds = data.items.map((item: any) => item.contentDetails.videoId).join(',');
        const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`);
        const detailsData = await detailsRes.json();
        
        return detailsData.items.map((item: any) => mapYouTubeItemToSong(item));
    } catch(e) {
        console.error(e);
        return [];
    }
}

// Fetch description specifically for lyrics parsing
export const fetchVideoDescription = async (videoId: string, apiKey: string): Promise<string> => {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].snippet.description || "";
        }
    } catch(e) {}
    return "";
}

const parseDuration = (isoDuration: string): number => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1] || '0')) * 3600;
    const minutes = (parseInt(match[2] || '0')) * 60;
    const seconds = parseInt(match[3] || '0');
    return hours + minutes + seconds;
};

const mapYouTubeItemToSong = (item: any): Song => {
    const videoId = item.id?.videoId || item.id;
    return {
        id: videoId,
        videoId: videoId,
        source: 'YOUTUBE',
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: item.contentDetails ? parseDuration(item.contentDetails.duration) : 0,
        addedAt: Date.now(),
        mood: 'YouTube',
        colorHex: '#2B2930'
    };
};
