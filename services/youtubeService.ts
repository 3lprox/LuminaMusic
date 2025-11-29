

import { Song, LyricLine } from '../types';
import { getThumbnailUrl } from '../utils/youtubeUtils';

// --- MOCK DATA (For Guest Mode / Fallback) ---
// (Keeping existing mock data)
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
  // Fix: Enclosed " Pública, siempre confiable." within the text property.
  { "start": 34.35, "end": 35.50, "text": "donde apunta, acierta. Pública, siempre confiable." },
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
  // Fix: Enclosed " Pública, siempre confiable." within the text property.
  { "start": 108.20, "end": 109.50, "text": "La salamandra, la salamandra. Pública, siempre confiable." },
  { "start": 109.50, "end": 110.85, "text": "Quiere que le meta la salamandra y." },
  // Fix: Enclosed " Pública, siempre confiable." within the text property.
  { "start": 110.85, "end": 112.10, "text": "La salamandra y la salamandra. Pública, siempre confiable." },
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
  // --- TRUENO ---
  { id: 't-1', videoId: 'Z9Yg7iF6D8A', source: 'YOUTUBE', title: 'DANCE CRIP', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('Z9Yg7iF6D8A'), url: 'https://www.youtube.com/watch?v=Z9Yg7iF6D8A', duration: 173, addedAt: Date.now(), mood: 'Hip Hop', colorHex: '#1a1a1a' },
  { id: 't-2', videoId: 'xy11W2n_k-k', source: 'YOUTUBE', title: 'FEEL ME??', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('xy11W2n_k-k'), url: 'https://www.youtube.com/watch?v=xy11W2n_k-k', duration: 195, addedAt: Date.now(), mood: 'Hip Hop', colorHex: '#333' },
  { id: 't-3', videoId: 'q-f75_q1yGk', source: 'YOUTUBE', title: 'MAMICHULA', artist: 'Trueno, Nicki Nicole', thumbnailUrl: getThumbnailUrl('q-f75_q1yGk'), url: 'https://www.youtube.com/watch?v=q-f75_q1yGk', duration: 219, addedAt: Date.now(), mood: 'R&B', colorHex: '#4a148c' },
  { id: 't-4', videoId: 'J3hV4Gk8x_o', source: 'YOUTUBE', title: 'ATREVIDO', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('J3hV4Gk8x_o'), url: 'https://www.youtube.com/watch?v=J3hV4Gk8x_o', duration: 188, addedAt: Date.now(), mood: 'Trap', colorHex: '#b71c1c' },
  { id: 't-5', videoId: '688IBAmC_nE', source: 'YOUTUBE', title: 'QLQ', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('688IBAmC_nE'), url: 'https://www.youtube.com/watch?v=688IBAmC_nE', duration: 200, addedAt: Date.now(), mood: 'Trap', colorHex: '#212121' },
  { id: 't-6', videoId: 'gGZlXl6f1Hw', source: 'YOUTUBE', title: 'TIERRA ZANTA', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('gGZlXl6f1Hw'), url: 'https://www.youtube.com/watch?v=gGZlXl6f1Hw', duration: 245, addedAt: Date.now(), mood: 'Rap', colorHex: '#3e2723' },
  { id: 't-7', videoId: 'L-6X0y8x_5g', source: 'YOUTUBE', title: 'ARGENTINA', artist: 'Trueno, Nathy Peluso', thumbnailUrl: getThumbnailUrl('L-6X0y8x_5g'), url: 'https://www.youtube.com/watch?v=L-6X0y8x_5g', duration: 260, addedAt: Date.now(), mood: 'Rap', colorHex: '#01579b' },
  { id: 't-8', videoId: 'h8X-8x_5g', source: 'YOUTUBE', title: 'SOLO POR VOS', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('h8X-8x_5g'), url: 'https://www.youtube.com/watch?v=h8X-8x_5g', duration: 195, addedAt: Date.now(), mood: 'R&B', colorHex: '#880e4f' },
  { id: 't-9', videoId: 'm9X-9x_5g', source: 'YOUTUBE', title: 'DANGEROUS', artist: 'Trueno', thumbnailUrl: getThumbnailUrl('m9X-9x_5g'), url: 'https://www.youtube.com/watch?v=m9X-9x_5g', duration: 210, addedAt: Date.now(), mood: 'Trap', colorHex: '#000' },
  
  // --- DUKI ---
  { id: 'd-1', videoId: 'f0X-0x_5g', source: 'YOUTUBE', title: 'Goteo', artist: 'Duki', thumbnailUrl: getThumbnailUrl('f0X-0x_5g'), url: 'https://www.youtube.com/watch?v=f0X-0x_5g', duration: 175, addedAt: Date.now(), mood: 'Trap', colorHex: '#ff6f00' },
  { id: 'd-2', videoId: 'g1X-1x_5g', source: 'YOUTUBE', title: 'She Don\'t Give a FO', artist: 'Duki, Khea', thumbnailUrl: getThumbnailUrl('g1X-1x_5g'), url: 'https://www.youtube.com/watch?v=g1X-1x_5g', duration: 210, addedAt: Date.now(), mood: 'Trap', colorHex: '#d50000' },
  { id: 'd-3', videoId: 'h2X-2x_5g', source: 'YOUTUBE', title: 'Rockstar', artist: 'Duki', thumbnailUrl: getThumbnailUrl('h2X-2x_5g'), url: 'https://www.youtube.com/watch?v=h2X-2x_5g', duration: 185, addedAt: Date.now(), mood: 'Trap', colorHex: '#1a237e' },
  { id: 'd-4', videoId: 'i3X-3x_5g', source: 'YOUTUBE', title: 'Givenchy', artist: 'Duki', thumbnailUrl: getThumbnailUrl('i3X-3x_5g'), url: 'https://www.youtube.com/watch?v=i3X-3x_5g', duration: 205, addedAt: Date.now(), mood: 'Trap', colorHex: '#212121' },
  { id: 'd-5', videoId: 'j4X-4x_5g', source: 'YOUTUBE', title: 'Malbec', artist: 'Duki, Bizarrap', thumbnailUrl: getThumbnailUrl('j4X-4x_5g'), url: 'https://www.youtube.com/watch?v=j4X-4x_5g', duration: 190, addedAt: Date.now(), mood: 'Trap', colorHex: '#4a148c' },
  { id: 'd-6', videoId: 'k5X-5x_5g', source: 'YOUTUBE', title: 'Antes de Perderte', artist: 'Duki', thumbnailUrl: getThumbnailUrl('k5X-5x_5g'), url: 'https://www.youtube.com/watch?v=k5X-5x_5g', duration: 195, addedAt: Date.now(), mood: 'Reggaeton', colorHex: '#004d40' },
  { id: 'd-7', videoId: 'l6X-6x_5g', source: 'YOUTUBE', title: 'Si Te Sentis Sola', artist: 'Duki', thumbnailUrl: getThumbnailUrl('l6X-6x_5g'), url: 'https://www.youtube.com/watch?v=l6X-6x_5g', duration: 188, addedAt: Date.now(), mood: 'Trap', colorHex: '#bf360c' },
  { id: 'd-8', videoId: 'm7X-7x_5g', source: 'YOUTUBE', title: 'Hitboy', artist: 'Duki, Khea', thumbnailUrl: getThumbnailUrl('m7X-7x_5g'), url: 'https://www.youtube.com/watch?v=m7X-7x_5g', duration: 192, addedAt: Date.now(), mood: 'Trap', colorHex: '#311b92' },
  { id: 'd-9', videoId: 'n8X-8x_5g', source: 'YOUTUBE', title: 'Hello Cotto', artist: 'Duki', thumbnailUrl: getThumbnailUrl('n8X-8x_5g'), url: 'https://www.youtube.com/watch?v=n8X-8x_5g', duration: 205, addedAt: Date.now(), mood: 'Trap', colorHex: '#1b5e20' },
  { id: 'd-10', videoId: 'o9X-9x_5g', source: 'YOUTUBE', title: 'Tumbando el Club (Remix)', artist: 'Neo Pistea, Duki, YSY A', thumbnailUrl: getThumbnailUrl('o9X-9x_5g'), url: 'https://www.youtube.com/watch?v=o9X-9x_5g', duration: 280, addedAt: Date.now(), mood: 'Trap', colorHex: '#b71c1c' },

  // --- YSY A ---
  { id: 'y-1', videoId: 'p0X-0x_5g', source: 'YOUTUBE', title: 'Tamo Loco', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('p0X-0x_5g'), url: 'https://www.youtube.com/watch?v=p0X-0x_5g', duration: 165, addedAt: Date.now(), mood: 'Trap', colorHex: '#f57f17' },
  { id: 'y-2', videoId: 'q1X-1x_5g', source: 'YOUTUBE', title: 'Casi un G', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('q1X-1x_5g'), url: 'https://www.youtube.com/watch?v=q1X-1x_5g', duration: 180, addedAt: Date.now(), mood: 'Trap', colorHex: '#4e342e' },
  { id: 'y-3', videoId: 'r2X-2x_5g', source: 'YOUTUBE', title: 'Pastel con Nutella', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('r2X-2x_5g'), url: 'https://www.youtube.com/watch?v=r2X-2x_5g', duration: 175, addedAt: Date.now(), mood: 'Trap', colorHex: '#5d4037' },
  { id: 'y-4', videoId: 's3X-3x_5g', source: 'YOUTUBE', title: 'Vamo a darle', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('s3X-3x_5g'), url: 'https://www.youtube.com/watch?v=s3X-3x_5g', duration: 190, addedAt: Date.now(), mood: 'Trap', colorHex: '#424242' },
  { id: 'y-5', videoId: 't4X-4x_5g', source: 'YOUTUBE', title: 'Hidro', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('t4X-4x_5g'), url: 'https://www.youtube.com/watch?v=t4X-4x_5g', duration: 185, addedAt: Date.now(), mood: 'Trap', colorHex: '#1a1a1a' },
  { id: 'y-6', videoId: 'u5X-5x_5g', source: 'YOUTUBE', title: 'Un Flow de Infarto', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('u5X-5x_5g'), url: 'https://www.youtube.com/watch?v=u5X-5x_5g', duration: 195, addedAt: Date.now(), mood: 'Trap', colorHex: '#ffeb3b' },
  { id: 'y-7', videoId: 'v6X-6x_5g', source: 'YOUTUBE', title: 'Silbando', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('v6X-6x_5g'), url: 'https://www.youtube.com/watch?v=v6X-6x_5g', duration: 188, addedAt: Date.now(), mood: 'Trap', colorHex: '#0277bd' },
  { id: 'y-8', videoId: 'w7X-7x_5g', source: 'YOUTUBE', title: 'Pintao', artist: 'YSY A, Duki, Rei', thumbnailUrl: getThumbnailUrl('w7X-7x_5g'), url: 'https://www.youtube.com/watch?v=w7X-7x_5g', duration: 210, addedAt: Date.now(), mood: 'Trap', colorHex: '#d81b60' },
  { id: 'y-9', videoId: 'x8X-8x_5g', source: 'YOUTUBE', title: 'Full Ice', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('x8X-8x_5g'), url: 'https://www.youtube.com/watch?v=x8X-8x_5g', duration: 180, addedAt: Date.now(), mood: 'Trap', colorHex: '#80deea' },
  { id: 'y-10', videoId: 'y9X-9x_5g', source: 'YOUTUBE', title: 'Trap de Verdad', artist: 'YSY A', thumbnailUrl: getThumbnailUrl('y9X-9x_5g'), url: 'https://www.youtube.com/watch?v=y9X-9x_5g', duration: 200, addedAt: Date.now(), mood: 'Trap', colorHex: '#ef6c00' },

  // --- GENERAL POPULAR ---
  { id: 'mock-2', videoId: 'jfKfPfyJRdk', source: 'YOUTUBE', title: 'Lo-Fi Girl Study Beats', artist: 'Lofi Girl', thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', duration: 3600, addedAt: Date.now(), mood: 'Chill', colorHex: '#6d8a96' },
  { id: 'mock-3', videoId: 'K4DyBUG242c', source: 'YOUTUBE', title: 'Cartoon - On & On', artist: 'NCS', thumbnailUrl: 'https://img.youtube.com/vi/K4DyBUG242c/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=K4DyBUG242c', duration: 208, addedAt: Date.now(), mood: 'Electronic', colorHex: '#E0B548' },
  { id: 'mock-4', videoId: '9bZkp7q19f0', source: 'YOUTUBE', title: 'Gangnam Style', artist: 'PSY', thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg', url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', duration: 252, addedAt: Date.now(), mood: 'K-Pop', colorHex: '#30689b' },
  { id: 'm-lat-1', videoId: 'h7U61Q74KmA', source: 'YOUTUBE', title: 'Me Porto Bonito', artist: 'Bad Bunny, Chencho', thumbnailUrl: getThumbnailUrl('h7U61Q74KmA'), url: 'https://www.youtube.com/watch?v=h7U61Q74KmA', duration: 178, addedAt: Date.now(), mood: 'Reggaeton', colorHex: '#9c27b0' },
  { id: 'm-lat-2', videoId: 'x815l2X8pA0', source: 'YOUTUBE', title: 'Ella Baila Sola', artist: 'Eslabon Armado, Peso Pluma', thumbnailUrl: getThumbnailUrl('x815l2X8pA0'), url: 'https://www.youtube.com/watch?v=x815l2X8pA0', duration: 195, addedAt: Date.now(), mood: 'Corridos', colorHex: '#795548' },
  { id: 'm-pop-1', videoId: 'fHI8X4OXluQ', source: 'YOUTUBE', title: 'Blinding Lights', artist: 'The Weeknd', thumbnailUrl: getThumbnailUrl('fHI8X4OXluQ'), url: 'https://www.youtube.com/watch?v=fHI8X4OXluQ', duration: 200, addedAt: Date.now(), mood: 'Synth Pop', colorHex: '#d32f2f' },
  { id: 'm-pop-2', videoId: '09R8_2nJtjg', source: 'YOUTUBE', title: 'Sugar', artist: 'Maroon 5', thumbnailUrl: getThumbnailUrl('09R8_2nJtjg'), url: 'https://www.youtube.com/watch?v=09R8_2nJtjg', duration: 235, addedAt: Date.now(), mood: 'Pop', colorHex: '#e91e63' },
  { id: 'm-rock-1', videoId: 'bpOSxM0rNPM', source: 'YOUTUBE', title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', thumbnailUrl: getThumbnailUrl('bpOSxM0rNPM'), url: 'https://www.youtube.com/watch?v=bpOSxM0rNPM', duration: 265, addedAt: Date.now(), mood: 'Indie Rock', colorHex: '#212121' },
  { id: 'm-elec-1', videoId: 'bM7SZ5SBzyY', source: 'YOUTUBE', title: 'Alan Walker - Faded', artist: 'Alan Walker', thumbnailUrl: getThumbnailUrl('bM7SZ5SBzyY'), url: 'https://www.youtube.com/watch?v=bM7SZ5SBzyY', duration: 212, addedAt: Date.now(), mood: 'Electronic', colorHex: '#00bcd4' },
];

// --- API FUNCTIONS ---

export const searchYouTube = async (query: string, apiKey?: string): Promise<Song[]> => {
  // 1. REAL API SEARCH (API Key)
  if (apiKey) {
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`);

        if (!res.ok) throw new Error("Search Failed");

        const data = await res.json();
        
        // Fetch durations
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`);
        const detailsData = await detailsRes.json();
        
        return detailsData.items.map((item: any) => mapYouTubeItemToSong(item));
    } catch (e) {
        console.error("YouTube API Search Error:", e);
        // Fallback to mock on error
    }
  }

  // 2. MOCK/GUEST SEARCH (Fallback)
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
};

export const fetchVideoMetadata = async (videoId: string, apiKey?: string): Promise<Song | null> => {
  if (!videoId) return null;

  // Check Mock DB first
  const mockMatch = MOCK_DB.find(s => s.videoId === videoId);
  if (mockMatch) return mockMatch;

  // Real API
  if (apiKey) {
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            return mapYouTubeItemToSong(data.items[0]);
        }
      } catch (e) { console.error("YouTube API Fetch Metadata Error:", e); }
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
  } catch (e) { console.error("OEmbed Fetch Error:", e); }

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

// Helper to format ISO 8601 duration
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