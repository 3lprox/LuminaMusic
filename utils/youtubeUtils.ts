export const extractVideoId = (url: string): string | null => {
  // Supports:
  // youtube.com/watch?v=ID
  // youtu.be/ID
  // youtube.com/shorts/ID
  // youtube.com/embed/ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Extracts all unique video IDs from a block of text (for playlist/batch import)
export const extractVideoIdsFromText = (text: string): string[] => {
  // Updated to include shorts in batch extraction
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  const matches = [...text.matchAll(regex)];
  // Return unique IDs
  return Array.from(new Set(matches.map(m => m[1])));
};