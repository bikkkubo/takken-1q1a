
import React, { useState, useEffect, useRef } from 'react';

const Question = ({ question, onAnswer, sessionData, onGoHome, onPrevious, onNext, currentIndex, totalQuestions, questionStats }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
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
      
      <div className="choices">
        <button onClick={() => onAnswer('○')}>○</button>
        <button onClick={() => onAnswer('×')}>×</button>
      </div>
      
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
