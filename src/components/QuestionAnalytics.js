import React, { useMemo, useState } from 'react';

const QuestionAnalytics = ({ allQuestions, questionStats, onGoHome }) => {
  const [sortBy, setSortBy] = useState('number'); // number, attempts, accuracy
  const [filterBy, setFilterBy] = useState('all'); // all, attempted, good, poor

  // 統計データ付きの問題リストを作成
  const questionsWithStats = useMemo(() => {
    return allQuestions.map(question => {
      const stats = questionStats[question.number] || {
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0
      };
      return {
        ...question,
        ...stats
      };
    });
  }, [allQuestions, questionStats]);

  // フィルタリングとソート
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questionsWithStats;

    // フィルタリング
    switch (filterBy) {
      case 'attempted':
        filtered = filtered.filter(q => q.totalAttempts > 0);
        break;
      case 'good':
        filtered = filtered.filter(q => q.totalAttempts > 0 && q.accuracy >= 70);
        break;
      case 'poor':
        filtered = filtered.filter(q => q.totalAttempts > 0 && q.accuracy < 50);
        break;
      default: // 'all'
        break;
    }

    // ソート
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'attempts':
          return b.totalAttempts - a.totalAttempts;
        case 'accuracy':
          // 未回答の問題は最後に
          if (a.totalAttempts === 0 && b.totalAttempts === 0) return a.number - b.number;
          if (a.totalAttempts === 0) return 1;
          if (b.totalAttempts === 0) return -1;
          return b.accuracy - a.accuracy;
        default: // 'number'
          return a.number - b.number;
      }
    });
  }, [questionsWithStats, sortBy, filterBy]);

  const getAccuracyClass = (accuracy, attempts) => {
    if (attempts === 0) return 'not-attempted';
    if (accuracy >= 70) return 'good';
    if (accuracy >= 50) return 'average';
    return 'poor';
  };

  const totalAttempted = questionsWithStats.filter(q => q.totalAttempts > 0).length;
  const averageAccuracy = questionsWithStats.length > 0 ? 
    questionsWithStats
      .filter(q => q.totalAttempts > 0)
      .reduce((sum, q) => sum + q.accuracy, 0) / 
    Math.max(1, questionsWithStats.filter(q => q.totalAttempts > 0).length) : 0;

  return (
    <div className="question-analytics-container">
      <div className="analytics-header">
        <h2>問題別統計</h2>
        <button onClick={onGoHome} className="home-button">ホームに戻る</button>
      </div>

      {/* 概要統計 */}
      <div className="analytics-summary">
        <div className="summary-item">
          <div className="summary-value">{totalAttempted}</div>
          <div className="summary-label">解答済み問題数</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{allQuestions.length - totalAttempted}</div>
          <div className="summary-label">未解答問題数</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">{averageAccuracy.toFixed(1)}%</div>
          <div className="summary-label">平均正答率</div>
        </div>
      </div>

      {/* フィルタとソート */}
      <div className="analytics-controls">
        <div className="control-group">
          <label>表示:</label>
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="all">すべての問題</option>
            <option value="attempted">解答済みのみ</option>
            <option value="good">正答率70%以上</option>
            <option value="poor">正答率50%未満</option>
          </select>
        </div>
        <div className="control-group">
          <label>並び順:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="number">問題番号順</option>
            <option value="attempts">回答回数順</option>
            <option value="accuracy">正答率順</option>
          </select>
        </div>
      </div>

      {/* 問題リスト */}
      <div className="analytics-list">
        {filteredAndSortedQuestions.map(question => (
          <div key={question.number} className="analytics-item">
            <div className="question-info">
              <div className="question-header">
                <span className="question-number">問題 {question.number}</span>
                <span className="question-year">{question.year}年</span>
              </div>
              <div className="question-preview">
                {question.question.substring(0, 80)}...
              </div>
            </div>
            
            <div className="question-statistics">
              {question.totalAttempts > 0 ? (
                <>
                  <div className="stat-item">
                    <span className="stat-label">回答回数</span>
                    <span className="stat-value">{question.totalAttempts}回</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">正解数</span>
                    <span className="stat-value">{question.correctAttempts}回</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">正答率</span>
                    <span className={`stat-value accuracy-badge ${getAccuracyClass(question.accuracy, question.totalAttempts)}`}>
                      {question.accuracy}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="not-attempted-badge">未解答</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedQuestions.length === 0 && (
        <div className="no-results">
          <p>条件に一致する問題がありません。</p>
        </div>
      )}
    </div>
  );
};

export default QuestionAnalytics;