
import { GoogleGenAI, Type } from "@google/genai";
import { ShowTheme } from "../types.ts";

export const generateShowTheme = async (prompt: string): Promise<ShowTheme> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a unique firework show theme based on this mood: "${prompt}". Provide technical parameters for a fireworks engine.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Poetic name of the theme" },
          description: { type: Type.STRING, description: "Short description of the visual vibe" },
          colors: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Hex color codes (e.g. #FF0000) that fit the theme" 
          },
          launchFrequency: { type: Type.NUMBER },
          particleCount: { type: Type.NUMBER },
          particleSize: { type: Type.NUMBER },
          explosionType: { 
            type: Type.STRING, 
            enum: ['standard', 'ring', 'heart', 'star']
          }
        },
        required: ["name", "description", "colors", "launchFrequency", "particleCount", "particleSize", "explosionType"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      name: "Stellar Default",
      description: "A classic display of light and color.",
      colors: ["#ffffff", "#ff0000", "#00ff00", "#0000ff"],
      launchFrequency: 0.05,
      particleCount: 100,
      particleSize: 2,
      explosionType: 'standard'
    };
  }
};
