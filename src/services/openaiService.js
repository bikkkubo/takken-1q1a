// OpenAI API Service for thinking process analysis

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class OpenAIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.isEnabled = !!this.apiKey;
  }

  async analyzeThinkingProcess(questionData, thinkingProcess, userAnswer, isCorrect) {
    if (!this.isEnabled) {
      // APIキーが設定されていない場合のモック応答
      return this.getMockAnalysis(questionData, thinkingProcess, userAnswer, isCorrect);
    }

    try {
      const prompt = this.createAnalysisPrompt(questionData, thinkingProcess, userAnswer, isCorrect);
      
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'あなたは宅建試験の学習支援AI です。受験生の思考プロセスを分析し、学習改善のためのフィードバックを提供します。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAnalysisResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getErrorAnalysis();
    }
  }

  createAnalysisPrompt(questionData, thinkingProcess, userAnswer, isCorrect) {
    const resultText = isCorrect ? '正解' : '不正解';
    const correctAnswer = questionData.result;
    
    return `
宅建試験問題の思考プロセス分析をお願いします。

【問題情報】
出題年: ${questionData.year}年
問題文: ${questionData.question}
正解: ${correctAnswer}
解説: ${questionData.explanation}

【受験生の回答】
思考プロセス: ${thinkingProcess}
選択した答え: ${userAnswer}
結果: ${resultText}

【分析してほしい内容】
1. 思考プロセスの正確性評価
2. 正しい思考の手順
3. 改善すべきポイント
4. ケアレスミス防止のアドバイス
5. 類似問題へのアプローチ方法

以下のJSON形式で回答してください：
{
  "accuracy_score": 0-100の数値,
  "strength_points": ["良かった点1", "良かった点2"],
  "improvement_points": ["改善点1", "改善点2"],
  "correct_approach": "正しい思考手順の説明",
  "mistake_analysis": "ミスの原因分析",
  "prevention_tips": ["防止策1", "防止策2"],
  "similar_questions": "類似問題へのアプローチ"
}
`;
  }

  parseAnalysisResponse(content) {
    try {
      // JSONの抽出を試みる
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // JSON形式でない場合の処理
      return {
        accuracy_score: 70,
        strength_points: ["思考プロセスが記録されています"],
        improvement_points: ["より詳細な分析が必要です"],
        correct_approach: content,
        mistake_analysis: "分析中...",
        prevention_tips: ["次回は詳細に記録してください"],
        similar_questions: "類似問題の分析を継続してください"
      };
    } catch (error) {
      console.error('Analysis parsing error:', error);
      return this.getErrorAnalysis();
    }
  }

  getMockAnalysis(questionData, thinkingProcess, userAnswer, isCorrect) {
    // APIキーがない場合のモック分析
    const mockAnalyses = {
      correct: {
        accuracy_score: 85,
        strength_points: [
          "問題文の要点を正確に把握できています",
          "法的根拠を考慮した論理的な思考です",
          "結論まで一貫した推理ができています"
        ],
        improvement_points: [
          "より具体的な条文や判例を思い出せると完璧です",
          "複数の解釈がある場合の検討も加えましょう"
        ],
        correct_approach: "問題文のキーワードを特定 → 関連法令の確認 → 具体的事例への適用 → 結論導出という手順が理想的です。",
        mistake_analysis: "正解していますが、思考プロセスをより体系化することで、難しい問題でも対応できるようになります。",
        prevention_tips: [
          "問題文に線を引いて重要部分をマークする",
          "「なぜ」を3回繰り返して根拠を深掘りする",
          "対立する解釈がないか常に確認する"
        ],
        similar_questions: "同じ分野の問題では、今回の思考パターンを基準として、例外規定や特別な場合にも注意を向けてください。"
      },
      incorrect: {
        accuracy_score: 45,
        strength_points: [
          "問題文を最後まで読んで理解しようとしています",
          "自分なりの理由付けを行っています"
        ],
        improvement_points: [
          "キーワードの意味を正確に理解する必要があります",
          "関連する法令知識の確認が不足しています",
          "結論を急がず、段階的に検討しましょう"
        ],
        correct_approach: "この問題では、まず問題文の「○○の場合」という条件を正確に把握し、該当する法令を思い出してから適用することが重要です。",
        mistake_analysis: "思考の方向性は良いですが、基礎知識の確認と、問題文の詳細な読み取りが不足していました。",
        prevention_tips: [
          "問題文のキーワードを確実に理解してから答える",
          "わからない用語は「知らない」と認識する",
          "消去法も使って確実性を高める",
          "時間をかけても正確性を優先する"
        ],
        similar_questions: "この分野の問題では、基本概念の正確な理解が最重要です。テキストで基礎を固めてから応用問題に取り組みましょう。"
      }
    };

    return isCorrect ? mockAnalyses.correct : mockAnalyses.incorrect;
  }

  getErrorAnalysis() {
    return {
      accuracy_score: 50,
      strength_points: ["思考プロセスを記録する習慣ができています"],
      improvement_points: ["分析機能に一時的な問題が発生しています"],
      correct_approach: "思考プロセスの記録を続けて、パターンを見つけましょう。",
      mistake_analysis: "現在分析できませんが、記録されたデータは保存されています。",
      prevention_tips: ["継続的な学習記録が重要です"],
      similar_questions: "類似問題での思考パターンを意識してください。"
    };
  }

  isAPIEnabled() {
    return this.isEnabled;
  }
}

const openAIService = new OpenAIService();
export default openAIService;