
import React, { useState, useEffect, useRef } from 'react';

const Question = ({ question, onAnswer, sessionData, onGoHome, onPrevious, onNext, currentIndex, totalQuestions, questionStats }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [thinkingProcess, setThinkingProcess] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (sessionData && sessionData.questionStartTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionData.questionStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionData]);

  // 問題が変わったときに状態をリセット
  useEffect(() => {
    setThinkingProcess('');
    setShowAnswer(false);
  }, [question.number]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // タッチイベントハンドラー
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = Math.abs(touchStart.y - touchEnd.y);
    
    // 水平方向のスワイプが縦方向より大きく、一定距離以上の場合
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0 && onNext) {
        // 左スワイプ（次へ）
        onNext();
      } else if (deltaX < 0 && onPrevious) {
        // 右スワイプ（前へ）
        onPrevious();
      }
    }
  };

  // 思考プロセスを記録して回答選択を表示
  const handleThinkingSubmit = () => {
    if (thinkingProcess.trim()) {
      setShowAnswer(true);
    } else {
      alert('思考プロセスを入力してください。');
    }
  };

  // 回答を送信
  const handleAnswerSubmit = (userAnswer) => {
    onAnswer(userAnswer, thinkingProcess);
  };

  // 思考プロセスをスキップして回答
  const handleSkipThinking = () => {
    setShowAnswer(true);
  };

  return (
    <div 
      className="question-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="question-header">
        <div className="question-info">
          <div className="question-number">問題 {question.number}</div>
          <div className="question-progress">
            {currentIndex + 1} / {totalQuestions}
          </div>
        </div>
        <div className="header-controls">
          <div className="timer">{formatTime(elapsedTime)}</div>
          <button onClick={onGoHome} className="home-button-small">×</button>
        </div>
      </div>
      
      <div className="question-text">{question.question}</div>
      
      {/* 問題別統計情報の表示 */}
      {questionStats && questionStats.totalAttempts > 0 && (
        <div className="question-stats">
          <div className="stats-item">
            <span className="stats-label">回答回数:</span>
            <span className="stats-value">{questionStats.totalAttempts}回</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">正答率:</span>
            <span className={`stats-value accuracy ${questionStats.accuracy >= 70 ? 'good' : questionStats.accuracy >= 50 ? 'average' : 'poor'}`}>
              {questionStats.accuracy}%
            </span>
          </div>
        </div>
      )}
      
      <div className="navigation-hint">
        <span>← 前の問題にスワイプ | 次の問題にスワイプ →</span>
      </div>
      
      {/* 思考プロセス入力フェーズ */}
      {!showAnswer && (
        <div className="thinking-process-section">
          <div className="thinking-instructions">
            <h4>💭 あなたの思考プロセスを記録してください</h4>
            <p>この問題をどのように考えて解くか、手順を書いてください。<br/>
            ケアレスミスの分析に役立ちます。</p>
          </div>
          
          <textarea
            value={thinkingProcess}
            onChange={(e) => setThinkingProcess(e.target.value)}
            placeholder="例: まず問題文のキーワードを確認...&#10;この場合の法的根拠は...&#10;よって答えは○（または×）だと思う"
            className="thinking-textarea"
            rows="6"
          />
          
          <div className="thinking-actions">
            <button 
              onClick={handleThinkingSubmit}
              className="thinking-submit-button"
              disabled={!thinkingProcess.trim()}
            >
              思考を記録して回答する
            </button>
            <button 
              onClick={handleSkipThinking}
              className="thinking-skip-button"
            >
              思考記録をスキップ
            </button>
          </div>
        </div>
      )}
      
      {/* 回答選択フェーズ */}
      {showAnswer && (
        <div className="answer-selection-section">
          {thinkingProcess.trim() && (
            <div className="thinking-summary">
              <h5>記録した思考プロセス:</h5>
              <div className="thinking-display">{thinkingProcess}</div>
            </div>
          )}
          
          <div className="answer-prompt">
            <h4>上記の思考に基づいて回答してください</h4>
          </div>
          
          <div className="choices">
            <button onClick={() => handleAnswerSubmit('○')}>○</button>
            <button onClick={() => handleAnswerSubmit('×')}>×</button>
          </div>
          
          <button 
            onClick={() => setShowAnswer(false)}
            className="back-to-thinking-button"
          >
            思考プロセスを修正する
          </button>
        </div>
      )}
      
      <div className="navigation-buttons">
        <button 
          onClick={onPrevious} 
          disabled={currentIndex === 0}
          className="nav-button prev"
        >
          ← 前の問題
        </button>
        <button 
          onClick={onNext} 
          disabled={currentIndex === totalQuestions - 1}
          className="nav-button next"
        >
          次の問題 →
        </button>
      </div>
    </div>
  );
};

export default Question;
