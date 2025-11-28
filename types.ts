export interface Song {
  id: string;
  videoId: string;
  url: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  addedAt: number;
  // AI Enhanced Metadata
  mood?: string;
  colorHex?: string;
  summary?: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // Current time in seconds
  volume: number; // 0-100
  isMuted: boolean;
  queue: Song[];
}

export enum PlaybackMode {
  NORMAL = 'NORMAL',
  SHUFFLE = 'SHUFFLE',
  REPEAT_ONE = 'REPEAT_ONE',
}

// Global window type for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}