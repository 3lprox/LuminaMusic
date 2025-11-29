
export const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // 1. Recursive Decode (handles double encoded URLs or redirect params)
  let decodedUrl = url;
  try {
    // Try decoding up to 3 times to unwrap deeply nested URLs
    for(let i=0; i<3; i++) {
        if (decodedUrl.indexOf('%') === -1) break;
        decodedUrl = decodeURIComponent(decodedUrl);
    }
  } catch (e) {
    // If decode fails, use what we have
  }

  // 2. Regex for YouTube IDs (11 characters)
  // Supports:
  // - m.youtube.com (Mobile)
  // - music.youtube.com
  // - www.youtube.com
  // - youtu.be
  // - /shorts/
  // - /embed/
  // - ?v=
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
  
  // Split by whitespace/newlines/commas to handle various list formats
  const tokens = text.split(/[\s\n,]+/);
  
  for (const token of tokens) {
      const id = extractVideoId(token);
      if (id) ids.add(id);
  }
  
  return Array.from(ids);
};
