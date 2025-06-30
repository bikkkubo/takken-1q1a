
import React, { useState, useEffect } from 'react';

const Answer = ({ question, isCorrect, onNext, onToggleWeakness, isWeakness, memo, onMemoChange, onGoHome, onPrevious, currentIndex, totalQuestions, thinkingProcess, aiAnalysis }) => {
  const [currentMemo, setCurrentMemo] = useState(memo || '');
  const [showMemo, setShowMemo] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    setCurrentMemo(memo || '');
  }, [memo]);

  const handleMemoSave = () => {
    onMemoChange(currentMemo);
    setShowMemo(false);
  };

  const handleMemoCancel = () => {
    setCurrentMemo(memo || '');
    setShowMemo(false);
  };

  return (
    <div className={`answer-container ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="answer-header">
        <div className="result-icon">{isCorrect ? '○' : '×'}</div>
        <button onClick={onGoHome} className="home-button-small">×</button>
      </div>
      
      {/* 問題文の表示 */}
      <div className="question-review">
        <h4>問題</h4>
        <div className="question-text-review">{question.question}</div>
      </div>
      
      {/* 解説の表示 */}
      <div className="answer-section">
        <h4>解説</h4>
        <div className="answer-text">{question.answer}</div>
      </div>
      
      {/* メモ表示・編集エリア */}
      {showMemo ? (
        <div className="memo-editor">
          <h4>メモを編集</h4>
          <textarea
            value={currentMemo}
            onChange={(e) => setCurrentMemo(e.target.value)}
            placeholder="この問題についてのメモを入力してください..."
            rows={4}
            className="memo-textarea"
          />
          <div className="memo-actions">
            <button onClick={handleMemoSave} className="memo-save">保存</button>
            <button onClick={handleMemoCancel} className="memo-cancel">キャンセル</button>
          </div>
        </div>
      ) : (
        memo && (
          <div className="memo-display">
            <h4>メモ</h4>
            <div className="memo-content">{memo}</div>
          </div>
        )
      )}

      {/* 思考プロセス表示 */}
      {thinkingProcess && (
        <div className="thinking-process-display">
          <h4>あなたの思考プロセス</h4>
          <div className="thinking-content">{thinkingProcess.thinking}</div>
          <div className="thinking-meta">
            <span className="thinking-result">
              結果: {thinkingProcess.isCorrect ? '✅ 正解' : '❌ 不正解'}
            </span>
            <span className="thinking-answer">
              回答: {thinkingProcess.userAnswer}
            </span>
          </div>
        </div>
      )}

      {/* AI分析結果表示 */}
      {aiAnalysis && (
        <div className="ai-analysis-display">
          <div className="ai-analysis-header">
            <h4>🤖 AI思考プロセス分析</h4>
            <div className="accuracy-score">
              思考精度: {aiAnalysis.accuracy_score}/100
            </div>
            <div className="ethics-score">
              倫理スコア: {aiAnalysis.ethics_score}/100
            </div>
          </div>

          {/* 良かった点 */}
          <div className="analysis-section">
            <button 
              className={`analysis-toggle ${expandedSection === 'strengths' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'strengths' ? null : 'strengths')}
            >
              ✅ 良かった点 ({aiAnalysis.strength_points?.length || 0})
            </button>
            {expandedSection === 'strengths' && (
              <div className="analysis-content">
                <ul>
                  {(aiAnalysis.strength_points || []).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 改善点 */}
          <div className="analysis-section">
            <button 
              className={`analysis-toggle ${expandedSection === 'improvements' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'improvements' ? null : 'improvements')}
            >
              🔧 改善すべき点 ({aiAnalysis.improvement_points?.length || 0})
            </button>
            {expandedSection === 'improvements' && (
              <div className="analysis-content">
                <ul>
                  {(aiAnalysis.improvement_points || []).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 正しいアプローチ */}
          <div className="analysis-section">
            <button 
              className={`analysis-toggle ${expandedSection === 'approach' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'approach' ? null : 'approach')}
            >
              💡 正しい思考手順
            </button>
            {expandedSection === 'approach' && (
              <div className="analysis-content">
                <p>{aiAnalysis.correct_approach}</p>
              </div>
            )}
          </div>

          {/* ミス分析 */}
          <div className="analysis-section">
            <button 
              className={`analysis-toggle ${expandedSection === 'mistake' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'mistake' ? null : 'mistake')}
            >
              🔍 ミス分析
            </button>
            {expandedSection === 'mistake' && (
              <div className="analysis-content">
                <p>{aiAnalysis.mistake_analysis}</p>
              </div>
            )}
          </div>

          {/* 防止策 */}
          <div className="analysis-section">
            <button 
              className={`analysis-toggle ${expandedSection === 'prevention' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'prevention' ? null : 'prevention')}
            >
              🛡️ ケアレスミス防止策 ({aiAnalysis.prevention_tips?.length || 0})
            </button>
            {expandedSection === 'prevention' && (
              <div className="analysis-content">
                <ul>
                  {(aiAnalysis.prevention_tips || []).map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 類似問題へのアプローチ */}
          <div className="analysis-section">
            <button 
              className={`analysis-toggle ${expandedSection === 'similar' ? 'expanded' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'similar' ? null : 'similar')}
            >
              📚 類似問題へのアプローチ
            </button>
            {expandedSection === 'similar' && (
              <div className="analysis-content">
                <p>{aiAnalysis.similar_questions}</p>
              </div>
            )}
          </div>

          {/* ステークホルダー配慮 */}
          {aiAnalysis.stakeholder_considerations && (
            <div className="analysis-section">
              <button 
                className={`analysis-toggle ${expandedSection === 'stakeholder' ? 'expanded' : ''}`}
                onClick={() => setExpandedSection(expandedSection === 'stakeholder' ? null : 'stakeholder')}
              >
                👥 ステークホルダー配慮
              </button>
              {expandedSection === 'stakeholder' && (
                <div className="analysis-content">
                  <p>{aiAnalysis.stakeholder_considerations}</p>
                </div>
              )}
            </div>
          )}

          {/* 倫理的ガイドライン */}
          {aiAnalysis.ethical_guidelines && (
            <div className="analysis-section">
              <button 
                className={`analysis-toggle ${expandedSection === 'ethics' ? 'expanded' : ''}`}
                onClick={() => setExpandedSection(expandedSection === 'ethics' ? null : 'ethics')}
              >
                ⚖️ 倫理的ガイドライン
              </button>
              {expandedSection === 'ethics' && (
                <div className="analysis-content">
                  <p>{aiAnalysis.ethical_guidelines}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="answer-actions">
        <button onClick={onNext}>
          {currentIndex === totalQuestions - 1 ? 'ホームに戻る' : '次の問題へ'}
        </button>
        <button onClick={onToggleWeakness}>
          {isWeakness ? '弱点から削除' : '弱点に登録'}
        </button>
        <button onClick={() => setShowMemo(!showMemo)} className="memo-button">
          {showMemo ? 'メモを閉じる' : memo ? 'メモを編集' : 'メモを追加'}
        </button>
      </div>
      
      <div className="navigation-buttons">
        <button 
          onClick={onPrevious} 
          disabled={currentIndex === 0}
          className="nav-button prev"
        >
          ← 前の問題
        </button>
        <div className="question-progress-answer">
          {currentIndex + 1} / {totalQuestions}
        </div>
        <button 
          onClick={onNext} 
          className="nav-button next"
        >
          {currentIndex === totalQuestions - 1 ? 'ホームへ' : '次の問題 →'}
        </button>
      </div>
    </div>
  );
};

export default Answer;
