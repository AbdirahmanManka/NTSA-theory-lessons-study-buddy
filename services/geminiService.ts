import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

export const generateTopicContent = async (topicTitle: string): Promise<string> => {
  const prompt = `
    You are an expert Kenyan NTSA Driving Instructor.
    Create a study guide for the topic: "${topicTitle}".
    
    Requirements:
    1. STRICTLY summarized, short content. No long paragraphs.
    2. Use bullet points extensively.
    3. Highlight key terms in **bold**.
    4. Provide 2-3 real-world Kenyan driving examples (e.g., using Nairobi roads, matatus, local context).
    5. Tone: Beginner-friendly, encouraging, easy to skim.
    6. Structure:
       - 🎯 Quick Summary (1-2 sentences)
       - 🔑 Key Rules/Points (Bulleted list)
       - 🇰🇪 Kenyan Context Examples
       - ⚠️ Common Mistakes to Avoid

    Return the response in Markdown format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful, concise driving instructor.",
      }
    });
    return response.text || "Failed to load content. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content. Please check your connection.";
  }
};

export const chatWithInstructor = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: modelName,
      messages: history,
      config: {
        systemInstruction: `
          You are a Kenyan NTSA Driving Instructor AI. 
          Your goal is to help students pass their exams and drive safely in Kenya.
          
          RULES:
          1. IF the user asks about anything NOT related to driving, cars, traffic rules, or road safety, respond ONLY with: "Sorry, please ask about driving only."
          2. Keep answers SHORT and SUMMARIZED. Max 3-4 sentences unless a list is needed.
          3. Use simple English.
        `,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't catch that. Could you repeat?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I'm having trouble connecting to the server.";
  }
};

export const generateQuizQuestions = async (topic: string, difficulty: 'easy' | 'hard'): Promise<QuizQuestion[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
      },
      required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
      propertyOrdering: ['question', 'options', 'correctAnswerIndex', 'explanation']
    }
  };

  const prompt = `
    Generate 5 ${difficulty} multiple-choice questions about "${topic}" based on NTSA Kenya curriculum.
    Options should be short.
    Explanation should be 1 sentence.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    return [];
  }
};

export const searchTopics = async (query: string): Promise<string> => {
  const prompt = `
    Search query: "${query}" regarding Kenyan Driving Rules.
    Provide a direct, summarized answer with bullet points.
    Cite specific NTSA rules if applicable.
    Keep it under 150 words.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || "No results found.";
  } catch (error) {
    return "Search unavailable.";
  }
};