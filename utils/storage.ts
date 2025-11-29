
import { Song, RepeatMode, AudioQuality, Language, PersistedState } from '../types';

const STORAGE_KEY = 'lumina_music_state_v1';
const API_KEY_STORAGE_KEY = 'lumina_youtube_api_key';

// Simplified user storage to just save/load API key
export const saveApiKey = (apiKey: string | undefined) => {
  if (apiKey) {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
};

export const loadApiKey = (): string | undefined => {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || undefined;
};


export const saveState = (
  queue: Song[], 
  volume: number, 
  repeatMode: RepeatMode, 
  audioQuality: AudioQuality, 
  language: Language,
  customJs?: string,
  customCss?: string,
  discordWebhook?: string,
  customEndpoint?: string,
  forceHttps?: boolean,
  showStats?: boolean
) => {
  try {
    const data: PersistedState = {
      queue: queue,
      volume,
      repeatMode,
      audioQuality,
      language,
      customJs,
      customCss,
      discordWebhook,
      customEndpoint,
      forceHttps,
      showStats
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const loadState = (): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", e);
    return {};
  }
};
