import { GoogleGenAI, Modality, Type } from "@google/genai";

// Centralized API Client Initialization
// In a production environment, these calls should be proxied through a backend (e.g., Firebase Functions)
// to strictly hide the API_KEY. For this implementation, we use the env variable as directed.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTextResponse = async (
    prompt: string, 
    model: string = 'gemini-2.5-flash',
    responseSchema?: any
): Promise<string> => {
    try {
        const ai = getClient();
        const config: any = {};
        
        if (responseSchema) {
            config.responseMimeType = "application/json";
            config.responseSchema = responseSchema;
        }

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
        });

        return response.text || '';
    } catch (error) {
        console.error("AI Text Generation Error:", error);
        throw error;
    }
};

export const generateSpeech = async (text: string, voiceName: string = 'Orus'): Promise<string | undefined> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });
        
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
        console.error("AI Speech Generation Error:", error);
        throw error;
    }
};
