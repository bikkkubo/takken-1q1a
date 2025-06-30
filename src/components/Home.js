
import React from 'react';

const Home = ({ onStart, reviewCount = 0, userLevel = 'beginner', totalAnswered = 0 }) => {
  const getLevelDisplay = (level) => {
    const levels = {
      beginner: { name: '初級者', color: '#28a745', icon: '🌱' },
      intermediate: { name: '中級者', color: '#ffc107', icon: '🌿' },
      advanced: { name: '上級者', color: '#fd7e14', icon: '🌳' },
      expert: { name: '専門家', color: '#dc3545', icon: '🏆' }
    };
    return levels[level] || levels.beginner;
  };

  const levelInfo = getLevelDisplay(userLevel);

  return (
    <div className="home-container">
      <h1>一問一答アプリ</h1>
      
      {totalAnswered >= 10 && (
        <div className="user-level-display">
          <span className="level-icon">{levelInfo.icon}</span>
          <span className="level-text" style={{ color: levelInfo.color }}>
            あなたのレベル: {levelInfo.name}
          </span>
        </div>
      )}
      
      <div className="menu-buttons">
        <button onClick={() => onStart('all')}>全問スタート</button>
        <button onClick={() => onStart('random')}>ランダムスタート</button>
        <button 
          onClick={() => onStart('adaptive')} 
          className="adaptive-button"
        >
          {totalAnswered >= 10 ? 'おすすめ学習' : 'おすすめ学習（10問解答後利用可能）'}
        </button>
        <button onClick={() => onStart('categories')}>カテゴリ別学習</button>
        <button onClick={() => onStart('search')}>問題を検索</button>
        <button 
          onClick={() => onStart('review')} 
          className={reviewCount > 0 ? 'review-available' : ''}
        >
          復習スケジュール
          {reviewCount > 0 && <span className="review-badge">{reviewCount}</span>}
        </button>
        <button onClick={() => onStart('weakness')}>弱点一覧を見る</button>
        <button onClick={() => onStart('statistics')}>学習統計を見る</button>
        <button onClick={() => onStart('analytics')}>問題別統計を見る</button>
        <button onClick={() => onStart('memoList')}>メモ一覧を見る</button>
        <button onClick={() => onStart('dailyReport')} className="daily-report-button">
          📊 日次学習レポート
        </button>
      </div>
    </div>
  );
};

export default Home;
