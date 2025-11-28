import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  try {
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
    
    throw new Error("Empty response from AI");

  } catch (error) {
    // Prevent "cyclic structure" errors by logging only the message or a safe string representation
    console.error("Gemini analysis failed:", error instanceof Error ? error.message : String(error));
    
    // Fallback data
    return {
      title: rawTitle,
      artist: "Unknown Artist",
      mood: "Unknown",
      colorHex: "#D0BCFF", // MD3 Primary default
      summary: "Imported from YouTube",
    };
  }
};