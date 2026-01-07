import { GoogleGenAI } from "@google/genai";
import { Branch, LiquidityStatus } from '../types';
import { STATUS_LABELS } from '../constants';

// Initialize Gemini Client
// IMPORTANT: In a real production app, never expose API keys on the client.
// This is for demonstration purposes within the requested architecture.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeLiquidity = async (branches: Branch[], city: string = 'Tripoli'): Promise<string> => {
  if (!apiKey) {
    return "عذراً، خدمة التحليل الذكي غير متوفرة حالياً (API Key missing).";
  }

  const prompt = `
    أنت محلل مالي ذكي لتطبيق "دليلي المصرفي" في ليبيا.
    لديك بيانات الفروع التالية في مدينة ${city}:
    ${JSON.stringify(branches.map(b => ({
      name: b.name,
      status: STATUS_LABELS[b.status],
      isAtm: b.isAtm,
      crowd: b.crowdLevel,
      lastUpdate: b.lastUpdate.toLocaleTimeString()
    })))}

    قم بتقديم ملخص قصير جداً (أقل من 50 كلمة) باللغة العربية حول وضع السيولة العام. 
    انصح المستخدم بأفضل مكان للذهاب إليه إذا أراد سحب نقود الآن.
    كن ودوداً ومباشراً.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "لم يتمكن النظام من تحليل البيانات حالياً.";
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "حدث خطأ أثناء الاتصال بالمحلل الذكي.";
  }
};