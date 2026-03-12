import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const predictPestRisk = async (data: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Predict pest risk for rice crops in Tamil Nadu based on these 15 parameters:
    1. Temperature: ${data.temperature}°C
    2. Humidity: ${data.humidity}%
    3. Rain in last 3 days: ${data.recentRain}
    4. Crop age: ${data.cropAge} days
    5. Growth stage: ${data.growthStage}
    6. Standing water: ${data.standingWater}
    7. Recent fertilizer: ${data.recentFertilizer}
    8. Yellow leaves: ${data.yellowLeaves}
    9. Holes in leaves: ${data.holesInLeaves}
    10. Folded/Rolled leaves: ${data.foldedLeaves}
    11. Small insects seen: ${data.smallInsects}
    12. Brown insects at base: ${data.brownInsectsBase}
    13. White heads in panicles: ${data.whiteHeads}
    14. Brown spots on leaves: ${data.brownSpots}
    15. Pesticide in last 10 days: ${data.recentPesticide}
    
    Provide risk levels (Low, Medium, High) for: Brown Planthopper, Rice Stem Borer, Leaf Folder, and Gall Midge.
    Also provide 3 specific prevention tips in both English and Tamil.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bphRisk: { type: Type.STRING },
          stemRisk: { type: Type.STRING },
          leafRisk: { type: Type.STRING },
          gallMidgeRisk: { type: Type.STRING },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          tipsTamil: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["bphRisk", "stemRisk", "leafRisk", "gallMidgeRisk", "tips", "tipsTamil"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const detectPestFromImage = async (base64Image: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } },
        { text: "Identify the pest in this rice crop image. Choose from: Brown Planthopper, Rice Stem Borer, Leaf Folder, or Healthy Rice Plant. Provide the name and a brief management advice." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pestName: { type: Type.STRING },
          advice: { type: Type.STRING }
        },
        required: ["pestName", "advice"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getChatResponse = async (message: string) => {
  const chat = ai.chats.create({
    model: "gemini-3.1-flash-lite-preview",
    config: {
      systemInstruction: "You are an expert agricultural assistant for rice farmers in Tamil Nadu. Respond in the language the user uses (English or Tamil). Provide practical, easy-to-follow advice on pest management, irrigation, and crop health. Keep responses concise and helpful."
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

export const generateSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};
