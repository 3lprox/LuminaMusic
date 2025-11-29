
export const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // 1. Decode URL (handles cases like watch%3Fv%3D...)
  let decodedUrl = url;
  try {
    decodedUrl = decodeURIComponent(url);
  } catch (e) {
    // If decode fails, use original
  }

  // 2. Handle YouTube Music, Shorts, Embeds, standard Watch, and Mobile (m.)
  // Regex looks for 11 char ID after specific prefixes
  // Added 'm.' to the subdomain group
  const regExp = /(?:https?:\/\/)?(?:www\.|music\.|m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  
  const match = decodedUrl.match(regExp);
  return (match && match[1]) ? match[1] : null;
};

export const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Extracts all unique video IDs from a block of text (for playlist/batch import)
export const extractVideoIdsFromText = (text: string): string[] => {
  const ids = new Set<string>();
  
  // Split by whitespace/newlines to handle each "word" as a potential URL
  const tokens = text.split(/[\s\n]+/);
  
  for (const token of tokens) {
      const id = extractVideoId(token);
      if (id) ids.add(id);
  }
  
  return Array.from(ids);
};
