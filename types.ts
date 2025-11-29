
export interface User {
  username: string; // Will always be "Guest" now
  apiKey?: string; // Optional YouTube Data API Key
  isGuest: boolean; // Will always be true
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
  lyricsOffset?: number; // Adjustment in seconds
}

export type AudioQuality = 'LOW' | 'NORMAL' | 'HIGH';
export type Language = 'EN' | 'ES';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // Current time in seconds
  volume: number; // 0-100
  isMuted: boolean;
  queue: Song[];
  repeatMode: RepeatMode;
  audioQuality: AudioQuality;
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
  }
}
