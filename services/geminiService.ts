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
  // REQUESTED SONG
  { 
    id: 'm_trueno', 
    source: 'YOUTUBE', 
    videoId: 'LIlqmdzLHVQ', 
    url: 'https://youtube.com/watch?v=LIlqmdzLHVQ', 
    title: 'TRUENO - LA SALAMANDRA', 
    artist: 'Trueno', 
    thumbnailUrl: 'https://img.youtube.com/vi/LIlqmdzLHVQ/maxresdefault.jpg', 
    duration: 184, 
    addedAt: Date.now(), 
    mood: 'Urban', 
    colorHex: '#4a3b3b',
    lyrics: [
  { "start": 12.48, "end": 14.15, "text": "Me suena el teléfono, me llama Alejandra, ey," },
  { "start": 14.15, "end": 15.60, "text": "quiere que le meta la salamandra, mmh." },
  { "start": 15.60, "end": 16.55, "text": "Sabe que soy el que manda, hey," },
  { "start": 16.55, "end": 17.68, "text": "quiere que se la ponga de bufanda." },
  { "start": 17.68, "end": 18.99, "text": "La salamandra, la salamandra" },
  { "start": 18.99, "end": 20.25, "text": "quiere que le meta la salamandra." },
  { "start": 20.25, "end": 21.50, "text": "La salamandra, la salamandra" },
  { "start": 21.50, "end": 22.80, "text": "me llama para que le meta la salamandra." },
  { "start": 22.80, "end": 24.10, "text": "Y quiere que le meta la salamandra." },
  { "start": 24.10, "end": 25.50, "text": "Se camufla como un camaleón." },
  { "start": 25.50, "end": 26.50, "text": "Es la única que se alarga," },
  { "start": 26.50, "end": 27.85, "text": "dice que está en peligro de extinción." },
  { "start": 27.85, "end": 29.20, "text": "La sala, sala, salamán," },
  { "start": 29.20, "end": 30.30, "text": "la que muerde como un caimán." },
  { "start": 30.30, "end": 31.75, "text": "La sala, sala, salamán," },
  { "start": 31.75, "end": 33.10, "text": "esos lagartos no pueden hablar." },
  { "start": 33.10, "end": 34.35, "text": "La tengo ready y la tengo alerta," },
  { "start": 34.35, "end": 35.50, "text": "donde apunta, acierta." },
  { "start": 35.50, "end": 36.65, "text": "Cuando sola se despierta," },
  { "start": 36.65, "end": 38.05, "text": "deja todas las iguanas muertas." },
  { "start": 38.05, "end": 39.40, "text": "Quieren observarla de cerca," },
  { "start": 39.40, "end": 40.75, "text": "si la salamandra se concentra," },
  { "start": 40.75, "end": 42.10, "text": "que el león se vaya a la mierda." },
  { "start": 42.10, "end": 43.30, "text": "Mi salamandra es la reina de la selva." },
  { "start": 43.30, "end": 44.80, "text": "Quieren la salamandra de postre, ah," },
  { "start": 44.80, "end": 46.10, "text": "tiene club de fans que se compran sus pósters, yeah." },
  { "start": 46.10, "end": 47.30, "text": "Mami, mejor no te enrosques," },
  { "start": 47.30, "end": 48.60, "text": "que anda de caza ya por el bosque." },
  { "start": 48.60, "end": 50.00, "text": "Hace que se saquen el sostén," },
  { "start": 50.00, "end": 51.45, "text": "especialista en que gocen." },
  { "start": 51.45, "end": 52.88, "text": "Mi salamandra se come al cocodrilo de Lacoste." },
  { "start": 52.88, "end": 54.45, "text": "Me suena el teléfono, me llama Alejandra, ey." },
  { "start": 54.45, "end": 55.90, "text": "Quiere que le meta la salamandra, mm." },
  { "start": 55.90, "end": 56.85, "text": "Sabe que soy el que manda, hey." },
  { "start": 56.85, "end": 58.00, "text": "Quiere que se la ponga de bufanda." },
  { "start": 58.00, "end": 59.35, "text": "La salamandra, la salamandra" },
  { "start": 59.35, "end": 60.55, "text": "quiere que le meta la salamandra." },
  { "start": 60.55, "end": 61.85, "text": "La salamandra, la salamandra" },
  { "start": 61.85, "end": 63.30, "text": "me llama para que le meta la salamandra." },
  { "start": 63.30, "end": 65.10, "text": "Y sana, sana, colita de la rana," },
  { "start": 65.10, "end": 66.85, "text": "hoy la salamandra se despertó mala," },
  { "start": 66.85, "end": 68.45, "text": "con ganas de estar en la cueva encerrada," },
  { "start": 68.45, "end": 69.80, "text": "siempre protegida, chaleco antibalas." },
  { "start": 69.80, "end": 71.30, "text": "Es la mascota más solicitada," },
  { "start": 71.30, "end": 72.80, "text": "cuando la paseo la llaman," },
  { "start": 72.80, "end": 74.30, "text": "algunas la aman, otras la reclaman," },
  { "start": 74.30, "end": 75.80, "text": "pero quien la toca la deja enamorada." },
  { "start": 75.80, "end": 77.25, "text": "Y ella es sagrada, siempre está contenta." },
  { "start": 77.25, "end": 79.20, "text": "Es la bella durmiente, un beso y se despierta." },
  { "start": 79.20, "end": 80.60, "text": "Ella es sagrada, siempre está contenta." },
  { "start": 80.60, "end": 82.50, "text": "Es la bella durmiente, un beso y se despierta." },
  { "start": 82.50, "end": 84.00, "text": "La salamandra no falla, yeh." },
  { "start": 84.00, "end": 85.50, "text": "No tiene ropa de su talla, yeh." },
  { "start": 85.50, "end": 87.00, "text": "Las mujeres no se callan, mm." },
  { "start": 87.00, "end": 88.50, "text": "Hablan de ella donde vaya," },
  { "start": 88.50, "end": 90.00, "text": "la usan de fondo de pantalla." },
  { "start": 90.00, "end": 91.50, "text": "Es la sombra Grey de Sasha y" },
  { "start": 91.50, "end": 93.30, "text": "la salamandra vomita y se desmaya," },
  { "start": 93.30, "end": 94.70, "text": "pero al ratito vuelve para otra batalla." },
  { "start": 94.70, "end": 96.25, "text": "Me suena el teléfono, me llama Alejandra, he." },
  { "start": 96.25, "end": 97.60, "text": "Quiere que le meta la salamandra." },
  { "start": 97.60, "end": 99.00, "text": "La salamandra, la salamandra" },
  { "start": 99.00, "end": 100.25, "text": "quiere que le meta la salamandra." },
  { "start": 100.25, "end": 101.50, "text": "La salamandra, la salamandra" },
  { "start": 101.50, "end": 103.10, "text": "me llama para que le meta la salamandra." },
  { "start": 103.10, "end": 104.55, "text": "Ey, me suena el teléfono, me llama Alejandra y." },
  { "start": 104.55, "end": 106.00, "text": "Quiere que le meta la salamandra, uff." },
  { "start": 106.00, "end": 107.00, "text": "Sabe que soy el que manda." },
  { "start": 107.00, "end": 108.20, "text": "Quiere que se la ponga de bufanda." },
  { "start": 108.20, "end": 109.50, "text": "La salamandra, la salamandra." },
  { "start": 109.50, "end": 110.85, "text": "Quiere que le meta la salamandra y." },
  { "start": 110.85, "end": 112.10, "text": "La salamandra y la salamandra." },
  { "start": 112.10, "end": 115.00, "text": "me llama para que le meta la salaman." }
    ]
  },
  
  // LATIN / URBAN
  { id: 'm_bb1', source: 'YOUTUBE', videoId: 'h7UZ_BvI4eE', url: 'https://youtube.com/watch?v=h7UZ_BvI4eE', title: 'Bad Bunny - Monaco', artist: 'Bad Bunny', thumbnailUrl: 'https://img.youtube.com/vi/h7UZ_BvI4eE/maxresdefault.jpg', duration: 267, addedAt: Date.now(), mood: 'Urban', colorHex: '#3d3d3d' },
  { id: 'm_bza1', source: 'YOUTUBE', videoId: 'QKdZz8v_vQE', url: 'https://youtube.com/watch?v=QKdZz8v_vQE', title: 'BZRP Music Sessions #52', artist: 'Quevedo', thumbnailUrl: 'https://img.youtube.com/vi/QKdZz8v_vQE/maxresdefault.jpg', duration: 200, addedAt: Date.now(), mood: 'Urban', colorHex: '#1a237e' },

  // LOFI / CHILL
  { id: 'm1', source: 'YOUTUBE', videoId: 'jfKfPfyJRdk', url: 'https://youtube.com/watch?v=jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', artist: 'Lofi Girl', thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg', duration: 0, addedAt: Date.now(), mood: 'Lofi', colorHex: '#6d5c56' },
  { id: 'm2', source: 'YOUTUBE', videoId: '5qap5aO4i9A', url: 'https://youtube.com/watch?v=5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to', artist: 'Lofi Girl', thumbnailUrl: 'https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg', duration: 0, addedAt: Date.now(), mood: 'Lofi', colorHex: '#3d3c56' },
  
  // POP / HITS
  { id: 'm_wk1', source: 'YOUTUBE', videoId: '4NRXx6U8ABQ', url: 'https://youtube.com/watch?v=4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', thumbnailUrl: 'https://img.youtube.com/vi/4NRXx6U8ABQ/maxresdefault.jpg', duration: 200, addedAt: Date.now(), mood: 'Pop', colorHex: '#ff0000' },
  { id: 'm_wk2', source: 'YOUTUBE', videoId: 'fHI8X4OXluQ', url: 'https://youtube.com/watch?v=fHI8X4OXluQ', title: 'Save Your Tears', artist: 'The Weeknd', thumbnailUrl: 'https://img.youtube.com/vi/fHI8X4OXluQ/maxresdefault.jpg', duration: 215, addedAt: Date.now(), mood: 'Pop', colorHex: '#bf360c' },
  { id: 'm_ts1', source: 'YOUTUBE', videoId: 'K7HkM5C4e5Q', url: 'https://youtube.com/watch?v=K7HkM5C4e5Q', title: 'Anti-Hero', artist: 'Taylor Swift', thumbnailUrl: 'https://img.youtube.com/vi/K7HkM5C4e5Q/maxresdefault.jpg', duration: 200, addedAt: Date.now(), mood: 'Pop', colorHex: '#5d4037' },
  { id: 'm_du1', source: 'YOUTUBE', videoId: 'xwoJQKq6xN4', url: 'https://youtube.com/watch?v=xwoJQKq6xN4', title: 'Levitating', artist: 'Dua Lipa', thumbnailUrl: 'https://img.youtube.com/vi/xwoJQKq6xN4/maxresdefault.jpg', duration: 203, addedAt: Date.now(), mood: 'Pop', colorHex: '#1a1a1a' },

  // ROCK / CLASSIC
  { id: 'm_qn1', source: 'YOUTUBE', videoId: 'fJ9rUzIMcZQ', url: 'https://youtube.com/watch?v=fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg', duration: 355, addedAt: Date.now(), mood: 'Rock', colorHex: '#000000' },
  { id: 'm_am1', source: 'YOUTUBE', videoId: 'bpOSxM0rNPM', url: 'https://youtube.com/watch?v=bpOSxM0rNPM', title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', thumbnailUrl: 'https://img.youtube.com/vi/bpOSxM0rNPM/maxresdefault.jpg', duration: 265, addedAt: Date.now(), mood: 'Rock', colorHex: '#212121' },
  { id: 'm_nir1', source: 'YOUTUBE', videoId: 'hTWKbfoikeg', url: 'https://youtube.com/watch?v=hTWKbfoikeg', title: 'Smells Like Teen Spirit', artist: 'Nirvana', thumbnailUrl: 'https://img.youtube.com/vi/hTWKbfoikeg/maxresdefault.jpg', duration: 278, addedAt: Date.now(), mood: 'Rock', colorHex: '#37474f' },
  { id: 'm_lp1', source: 'YOUTUBE', videoId: 'kXYiU_JCYtU', url: 'https://youtube.com/watch?v=kXYiU_JCYtU', title: 'Numb', artist: 'Linkin Park', thumbnailUrl: 'https://img.youtube.com/vi/kXYiU_JCYtU/maxresdefault.jpg', duration: 187, addedAt: Date.now(), mood: 'Rock', colorHex: '#4e342e' },

  // ELECTRONIC / NCS
  { id: 'm3', source: 'YOUTUBE', videoId: 'bM7SZ5SBzyY', url: 'https://youtube.com/watch?v=bM7SZ5SBzyY', title: 'Alan Walker - Fade [NCS Release]', artist: 'NoCopyrightSounds', thumbnailUrl: 'https://img.youtube.com/vi/bM7SZ5SBzyY/maxresdefault.jpg', duration: 260, addedAt: Date.now(), mood: 'NCS', colorHex: '#8cb0c4' },
  { id: 'm4', source: 'YOUTUBE', videoId: 'K4DyBUG242c', url: 'https://youtube.com/watch?v=K4DyBUG242c', title: 'Cartoon - On & On (feat. Daniel Levi) [NCS Release]', artist: 'NoCopyrightSounds', thumbnailUrl: 'https://img.youtube.com/vi/K4DyBUG242c/maxresdefault.jpg', duration: 208, addedAt: Date.now(), mood: 'NCS', colorHex: '#a0a0a0' },
  { id: 'm_av1', source: 'YOUTUBE', videoId: 'IcrbM1l_BoI', url: 'https://youtube.com/watch?v=IcrbM1l_BoI', title: 'Wake Me Up', artist: 'Avicii', thumbnailUrl: 'https://img.youtube.com/vi/IcrbM1l_BoI/maxresdefault.jpg', duration: 247, addedAt: Date.now(), mood: 'Electronic', colorHex: '#f57f17' },
  { id: 'm_mg1', source: 'YOUTUBE', videoId: 'ALZHF5UqnU4', url: 'https://youtube.com/watch?v=ALZHF5UqnU4', title: 'Marshmello - Alone', artist: 'Marshmello', thumbnailUrl: 'https://img.youtube.com/vi/ALZHF5UqnU4/maxresdefault.jpg', duration: 199, addedAt: Date.now(), mood: 'Electronic', colorHex: '#ffffff' },

  // CLASSICAL / OTHERS
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
    // Returns results that match Title, Artist, Mood OR if the query is empty return shuffled subset
    const results = MOCK_DB.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.artist.toLowerCase().includes(q) ||
        s.mood?.toLowerCase().includes(q)
    );
    return results.length > 0 ? results : [];
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
    // Even if API fails, fallback to mock so app isn't broken
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