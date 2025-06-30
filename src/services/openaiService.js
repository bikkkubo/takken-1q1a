// OpenAI API Service for thinking process analysis

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class OpenAIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.model = process.env.REACT_APP_OPENAI_MODEL || 'o3';
    this.isEnabled = !!this.apiKey;
    
    // デバッグログ
    console.log('OpenAI Service initialized:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      model: this.model,
      isEnabled: this.isEnabled
    });
  }

  async analyzeThinkingProcess(questionData, thinkingProcess, userAnswer, isCorrect) {
    // APIキーの存在チェック
    if (!this.isEnabled) {
      console.warn('OpenAI API disabled: No API key found');
      return this.getMockAnalysis(questionData, thinkingProcess, userAnswer, isCorrect);
    }

    // APIキーの形式チェック
    if (!this.apiKey.startsWith('sk-')) {
      console.error('OpenAI API key format invalid');
      return this.getErrorAnalysis();
    }

    console.log('Starting OpenAI API request:', {
      model: this.model,
      questionNumber: questionData.number,
      thinkingLength: thinkingProcess?.length || 0,
      userAnswer,
      isCorrect
    });

    try {
      const prompt = this.createAnalysisPrompt(questionData, thinkingProcess, userAnswer, isCorrect);
      
      const requestBody = {
        model: this.model,
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
      };

      console.log('OpenAI API request body:', {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        promptLength: prompt.length
      });
      
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('OpenAI API response status:', response.status, response.statusText);

      if (!response.ok) {
        // レスポンス詳細を取得
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch (e) {
          errorDetails = await response.text();
        }
        
        console.error('OpenAI API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          details: errorDetails
        });

        // 具体的なエラーメッセージを作成
        const errorMessage = this.createDetailedErrorMessage(response.status, errorDetails);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('OpenAI API success:', {
        usage: data.usage,
        model: data.model,
        responseLength: data.choices?.[0]?.message?.content?.length || 0
      });

      return this.parseAnalysisResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API Error:', {
        message: error.message,
        stack: error.stack,
        apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'missing',
        status: error.status || 'unknown'
      });
      return this.getErrorAnalysis();
    }
  }

  createDetailedErrorMessage(status, errorDetails) {
    switch (status) {
      case 401:
        return `API認証エラー (401): APIキーが無効です。Netlify環境変数を確認してください。`;
      case 404:
        return `モデルエラー (404): 指定されたモデル '${this.model}' が利用できません。`;
      case 429:
        return `レート制限エラー (429): APIの利用制限に達しました。しばらく待ってから再試行してください。`;
      case 500:
      case 502:
      case 503:
        return `OpenAIサーバーエラー (${status}): 一時的な問題です。しばらく待ってから再試行してください。`;
      default:
        return `API呼び出しエラー (${status}): ${errorDetails?.error?.message || 'Unknown error'}`;
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
2. 改善すべきポイント
3. ケアレスミス防止のアドバイス
4. 類似問題へのアプローチ方法

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
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          accuracy_score: parsed.accuracy_score || 70,
          strength_points: parsed.strength_points || ["思考プロセスが記録されています"],
          improvement_points: parsed.improvement_points || ["より詳細な分析が必要です"],
          correct_approach: parsed.correct_approach || "分析中...",
          mistake_analysis: parsed.mistake_analysis || "分析中...",
          prevention_tips: parsed.prevention_tips || ["次回は詳細に記録してください"],
          similar_questions: parsed.similar_questions || "類似問題の分析を継続してください"
        };
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
    // 実問題に基づいた動的モック分析
    const hasThinking = thinkingProcess && thinkingProcess.trim().length > 0;
    
    // 思考プロセスの質を評価
    const thinkingQuality = this.evaluateThinkingQuality(thinkingProcess, questionData);
    
    if (isCorrect) {
      return {
        accuracy_score: Math.min(95, 70 + (thinkingQuality * 25)),
        strength_points: this.generateStrengthPoints(questionData, thinkingProcess, true),
        improvement_points: this.generateImprovementPoints(questionData, thinkingProcess, true),
        correct_approach: this.generateCorrectApproach(questionData, true),
        mistake_analysis: hasThinking ? 
          "正解できていますが、思考プロセスをさらに充実させることで、より確実な解答力が身につきます。" :
          "正解していますが、思考プロセスを記録することで、論理的思考力をさらに伸ばせます。",
        prevention_tips: this.generatePreventionTips(questionData, thinkingProcess, true),
        similar_questions: this.generateSimilarQuestionAdvice(questionData, true)
      };
    } else {
      return {
        accuracy_score: Math.max(30, 40 + (thinkingQuality * 30)),
        strength_points: this.generateStrengthPoints(questionData, thinkingProcess, false),
        improvement_points: this.generateImprovementPoints(questionData, thinkingProcess, false),
        correct_approach: this.generateCorrectApproach(questionData, false),
        mistake_analysis: this.generateMistakeAnalysis(questionData, thinkingProcess, userAnswer),
        prevention_tips: this.generatePreventionTips(questionData, thinkingProcess, false),
        similar_questions: this.generateSimilarQuestionAdvice(questionData, false)
      };
    }
  }

  evaluateThinkingQuality(thinkingProcess, questionData) {
    if (!thinkingProcess || thinkingProcess.trim().length === 0) return 0.1;
    
    const thinking = thinkingProcess.toLowerCase();
    const question = questionData.question.toLowerCase();
    
    let quality = 0.3; // 基本点
    
    // 法律用語の使用をチェック
    const legalTerms = ['法律', '条文', '規定', '権利', '義務', '契約', '所有権', '借地', '借家', '都市計画', '建築', '不動産'];
    const usedTerms = legalTerms.filter(term => thinking.includes(term) || question.includes(term));
    quality += Math.min(0.3, usedTerms.length * 0.1);
    
    // 論理的思考の構造をチェック
    if (thinking.includes('なぜなら') || thinking.includes('理由') || thinking.includes('根拠')) quality += 0.2;
    if (thinking.includes('したがって') || thinking.includes('よって') || thinking.includes('ゆえに')) quality += 0.2;
    
    // 長さによる加点
    if (thinkingProcess.trim().length > 50) quality += 0.2;
    if (thinkingProcess.trim().length > 100) quality += 0.1;
    
    return Math.min(1.0, quality);
  }

  generateStrengthPoints(questionData, thinkingProcess, isCorrect) {
    const points = [];
    const hasThinking = thinkingProcess && thinkingProcess.trim().length > 0;
    
    if (isCorrect) {
      points.push("正確な判断ができています");
      if (hasThinking) {
        points.push("思考プロセスを言語化する習慣があります");
        if (thinkingProcess.length > 50) {
          points.push("詳細な思考記録ができています");
        }
      }
      points.push("宅建の基本的な考え方が身についています");
    } else {
      if (hasThinking) {
        points.push("問題に真剣に向き合う姿勢があります");
        points.push("自分なりの考えを整理しようとしています");
      } else {
        points.push("問題に取り組む意欲があります");
      }
      points.push("学習を継続する姿勢があります");
    }
    
    return points;
  }

  generateImprovementPoints(questionData, thinkingProcess, isCorrect) {
    const points = [];
    const hasThinking = thinkingProcess && thinkingProcess.trim().length > 0;
    
    if (!hasThinking) {
      points.push("思考プロセスを詳しく記録してみましょう");
      points.push("なぜその答えを選んだか理由を言語化してください");
    } else if (thinkingProcess.trim().length < 30) {
      points.push("思考プロセスをより詳細に記録してみましょう");
    }
    
    if (!isCorrect) {
      points.push("問題文のキーワードに注目する習慣をつけましょう");
      points.push("関連する法律知識を確認してから答えましょう");
      points.push("結論を急がず段階的に検討してください");
    } else {
      points.push("法的根拠をより明確にできるとさらに良いです");
      points.push("例外規定についても考慮してみてください");
    }
    
    return points;
  }

  generateCorrectApproach(questionData, isCorrect) {
    const approaches = [
      "問題文を注意深く読み、重要なキーワードを特定する",
      "関連する法令や規定を思い出す", 
      "具体的な事例に法律を適用して考える",
      "論理的に結論を導出する"
    ];
    
    return `宅建試験では次の手順が効果的です：${approaches.join(' → ')}。${isCorrect ? '今回のようなアプローチを他の問題でも活用してください。' : 'この手順を意識して解き直してみてください。'}`;
  }

  generateMistakeAnalysis(questionData, thinkingProcess, userAnswer) {
    const hasThinking = thinkingProcess && thinkingProcess.trim().length > 0;
    
    if (!hasThinking) {
      return "思考プロセスが記録されていないため詳細な分析はできませんが、問題文の読み取りと法律知識の確認を重点的に行ってください。";
    }
    
    return "思考の取り組み方は良いですが、問題文の詳細な読み取りと基礎知識の確認をより丁寧に行うことで改善できそうです。";
  }

  generatePreventionTips(questionData, thinkingProcess, isCorrect) {
    const tips = [];
    
    tips.push("問題文の重要語句に注意を向ける");
    tips.push("関連する法律の基本原則を思い出す");
    
    if (!isCorrect) {
      tips.push("分からない場合は基本に立ち返る");
      tips.push("時間をかけて丁寧に検討する");
    } else {
      tips.push("論理的な根拠を明確にする習慣をつける");
      tips.push("例外的なケースにも注意を向ける");
    }
    
    return tips;
  }

  generateSimilarQuestionAdvice(questionData, isCorrect) {
    const year = questionData.year;
    const advice = isCorrect ? 
      `${year}年度の類似問題では、今回と同様の思考パターンを活用できます。` :
      `${year}年度の類似問題に取り組む際は、基礎知識の確認を重点的に行ってください。`;
    
    return advice + "宅建試験では一貫した解法パターンの習得が重要です。";
  }

  getErrorAnalysis() {
    return {
      accuracy_score: 70,
      strength_points: [
        "思考プロセスを記録する習慣が身についています", 
        "問題に真剣に取り組む姿勢が見られます",
        "学習データが確実に保存されています"
      ],
      improvement_points: [
        "AI分析機能に接続できませんでした",
        "手動での振り返りを行ってみましょう",
        "なぜその答えを選んだか理由を考えてみてください",
        "間違えた場合は正しい根拠を確認しましょう"
      ],
      correct_approach: "AI分析は一時的に利用できませんが、自己分析も重要なスキルです。「なぜこの答えになるのか」を論理的に説明できるよう練習しましょう。",
      mistake_analysis: "現在AI分析は利用できませんが、あなたの思考プロセスは記録されています。後で見直して学習パターンを自分で分析してみてください。",
      prevention_tips: [
        "問題文のキーワードに注目する習慣をつける",
        "根拠となる法律や条文を思い出す",
        "似たような問題での経験を活かす",
        "時間をかけて丁寧に考える"
      ],
      similar_questions: "同じ分野の問題では、今回の思考プロセスを参考に、より詳細に根拠を考える練習をしてください。自己分析力も重要なスキルです。"
    };
  }

  async analyzeDailyStudySession(dailySessionData, date) {
    if (!this.isEnabled) {
      console.warn('OpenAI Daily Analysis disabled: No API key found');
      return this.getMockDailyAnalysis(dailySessionData, date);
    }

    console.log('Starting OpenAI Daily Analysis:', {
      date,
      totalQuestions: dailySessionData.length,
      model: this.model
    });

    try {
      const prompt = this.createDailyAnalysisPrompt(dailySessionData, date);
      
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'あなたは宅建試験の学習分析専門AIです。受験生の一日の学習セッションを総合的に分析し、学習パターンの改善提案を行います。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.4
        })
      });

      console.log('OpenAI Daily Analysis response status:', response.status);

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch (e) {
          errorDetails = await response.text();
        }
        
        console.error('OpenAI Daily Analysis Error Details:', {
          status: response.status,
          details: errorDetails
        });

        const errorMessage = this.createDetailedErrorMessage(response.status, errorDetails);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('OpenAI Daily Analysis success:', {
        usage: data.usage,
        responseLength: data.choices?.[0]?.message?.content?.length || 0
      });

      return this.parseDailyAnalysisResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI Daily Analysis Error:', {
        message: error.message,
        date,
        questionCount: dailySessionData.length,
        status: error.status || 'unknown'
      });
      return this.getErrorDailyAnalysis();
    }
  }

  createDailyAnalysisPrompt(dailySessionData, date) {
    const totalQuestions = dailySessionData.length;
    const correctAnswers = dailySessionData.filter(q => q.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    const questionsWithThinking = dailySessionData.filter(q => q.thinkingProcess && q.thinkingProcess.trim());
    const averageResponseTime = totalQuestions > 0 ? 
      Math.round(dailySessionData.reduce((sum, q) => sum + q.responseTime, 0) / totalQuestions / 1000) : 0;

    const yearDistribution = dailySessionData.reduce((acc, q) => {
      acc[q.year] = (acc[q.year] || 0) + 1;
      return acc;
    }, {});

    const incorrectQuestions = dailySessionData.filter(q => !q.isCorrect);
    
    return `
${date}の宅建学習セッション総合分析をお願いします。

【学習統計】
- 総問題数: ${totalQuestions}問
- 正解数: ${correctAnswers}問
- 正答率: ${accuracy}%
- 平均回答時間: ${averageResponseTime}秒
- 思考プロセス記録数: ${questionsWithThinking.length}問

【出題年度分布】
${Object.entries(yearDistribution).map(([year, count]) => `${year}年: ${count}問`).join('\n')}

【思考プロセス分析対象問題】
${questionsWithThinking.slice(0, 5).map((q, index) => `
${index + 1}. ${q.year}年 問${q.questionNumber}
問題: ${q.questionText.substring(0, 100)}...
思考プロセス: ${q.thinkingProcess}
回答: ${q.userAnswer} (正解: ${q.correctAnswer}) ${q.isCorrect ? '✓' : '✗'}
`).join('')}

【間違えた問題】
${incorrectQuestions.slice(0, 3).map((q, index) => `
${index + 1}. ${q.year}年 問${q.questionNumber}
問題: ${q.questionText.substring(0, 80)}...
選択: ${q.userAnswer} → 正解: ${q.correctAnswer}
思考: ${q.thinkingProcess || '記録なし'}
`).join('')}

【分析項目】
1. 今日の学習パフォーマンス総合評価
2. 思考パターンの特徴と傾向
3. 強化すべき分野・年度
4. ケアレスミス防止のための具体的アドバイス
5. 明日以降の学習方針

以下のJSON形式で回答してください：
{
  "overall_score": 0-100の数値,
  "performance_summary": "今日の学習パフォーマンス要約",
  "thinking_patterns": ["思考パターン1", "思考パターン2"],
  "strength_areas": ["得意分野1", "得意分野2"],
  "weakness_areas": ["苦手分野1", "苦手分野2"],
  "mistake_analysis": "ミスの傾向分析",
  "improvement_suggestions": ["改善提案1", "改善提案2", "改善提案3"],
  "tomorrow_focus": "明日の学習重点項目",
  "study_efficiency": "学習効率に関するコメント",
  "motivational_message": "励ましのメッセージ"
}
`;
  }

  parseDailyAnalysisResponse(content) {
    try {
      // JSONの抽出を試みる
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // JSON形式でない場合の処理
      return {
        overall_score: 75,
        performance_summary: "今日の学習お疲れさまでした",
        thinking_patterns: ["基本的な思考プロセスが記録されています"],
        strength_areas: ["継続的な学習"],
        weakness_areas: ["詳細な分析が必要です"],
        mistake_analysis: "分析中...",
        improvement_suggestions: ["明日も学習を継続してください"],
        tomorrow_focus: "苦手分野の復習",
        study_efficiency: "継続が重要です",
        motivational_message: "コツコツと学習を続けていきましょう！"
      };
    } catch (error) {
      console.error('Daily analysis parsing error:', error);
      return this.getErrorDailyAnalysis();
    }
  }

  getMockDailyAnalysis(dailySessionData, date) {
    const totalQuestions = dailySessionData.length;
    const correctAnswers = dailySessionData.filter(q => q.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    if (accuracy >= 80) {
      return {
        overall_score: 90,
        performance_summary: `今日は${totalQuestions}問に挑戦し、${accuracy}%の高い正答率を達成しました。思考プロセスも丁寧に記録されており、学習姿勢が素晴らしいです。`,
        thinking_patterns: [
          "問題文の要点を正確に把握する力がついています",
          "法律の基本原則を意識した思考ができています",
          "段階的に論理を積み上げる習慣が身についています"
        ],
        strength_areas: [
          "基礎的な法律知識の理解",
          "問題文の読解力",
          "継続的な学習姿勢"
        ],
        weakness_areas: [
          "複雑な事例問題への対応",
          "例外規定の理解"
        ],
        mistake_analysis: "少数のミスは主に細かい条文の記憶不足が原因です。基本的な理解は十分できています。",
        improvement_suggestions: [
          "間違えた問題の条文を再確認する",
          "類似問題で理解を定着させる",
          "例外規定を整理して覚える"
        ],
        tomorrow_focus: "今日間違えた分野の条文確認と類似問題演習",
        study_efficiency: "思考プロセスの記録により、自分の理解度を客観視できています。この調子で継続してください。",
        motivational_message: "素晴らしい正答率です！この調子で継続すれば必ず合格できます。明日も頑張りましょう！🎉"
      };
    } else if (accuracy >= 60) {
      return {
        overall_score: 75,
        performance_summary: `今日は${totalQuestions}問に取り組み、${accuracy}%の正答率でした。思考プロセスの記録から学習意欲が伝わってきます。`,
        thinking_patterns: [
          "問題に真剣に取り組む姿勢が見られます",
          "自分なりの考えを整理しようとしています",
          "基本的な判断はできています"
        ],
        strength_areas: [
          "学習への取り組み姿勢",
          "基本問題への対応"
        ],
        weakness_areas: [
          "法律知識の正確性",
          "問題文の詳細な読み取り",
          "複合的な判断が必要な問題"
        ],
        mistake_analysis: "基礎知識の理解が不十分な部分があります。思考の方向性は良いので、知識を補強すれば向上が期待できます。",
        improvement_suggestions: [
          "基本的な条文を確実に覚える",
          "間違えた問題を重点的に復習する",
          "思考プロセスをより詳細に記録する",
          "なぜその答えになるかの根拠を明確にする"
        ],
        tomorrow_focus: "基礎知識の確認と、今日間違えた問題の徹底復習",
        study_efficiency: "思考プロセスの記録は学習効果を高めます。より詳細に記録することで、さらなる向上が期待できます。",
        motivational_message: "着実に学習を積み重ねています。基礎を固めれば必ず成果が出ます。継続が力になります！💪"
      };
    } else {
      return {
        overall_score: 60,
        performance_summary: `今日は${totalQuestions}問に挑戦しました。${accuracy}%の正答率ですが、学習への取り組みは評価できます。`,
        thinking_patterns: [
          "問題に向き合う姿勢があります",
          "自分なりに考えようとしています"
        ],
        strength_areas: [
          "継続的な学習意欲",
          "問題に取り組む姿勢"
        ],
        weakness_areas: [
          "基礎的な法律知識",
          "問題文の理解",
          "正確な判断力"
        ],
        mistake_analysis: "基礎知識の不足が主な原因です。焦らず、まずは基本的な理解を固めることが重要です。",
        improvement_suggestions: [
          "テキストで基礎知識を再確認する",
          "簡単な問題から段階的に取り組む",
          "わからない用語は必ず調べる",
          "思考プロセスをもっと詳しく記録する",
          "間違えた理由を明確にする"
        ],
        tomorrow_focus: "基礎テキストの読み直しと基本問題の反復学習",
        study_efficiency: "現在は基礎固めの段階です。思考プロセスの記録を続けながら、着実に知識を積み上げていきましょう。",
        motivational_message: "学習は積み重ねです。今日の努力は必ず未来に繋がります。基礎から丁寧に取り組んでいきましょう！🌱"
      };
    }
  }

  getErrorDailyAnalysis() {
    return {
      overall_score: 75,
      performance_summary: "今日の学習お疲れさまでした。AI分析機能が一時的に利用できませんが、あなたの学習記録はしっかりと保存されています。継続的な学習こそが最も重要です。",
      thinking_patterns: [
        "問題に真剣に取り組む姿勢が見られます",
        "思考プロセスを記録する習慣が身についています",
        "継続的な学習への意欲があります"
      ],
      strength_areas: [
        "継続的な学習姿勢",
        "思考プロセスの記録習慣",
        "問題への真摯な取り組み"
      ],
      weakness_areas: [
        "AI分析は現在利用できません",
        "手動での振り返りが必要です"
      ],
      mistake_analysis: "AI分析は現在利用できませんが、あなたの思考プロセスと回答記録は全て保存されています。自己分析の良い機会として活用してください。",
      improvement_suggestions: [
        "今日間違えた問題を再度見直してみましょう",
        "正解した問題でも根拠を確認してみてください",
        "思考プロセスをより詳細に記録する練習をしましょう",
        "わからない分野は基礎から復習しましょう",
        "継続的な学習ペースを維持してください"
      ],
      tomorrow_focus: "今日の学習内容の復習と、苦手分野の基礎固め",
      study_efficiency: "AI分析が利用できない時こそ、自分で学習パターンを分析する力を身につける良い機会です。思考プロセスの記録を続けてください。",
      motivational_message: "AI分析がなくても、あなたの努力と継続が最も重要です。記録された学習データを活用して、自分なりの学習方法を見つけていきましょう！📚✨"
    };
  }

  isAPIEnabled() {
    return this.isEnabled;
  }
}

const openAIService = new OpenAIService();
export default openAIService;