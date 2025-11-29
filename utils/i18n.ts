
import { Language } from '../types';

export const TRANSLATIONS = {
  EN: {
    bannerTitle: "We are moving to Netlify",
    bannerText: "The new URL is",
    bannerIgnore: "(Ignore this message if you are on mobile or already on Netlify)",
    downloadData: "Download Data",
    importData: "Import Data",
    libraryTitle: "Your Library",
    tracks: "tracks",
    clearAll: "Clear All",
    addTracks: "Add Tracks",
    settings: "Settings",
    audioQuality: "Audio Quality",
    language: "Language",
    syncing: "Syncing your library...",
    guestSearch: "Search to add songs or paste a URL.",
    userSync: "Syncing your library or add new tracks.",
    dataImported: "Library imported successfully!",
    invalidFile: "Invalid file format.",
    confirmClear: "Are you sure you want to delete all songs from your library?"
  },
  ES: {
    bannerTitle: "Nos estamos moviendo a Netlify",
    bannerText: "La nueva URL es",
    bannerIgnore: "(Ignora este mensaje si eres de móviles o ya estás en Netlify)",
    downloadData: "Descargar Datos",
    importData: "Importar Datos",
    libraryTitle: "Tu Biblioteca",
    tracks: "pistas",
    clearAll: "Borrar Todo",
    addTracks: "Añadir Pistas",
    settings: "Configuración",
    audioQuality: "Calidad de Audio",
    language: "Idioma",
    syncing: "Sincronizando tu biblioteca...",
    guestSearch: "Busca canciones o pega una URL.",
    userSync: "Sincronizando biblioteca o añade pistas.",
    dataImported: "¡Biblioteca importada con éxito!",
    invalidFile: "Formato de archivo inválido.",
    confirmClear: "¿Estás seguro de que quieres borrar todas las canciones?"
  }
};

export const getTranslation = (lang: Language, key: keyof typeof TRANSLATIONS['EN']) => {
  return TRANSLATIONS[lang][key] || TRANSLATIONS['EN'][key];
};
