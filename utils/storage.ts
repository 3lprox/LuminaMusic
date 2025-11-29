
import { Song, RepeatMode, User, AudioQuality } from '../types';

const STORAGE_KEY = 'lumina_music_state_v1';
const USER_KEY = 'lumina_active_user';

interface PersistedState {
  queue: Song[];
  volume: number;
  repeatMode: RepeatMode;
  audioQuality: AudioQuality;
}

export const saveUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const loadUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveState = (queue: Song[], volume: number, repeatMode: RepeatMode, audioQuality: AudioQuality) => {
  try {
    const data: PersistedState = {
      queue: queue, // All songs are persistable now
      volume,
      repeatMode,
      audioQuality
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
