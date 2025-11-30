


import { Song, RepeatMode, AudioQuality, Language, PersistedState } from '../types'; // CORRECTED: Path from utils/ to root/

const API_KEY_STORAGE_KEY = 'lumina_youtube_api_key';
const DISCORD_AUTH_STORAGE_KEY_PREFIX = 'lumina_discord_auth_';

// --- API Key Persistence ---
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

// --- Discord Auth Persistence (User-Specific) ---
export const saveDiscordAuth = (userId: string, username: string, accessToken: string, clientId: string) => {
  const authData = { userId, username, accessToken, clientId };
  localStorage.setItem(`${DISCORD_AUTH_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(authData));
};

export const loadDiscordAuth = (userId: string): { userId: string; username: string; accessToken: string; clientId: string } | null => {
  const raw = localStorage.getItem(`${DISCORD_AUTH_STORAGE_KEY_PREFIX}${userId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch(e) {
    console.error("Failed to parse Discord auth data", e);
    return null;
  }
};

export const removeDiscordAuth = (userId: string) => {
  localStorage.removeItem(`${DISCORD_AUTH_STORAGE_KEY_PREFIX}${userId}`);
};

// --- Main App State Persistence (User-Specific) ---
const getStorageKey = (discordUserId?: string) => {
  // Use a different key if Discord user is logged in
  return discordUserId ? `lumina_music_state_v1_${discordUserId}` : 'lumina_music_state_v1_guest';
};

export const saveState = (
  queue: Song[], 
  volume: number, 
  repeatMode: RepeatMode, 
  audioQuality: AudioQuality, 
  language: Language,
  primaryColor: string, // New
  discordClientId: string, // Store client ID used for auth
  discordAccessToken: string | undefined, // Store current access token
  discordUserId: string | undefined, // Store the connected user's ID
  discordUsername: string | undefined, // Store the connected user's username
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
      primaryColor, // New
      discordClientId, // New
      discordAccessToken, // New
      discordUserId, // New
      discordUsername, // New
      customJs,
      customCss,
      discordWebhook,
      customEndpoint,
      forceHttps,
      showStats
    };
    localStorage.setItem(getStorageKey(discordUserId), JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const loadState = (discordUserId?: string): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(getStorageKey(discordUserId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);

    // Ensure all new fields are present and have default values if loading an old state
    return {
        queue: parsed.queue || [],
        volume: parsed.volume !== undefined ? parsed.volume : 100,
        repeatMode: parsed.repeatMode || RepeatMode.NONE,
        audioQuality: parsed.audioQuality || 'NORMAL',
        language: parsed.language || 'EN', // Default to English
        primaryColor: parsed.primaryColor || '#D0BCFF', // Default Material Design Primary

        discordClientId: parsed.discordClientId || undefined,
        discordAccessToken: parsed.discordAccessToken || undefined,
        discordUserId: parsed.discordUserId || undefined,
        discordUsername: parsed.discordUsername || undefined,

        customJs: parsed.customJs || '',
        customCss: parsed.customCss || '',
        discordWebhook: parsed.discordWebhook || '',
        customEndpoint: parsed.customEndpoint || '',
        forceHttps: parsed.forceHttps !== undefined ? parsed.forceHttps : true,
        showStats: parsed.showStats !== undefined ? parsed.showStats : false,
    };
  } catch (e) {
    console.error("Failed to load state", e);
    return {};
  }
};