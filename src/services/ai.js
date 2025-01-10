import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API with import.meta.env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateIdeaExpansion(ideaContent) {
    try {
      const prompt = `
        以下のアイデアを分析し、発展させてください：
        
        ${ideaContent}
        
        以下の形式で出力してください：
        1. 主要な洞察
        2. 改善提案
        3. 新しい方向性
        4. 潜在的な課題
        5. 次のステップ
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI生成エラー:', error);
      throw error;
    }
  }

  async generateCreativeSuggestions(context) {
    try {
      const prompt = `
        このコンテキストに基づいて、創造的な提案を生成してください：
        
        ${context}
        
        以下の観点から提案を行ってください：
        - 革新的なアプローチ
        - 異分野からの応用
        - ユーザー体験の向上
        - 技術的な実現可能性
        - 市場での差別化要因
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('提案生成エラー:', error);
      throw error;
    }
  }

  async analyzeUserFeedback(feedback) {
    try {
      const prompt = `
        以下のユーザーフィードバックを分析し、
        重要なインサイトと改善点を抽出してください：
        
        ${feedback}
        
        分析項目：
        - 主要な課題点
        - ユーザーニーズ
        - 改善の優先順位
        - 具体的な対応案
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('フィードバック分析エラー:', error);
      throw error;
    }
  }
}