import { GoogleGenAI, Type } from "@google/genai";
import { PresentationData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePresentationFromTopic = async (topic: string, slideCount: number): Promise<PresentationData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Buat kerangka presentasi lengkap dalam Bahasa Indonesia berdasarkan topik: "${topic}".
Output harus dalam format JSON dan berisi:
1. Satu judul presentasi yang menarik dan profesional.
2. Konten untuk tepat ${slideCount} slide. Setiap slide harus memiliki judul yang singkat dan jelas, serta daftar poin-poin utama (bullet points).
Pastikan semua teks (judul presentasi, judul slide, dan poin-poin) sepenuhnya dalam Bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            presentationTitle: {
              type: Type.STRING,
              description: "The main title of the presentation in Indonesian."
            },
            slides: {
              type: Type.ARRAY,
              description: "An array of presentation slides in Indonesian.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The title of the slide in Indonesian."
                  },
                  points: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING
                    },
                    description: "An array of bullet points for the slide content in Indonesian."
                  }
                },
                required: ["title", "points"]
              }
            }
          },
          required: ["presentationTitle", "slides"]
        }
      }
    });

    const jsonResponse = JSON.parse(response.text);
    
    // Ensure the output adheres to the requested slide count from the prompt
    if (jsonResponse.slides && jsonResponse.slides.length > slideCount) {
      jsonResponse.slides = jsonResponse.slides.slice(0, slideCount);
    }

    return jsonResponse;
  } catch (error) {
    console.error("Error generating presentation from topic:", error);
    throw new Error("Gagal membuat presentasi. Silakan coba lagi.");
  }
};