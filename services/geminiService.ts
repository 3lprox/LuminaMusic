import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization to prevent app crash on load if env vars are missing
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY is missing. AI features will be disabled.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const modelId = "gemini-2.5-flash";

export interface SongAnalysis {
  title: string;
  artist: string;
  mood: string;
  colorHex: string;
  summary: string;
}

/**
 * Analyzes a YouTube video title/info to extract clean metadata and "vibe" details.
 */
export const analyzeSongMetadata = async (rawTitle: string): Promise<SongAnalysis> => {
  // Fallback defaults
  const fallback: SongAnalysis = {
    title: rawTitle,
    artist: "Unknown Artist",
    mood: "Unknown",
    colorHex: "#D0BCFF",
    summary: "Imported from YouTube",
  };

  try {
    const ai = getAiClient();
    if (!ai) return fallback;

    const prompt = `
      Analyze this YouTube video title: "${rawTitle}".
      I need you to extract the likely Song Title and Artist.
      Also, infer the mood of the song (one or two words, e.g., "Upbeat Pop", "Melancholic Lo-fi").
      Suggest a dark, vibrant hex color code that fits the mood of this song (for UI background).
      Write a very short, one-sentence summary of what this song/video likely is.
      
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            mood: { type: Type.STRING },
            colorHex: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["title", "artist", "mood", "colorHex", "summary"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SongAnalysis;
    }
    
    return fallback;

  } catch (error) {
    console.error("Gemini analysis failed:", error instanceof Error ? error.message : String(error));
    return fallback;
  }
};