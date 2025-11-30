
import { Song, LyricLine } from '../types'; // CORRECTED: Path from services/ to root/
import { getThumbnailUrl, parseLyricsFromDescription } from '../utils/youtubeUtils'; // CORRECTED: Path from services/ to utils/

// --- MOCK DATA ---
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
  // Corrected: Removed extraneous character that was causing a syntax error.
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
  { id: 't-2', videoId: 'e20A-jW0Eho', source: 'YOUTUBE', title: 'TRUENO: BZRP Music Sessions #16', artist: 'Bizarrap & Trueno', thumbnailUrl: getThumbnailUrl('e20A-jW0Eho'), url: 'https://www.youtube.com/watch?v=e20A-jW0Eho', duration: 172, addedAt: Date.now(), mood: 'Freestyle', colorHex: '#000000' },
  { id: 'd-1', videoId: 'T7J2P7_W-9Q', source: 'YOUTUBE', title: 'GIVENCHY', artist: 'Duki', thumbnailUrl: getThumbnailUrl('T7J2P7_W-9Q'), url: 'https://www.youtube.com/watch?v=T7J2P7_W-9Q', duration: 195, addedAt: Date.now(), mood: 'Trap', colorHex: '#1e1e1e' },
  { id: 'd-2', videoId: 'tWb7y3jPjX0', source: 'YOUTUBE', title: 'SHE DONT GIVE A FO', artist: 'Duki', thumbnailUrl: getThumbnailUrl('tWb7y3jPjX0'), url: 'https://www.youtube.com/watch?v=tWb7y3jPjX0', duration: 219, addedAt: Date.now(), mood: 'Trap', colorHex: '#2f2f2f' },
  { id: 'y-1', videoId: 'fE6LzV_X30Q', source: 'YOUTUBE', title: 'Casi un G', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('fE6LzV_X30Q'), url: 'https://www.youtube.com/watch?v=fE6LzV_X30Q', duration: 180, addedAt: Date.now(), mood: 'Trap', colorHex: '#3b3b3b' },
  { id: 'y-2', videoId: 'Nlq-m1J5d-8', source: 'YOUTUBE', title: 'ANACONDA', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('Nlq-m1J5d-8'), url: 'https://www.youtube.com/watch?v=Nlq-m1J5d-8', duration: 220, addedAt: Date.now(), mood: 'Trap', colorHex: '#4d4d4d' },
  { id: 'm-rock-1', videoId: 'bpOSXPRM6gM', source: 'YOUTUBE', title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', thumbnailUrl: getThumbnailUrl('bpOSXPRM6gM'), url: 'https://www.youtube.com/watch?v=bpOSXPRM6gM', duration: 261, addedAt: Date.now(), mood: 'Indie Rock', colorHex: '#5f5f5f' },
  { id: 'm-clas-1', videoId: 'dQw4w9WgXcQ', source: 'YOUTUBE', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnailUrl: getThumbnailUrl('dQw4w9WgXcQ'), url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 212, addedAt: Date.now(), mood: 'Pop', colorHex: '#707070' },
  { id: 'm-elec-1', videoId: 'e-ORhEE9IAY', source: 'YOUTUBE', title: 'Faded', artist: 'Alan Walker', thumbnailUrl: getThumbnailUrl('e-ORhEE9IAY'), url: 'https://www.youtube.com/watch?v=e-ORhEE9IAY', duration: 212, addedAt: Date.now(), mood: 'EDM', colorHex: '#818181' },
  { id: 'y-3', videoId: '2b0_yWd7Bgw', source: 'YOUTUBE', title: 'PAREN DE FUMAR', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('2b0_yWd7Bgw'), url: 'https://www.youtube.com/watch?v=2b0_yWd7Bgw', duration: 160, addedAt: Date.now(), mood: 'Trap', colorHex: '#666666' },
  { id: 'd-3', videoId: 'xP2kFz4tE_Y', source: 'YOUTUBE', title: 'Antes de Ameri', artist: 'Duki', thumbnailUrl: getThumbnailUrl('xP2kFz4tE_Y'), url: 'https://www.youtube.com/watch?v=xP2kFz4tE_Y', duration: 200, addedAt: Date.now(), mood: 'Trap', colorHex: '#555555' },
  { id: 't-3', videoId: 'qQ3G0B3t70I', source: 'YOUTUBE', title: 'Panamá', artist: 'Trueno ft. Duki', thumbnailUrl: getThumbnailUrl('qQ3G0B3t70I'), url: 'https://www.youtube.com/watch?v=qQ3G0B3t70I', duration: 230, addedAt: Date.now(), mood: 'Hip Hop', colorHex: '#444444' },
  { id: 'd-4', videoId: 'HhWbK2K1548', source: 'YOUTUBE', title: 'GTA.mp4', artist: 'Duki', thumbnailUrl: getThumbnailUrl('HhWbK2K1548'), url: 'https://www.youtube.com/watch?v=HhWbK2K1548', duration: 180, addedAt: Date.now(), mood: 'Trap', colorHex: '#777777' },
  { id: 'y-4', videoId: 'Nlq-m1J5d-8', source: 'YOUTUBE', title: 'TODO ROTO', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('Nlq-m1J5d-8'), url: 'https://www.youtube.com/watch?v=Nlq-m1J5d-8', duration: 200, addedAt: Date.now(), mood: 'Trap', colorHex: '#888888' },
  { id: 't-4', videoId: '1_yTjE_fG7c', source: 'YOUTUBE', title: 'BIEN O MAL', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('1_yTjE_fG7c'), url: 'https://www.youtube.com/watch?v=1_yTjE_fG7c', duration: 220, addedAt: Date.now(), mood: 'Hip Hop', colorHex: '#999999' },
  { id: 'd-5', videoId: 'v8Jt7a8F-B4', source: 'YOUTUBE', title: 'Malbec', artist: 'Duki ft. Bizarrap', thumbnailUrl: getThumbnailUrl('v8Jt7a8F-B4'), url: 'https://www.youtube.com/watch?v=v8Jt7a8F-B4', duration: 160, addedAt: Date.now(), mood: 'Trap', colorHex: '#aaaaaa' },
  { id: 'y-5', videoId: '3G1vE8S0_x0', source: 'YOUTUBE', title: 'SALVAJE', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('3G1vE8S0_x0'), url: 'https://www.youtube.com/watch?v=3G1vE8S0_x0', duration: 190, addedAt: Date.now(), mood: 'Trap', colorHex: '#bbbbbb' },
  { id: 't-5', videoId: '2Fh5pC6fNkc', source: 'YOUTUBE', title: 'MAMICHULA', artist: 'Trueno ft. Nicki Nicole', thumbnailUrl: getThumbnailUrl('2Fh5pC6fNkc'), url: 'https://www.youtube.com/watch?v=2Fh5pC6fNkc', duration: 200, addedAt: Date.now(), mood: 'Hip Hop', colorHex: '#cccccc' },
  { id: 'd-6', videoId: 'X0oGfR6k7x0', source: 'YOUTUBE', title: 'Casablanca', artist: 'Duki', thumbnailUrl: getThumbnailUrl('X0oGfR6k7x0'), url: 'https://www.youtube.com/watch?v=X0oGfR6k7x0', duration: 210, addedAt: Date.now(), mood: 'Trap', colorHex: '#dddddd' },
  { id: 'y-6', videoId: 'eD4xYJk0m0k', source: 'YOUTUBE', title: 'MORDO', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('eD4xYJk0m0k'), url: 'https://www.youtube.com/watch?v=eD4xYJk0m0k', duration: 170, addedAt: Date.now(), mood: 'Trap', colorHex: '#eeeeee' },
  { id: 't-6', videoId: 'pP9f9J6L8_0', source: 'YOUTUBE', title: 'Atrevido', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('pP9f9J6L8_0'), url: 'https://www.youtube.com/watch?v=pP9f9J6L8_0', duration: 150, addedAt: Date.now(), mood: 'Hip Hop', colorHex: '#ffffff' }
];

export const searchYouTube = async (query: string, apiKey?: string): Promise<Song[]> => {
  if (apiKey) {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`);
        if (!res.ok) throw new Error("Search Failed");
        const data = await res.json();
        
        const videoIds = data.items.map((item: any) => item.id.videoId).filter((id: string) => id).join(',');
        if (!videoIds) return []; // No videos found
        
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
      s.artist.toLowerCase().includes(lowerQ) ||
      s.mood?.toLowerCase().includes(lowerQ)
  );
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
  if (results.length > 0) return results;
  return MOCK_DB.slice(0, 5); // Fallback to a few default mocks if nothing matches
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
              duration: 0, // Duration often not available via oEmbed
              addedAt: Date.now(),
              mood: 'YouTube'
          };
      }
  } catch (e) { console.error("OEmbed Error:", e); }

  return { // Fallback if all else fails
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
    if (!apiKey) return []; // Cannot fetch real playlists without API key
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`);
        if (!res.ok) throw new Error("Playlist Fetch Failed");
        const data = await res.json();
        
        // Get Durations
        const videoIds = data.items.map((item: any) => item.contentDetails.videoId).filter((id: string) => id).join(',');
        if (!videoIds) return []; // No videos in playlist or invalid IDs
        
        const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`);
        const detailsData = await detailsRes.json(); // Fixed await
        
        // Map items from detailsData to ensure duration is present
        const songs = data.items.map((playlistItem: any) => {
            const videoDetail = detailsData.items.find((detail: any) => detail.id === playlistItem.contentDetails.videoId);
            if (videoDetail) {
                return mapYouTubeItemToSong(videoDetail);
            }
            return null;
        }).filter((song: Song | null) => song !== null); // Filter out any null songs if details weren't found
        
        return songs as Song[];

    } catch(e) {
        console.error("YouTube API Playlist Error:", e);
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
    } catch(e) {
        console.error("Fetch description error:", e);
    }
    return "";
}

const parseDuration = (isoDuration: string): number => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1] || '0') * 3600);
    const minutes = (parseInt(match[2] || '0') * 60);
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
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${videoId}/default.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: item.contentDetails ? parseDuration(item.contentDetails.duration) : 0, // Fallback to 0 if contentDetails is missing
        addedAt: Date.now(),
        mood: 'YouTube',
        colorHex: '#2B2930' // Default color, can be updated dynamically
    };
};