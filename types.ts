

export interface User {
  username: string; // Will always be "Guest" or Discord Username
  apiKey?: string; // Optional YouTube Data API Key
  isGuest: boolean;
  discordUserId?: string;
  discordUsername?: string;
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
  isShuffled?: boolean;
}

export enum RepeatMode {
  NONE = 'NONE',
  ALL = 'ALL',
  ONE = 'ONE',
}

export interface PersistedState {
  queue: Song[];
  volume: number;
  repeatMode: RepeatMode;
  audioQuality: AudioQuality;
  language: Language;
  primaryColor: string; // New: Hex color for theme

  // Discord Integration
  discordClientId?: string; // New: To identify app for OAuth
  discordAccessToken?: string; // Stored for session
  discordUserId?: string; // New: To identify user for local storage
  discordUsername?: string; // New: For display

  // Power User Features
  customJs?: string;
  customCss?: string;
  discordWebhook?: string;
  customEndpoint?: string;
  forceHttps?: boolean;
  showStats?: boolean;
}

// Global window type for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}