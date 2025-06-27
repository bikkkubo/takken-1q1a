
import React, { useState, useEffect } from 'react';

const Answer = ({ question, isCorrect, onNext, onToggleWeakness, isWeakness, memo, onMemoChange, onGoHome, onPrevious, currentIndex, totalQuestions }) => {
  const [currentMemo, setCurrentMemo] = useState(memo || '');
  const [showMemo, setShowMemo] = useState(false);

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
