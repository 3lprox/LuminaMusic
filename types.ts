
export interface User {
  username: string;
  email?: string;
  picture?: string;
  accessToken?: string; // OAuth Token
  clientId?: string; // Stored for session
  isGuest?: boolean;
  apiKey?: string; // Deprecated/Optional
}

export interface LyricLine {
  start: number;
  end: number;
  text: string;
}

export interface Song {
  id: string;
  source: 'YOUTUBE'; // Fixed to YouTube
  videoId: string;
  
  url: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  addedAt: number;
  
  mood?: string;
  colorHex?: string;
  summary?: string;
  lyrics?: LyricLine[];
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // Current time in seconds
  volume: number; // 0-100
  isMuted: boolean;
  queue: Song[];
  repeatMode: RepeatMode;
}

export enum RepeatMode {
  NONE = 'NONE',
  ALL = 'ALL',
  ONE = 'ONE',
}

// Global window type for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    google: any; // GIS
  }
}
