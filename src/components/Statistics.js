import React from 'react';

const Statistics = ({ stats, onGoHome }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分${remainingSeconds}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    } else {
      return `${remainingSeconds}秒`;
    }
  };

  const accuracy = stats.totalAnswered > 0 ? 
    ((stats.correctAnswers / stats.totalAnswered) * 100).toFixed(1) : 0;

  const averageTime = stats.totalAnswered > 0 ? 
    Math.round(stats.totalTime / stats.totalAnswered) : 0;

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>学習統計</h2>
        <button onClick={onGoHome} className="home-button">ホームに戻る</button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>総学習回数</h3>
          <div className="stat-value">{stats.totalSessions}</div>
        </div>
        
        <div className="stat-card">
          <h3>総問題数</h3>
          <div className="stat-value">{stats.totalAnswered}</div>
        </div>
        
        <div className="stat-card">
          <h3>正解数</h3>
          <div className="stat-value">{stats.correctAnswers}</div>
        </div>
        
        <div className="stat-card">
          <h3>正答率</h3>
          <div className="stat-value">{accuracy}%</div>
        </div>
        
        <div className="stat-card">
          <h3>総学習時間</h3>
          <div className="stat-value">{formatTime(stats.totalTime)}</div>
        </div>
        
        <div className="stat-card">
          <h3>平均回答時間</h3>
          <div className="stat-value">{formatTime(averageTime)}</div>
        </div>
        
        <div className="stat-card">
          <h3>弱点問題数</h3>
          <div className="stat-value">{stats.weaknessCount}</div>
        </div>
        
        <div className="stat-card">
          <h3>最高連続正解</h3>
          <div className="stat-value">{stats.maxStreak}</div>
        </div>
      </div>
      
      {stats.recentSessions && stats.recentSessions.length > 0 && (
        <div className="recent-sessions">
          <h3>最近の学習履歴</h3>
          <div className="session-list">
            {stats.recentSessions.slice(-10).reverse().map((session, index) => (
              <div key={index} className="session-item">
                <div className="session-date">
                  {new Date(session.date).toLocaleDateString('ja-JP')}
                </div>
                <div className="session-details">
                  {session.correct}/{session.total} 
                  ({session.total > 0 ? ((session.correct / session.total) * 100).toFixed(1) : 0}%)
                  - {formatTime(session.time)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;