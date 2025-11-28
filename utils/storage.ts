import { Song, RepeatMode } from '../types';

const STORAGE_KEY = 'lumina_music_state_v1';

interface PersistedState {
  queue: Song[];
  volume: number;
  repeatMode: RepeatMode;
}

export const saveState = (queue: Song[], volume: number, repeatMode: RepeatMode) => {
  try {
    // Filter out LOCAL songs because File objects/Blob URLs cannot be persisted across sessions reliably
    const persistableQueue = queue.filter(s => s.source === 'YOUTUBE');
    
    const data: PersistedState = {
      queue: persistableQueue,
      volume,
      repeatMode
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