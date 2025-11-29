
import { Song, LyricLine } from '../types';
import { getThumbnailUrl } from '../utils/youtubeUtils';

// --- MOCK DATA (For Guest Mode / Fallback) ---

const TRUENO_LYRICS: LyricLine[] = [
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
  { "start": 112.10, "end": 114.00, "text": "me llama para que le meta la salaman." }
];

const MOCK_DB: Song[] = [
  {
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
  },
  {
    id: 'mock-2',
    videoId: 'jfKfPfyJRdk',
    source: 'YOUTUBE',
    title: 'Lo-Fi Girl Study Beats',
    artist: 'Lofi Girl',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    duration: 3600,
    addedAt: Date.now(),
    mood: 'Chill',
    colorHex: '#6d8a96'
  },
  {
    id: 'mock-3',
    videoId: 'K4DyBUG242c',
    source: 'YOUTUBE',
    title: 'Cartoon - On & On',
    artist: 'NCS',
    thumbnailUrl: 'https://img.youtube.com/vi/K4DyBUG242c/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=K4DyBUG242c',
    duration: 208,
    addedAt: Date.now(),
    mood: 'Electronic',
    colorHex: '#E0B548'
  },
  {
    id: 'mock-4',
    videoId: '9bZkp7q19f0',
    source: 'YOUTUBE',
    title: 'Gangnam Style',
    artist: 'PSY',
    thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    duration: 252,
    addedAt: Date.now(),
    mood: 'K-Pop',
    colorHex: '#30689b'
  },
   // Latin / Reggaeton
  { id: 'm-lat-1', videoId: 'h7U61Q74KmA', source: 'YOUTUBE', title: 'Me Porto Bonito', artist: 'Bad Bunny, Chencho', thumbnailUrl: getThumbnailUrl('h7U61Q74KmA'), url: 'https://www.youtube.com/watch?v=h7U61Q74KmA', duration: 178, addedAt: Date.now(), mood: 'Reggaeton', colorHex: '#9c27b0' },
  { id: 'm-lat-2', videoId: 'x815l2X8pA0', source: 'YOUTUBE', title: 'Ella Baila Sola', artist: 'Eslabon Armado, Peso Pluma', thumbnailUrl: getThumbnailUrl('x815l2X8pA0'), url: 'https://www.youtube.com/watch?v=x815l2X8pA0', duration: 195, addedAt: Date.now(), mood: 'Corridos', colorHex: '#795548' },
  { id: 'm-lat-3', videoId: '688IBAmC_nE', source: 'YOUTUBE', title: 'QLQ', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('688IBAmC_nE'), url: 'https://www.youtube.com/watch?v=688IBAmC_nE', duration: 200, addedAt: Date.now(), mood: 'Trap', colorHex: '#212121' },

  // Pop / Mainstream
  { id: 'm-pop-1', videoId: 'fHI8X4OXluQ', source: 'YOUTUBE', title: 'Blinding Lights', artist: 'The Weeknd', thumbnailUrl: getThumbnailUrl('fHI8X4OXluQ'), url: 'https://www.youtube.com/watch?v=fHI8X4OXluQ', duration: 200, addedAt: Date.now(), mood: 'Synth Pop', colorHex: '#d32f2f' },
  { id: 'm-pop-2', videoId: '09R8_2nJtjg', source: 'YOUTUBE', title: 'Sugar', artist: 'Maroon 5', thumbnailUrl: getThumbnailUrl('09R8_2nJtjg'), url: 'https://www.youtube.com/watch?v=09R8_2nJtjg', duration: 235, addedAt: Date.now(), mood: 'Pop', colorHex: '#e91e63' },
  { id: 'm-pop-3', videoId: 'kJQP7kiw5Fk', source: 'YOUTUBE', title: 'Despacito', artist: 'Luis Fonsi', thumbnailUrl: getThumbnailUrl('kJQP7kiw5Fk'), url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', duration: 228, addedAt: Date.now(), mood: 'Latin Pop', colorHex: '#ff9800' },

  // Rock
  { id: 'm-rock-1', videoId: 'bpOSxM0rNPM', source: 'YOUTUBE', title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', thumbnailUrl: getThumbnailUrl('bpOSxM0rNPM'), url: 'https://www.youtube.com/watch?v=bpOSxM0rNPM', duration: 265, addedAt: Date.now(), mood: 'Indie Rock', colorHex: '#212121' },
  { id: 'm-rock-2', videoId: 'fJ9rUzIMcZQ', source: 'YOUTUBE', title: 'Bohemian Rhapsody', artist: 'Queen', thumbnailUrl: getThumbnailUrl('fJ9rUzIMcZQ'), url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', duration: 354, addedAt: Date.now(), mood: 'Classic Rock', colorHex: '#3f51b5' },

  // Electronic / NCS
  { id: 'm-elec-1', videoId: 'bM7SZ5SBzyY', source: 'YOUTUBE', title: 'Alan Walker - Faded', artist: 'Alan Walker', thumbnailUrl: getThumbnailUrl('bM7SZ5SBzyY'), url: 'https://www.youtube.com/watch?v=bM7SZ5SBzyY', duration: 212, addedAt: Date.now(), mood: 'Electronic', colorHex: '#00bcd4' },
  { id: 'm-elec-2', videoId: 'ALZHF5UqnU4', source: 'YOUTUBE', title: 'Marshmello - Alone', artist: 'Marshmello', thumbnailUrl: getThumbnailUrl('ALZHF5UqnU4'), url: 'https://www.youtube.com/watch?v=ALZHF5UqnU4', duration: 199, addedAt: Date.now(), mood: 'Electronic', colorHex: '#ffffff' },
];

// --- API FUNCTIONS ---

export const searchYouTube = async (query: string, accessToken?: string): Promise<Song[]> => {
  // 1. MOCK/GUEST SEARCH
  if (!accessToken) {
    const lowerQ = query.toLowerCase();
    
    // Filter Mock DB
    const results = MOCK_DB.filter(s => 
        s.title.toLowerCase().includes(lowerQ) || 
        s.artist.toLowerCase().includes(lowerQ) ||
        s.mood?.toLowerCase().includes(lowerQ)
    );

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    if (results.length > 0) return results;

    // Fallback: Return top 5 generic if no match
    return MOCK_DB.slice(0, 5);
  }

  // 2. REAL API SEARCH (OAuth)
  try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video`, {
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
          }
      });

      if (!res.ok) throw new Error("Search Failed");

      const data = await res.json();
      
      // We need to fetch durations in a second call
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const detailsData = await detailsRes.json();
      
      return detailsData.items.map((item: any) => mapYouTubeItemToSong(item));
  } catch (e) {
      console.error(e);
      // Fallback to mock on error
      return MOCK_DB.slice(0, 3);
  }
};

export const fetchVideoMetadata = async (videoId: string, accessToken?: string): Promise<Song | null> => {
  // Check Mock DB first (for lyrics support)
  const mockMatch = MOCK_DB.find(s => s.videoId === videoId);
  if (mockMatch) return mockMatch;

  // Real API
  if (accessToken) {
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            return mapYouTubeItemToSong(data.items[0]);
        }
      } catch (e) { console.error(e); }
  }

  // Fallback / Guest (OEmbed - No Key needed)
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
              duration: 0, // Duration unknown via OEmbed, will heal on play
              addedAt: Date.now(),
              mood: 'YouTube'
          };
      }
  } catch (e) {}

  // Last Resort: Blind Import
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

export const fetchUserLikedVideos = async (accessToken: string): Promise<Song[]> => {
    try {
        // Fetch Liked Videos Playlist
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&myRating=like&maxResults=50`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!res.ok) return [];
        
        const data = await res.json();
        return data.items.map((item: any) => mapYouTubeItemToSong(item));
    } catch (e) {
        console.error("Sync Error Try Again Later", e);
        return [];
    }
};

// Helper to format ISO 8601 duration (PT4M13S) to seconds
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
