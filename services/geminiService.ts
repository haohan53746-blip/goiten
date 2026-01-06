
import { GoogleGenAI } from "@google/genai";
import { Level } from "../types";
import { LEVEL_PROMPTS } from "../constants";

export const generateLuckyMessage = async (
  apiKey: string,
  studentName: string, 
  level: Level, 
  subject: string
): Promise<string> => {
  if (!apiKey) return "";
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Bạn là một trợ lý ảo phù thủy vui nhộn. 
  Nhiệm vụ: Tạo 1 lời chúc hoặc "thần chú" cực ngắn (tối đa 15 từ) cho học sinh "${studentName}" vừa được chọn trong môn "${subject}".
  Phong cách: ${LEVEL_PROMPTS[level]}. 
  Yêu cầu: Hài hước, tích cực, mang màu sắc phép thuật.
  Ví dụ: "Úm ba la! Chúc mừng phù thủy nhỏ [Tên] sẽ tỏa sáng rực rỡ!"
  Chỉ trả về nội dung câu dẫn, không thêm bất kỳ văn bản nào khác.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Error:", error);
    return "";
  }
};
