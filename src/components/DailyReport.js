import React, { useState, useEffect } from 'react';
import openaiService from '../services/openaiService';

const DailyReport = ({ dailyStudySessions, dailyReports, setDailyReports, onBack }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    // 利用可能な日付を取得（学習データがある日付）
    const dates = Object.keys(dailyStudySessions)
      .filter(date => dailyStudySessions[date] && dailyStudySessions[date].length > 0)
      .sort((a, b) => new Date(b) - new Date(a)); // 新しい順
    setAvailableDates(dates);
    
    // 最新の日付を初期選択
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dailyStudySessions, selectedDate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日(${weekday})`;
  };

  const getSessionStats = (sessionData) => {
    if (!sessionData || sessionData.length === 0) return null;
    
    const totalQuestions = sessionData.length;
    const correctAnswers = sessionData.filter(q => q.isCorrect).length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const averageTime = Math.round(
      sessionData.reduce((sum, q) => sum + q.responseTime, 0) / totalQuestions / 1000
    );
    const thinkingRecords = sessionData.filter(q => q.thinkingProcess && q.thinkingProcess.trim()).length;

    return {
      totalQuestions,
      correctAnswers,
      accuracy,
      averageTime,
      thinkingRecords
    };
  };

  const analyzeDailySession = async (date) => {
    const sessionData = dailyStudySessions[date];
    if (!sessionData || sessionData.length === 0) return;

    setIsAnalyzing(true);
    try {
      const analysis = await openaiService.analyzeDailyStudySession(sessionData, date);
      
      setDailyReports(prev => ({
        ...prev,
        [date]: {
          ...analysis,
          analyzedAt: Date.now(),
          sessionStats: getSessionStats(sessionData)
        }
      }));
    } catch (error) {
      console.error('Daily analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentReport = selectedDate ? dailyReports[selectedDate] : null;
  const currentSession = selectedDate ? dailyStudySessions[selectedDate] : null;
  const currentStats = currentSession ? getSessionStats(currentSession) : null;

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="daily-report">
      <div className="daily-report-header">
        <button onClick={onBack} className="back-button">
          ← ホーム
        </button>
        <h2>📊 日次学習レポート</h2>
      </div>

      {/* 日付選択 */}
      <div className="date-selector">
        <label htmlFor="date-select">📅 日付を選択:</label>
        <select
          id="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-select"
        >
          <option value="">-- 日付を選択 --</option>
          {availableDates.map(date => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
        </select>
      </div>

      {selectedDate && currentStats && (
        <div className="daily-content">
          {/* 基本統計 */}
          <div className="session-stats">
            <h3>📈 {formatDate(selectedDate)} の学習統計</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">問題数</span>
                <span className="stat-value">{currentStats.totalQuestions}問</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">正答率</span>
                <span className="stat-value" style={{color: getScoreColor(currentStats.accuracy)}}>
                  {currentStats.accuracy}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">正解数</span>
                <span className="stat-value">{currentStats.correctAnswers}問</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">平均時間</span>
                <span className="stat-value">{currentStats.averageTime}秒</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">思考記録</span>
                <span className="stat-value">{currentStats.thinkingRecords}問</span>
              </div>
            </div>
          </div>

          {/* AI分析結果 */}
          {currentReport ? (
            <div className="ai-analysis">
              <div className="analysis-header">
                <h3>🤖 AI総合分析</h3>
                <div className="overall-score">
                  <span className="score-label">総合スコア</span>
                  <span 
                    className="score-value"
                    style={{color: getScoreColor(currentReport.overall_score)}}
                  >
                    {currentReport.overall_score}/100
                  </span>
                </div>
              </div>

              <div className="analysis-sections">
                <div className="analysis-section">
                  <h4>💭 学習パフォーマンス</h4>
                  <p>{currentReport.performance_summary}</p>
                </div>

                <div className="analysis-section">
                  <h4>🧠 思考パターン</h4>
                  <ul>
                    {currentReport.thinking_patterns.map((pattern, index) => (
                      <li key={index}>{pattern}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h4>💪 得意分野</h4>
                  <ul className="strength-list">
                    {currentReport.strength_areas.map((area, index) => (
                      <li key={index}>✅ {area}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h4>📚 改善分野</h4>
                  <ul className="weakness-list">
                    {currentReport.weakness_areas.map((area, index) => (
                      <li key={index}>⚠️ {area}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h4>🔍 ミス分析</h4>
                  <p>{currentReport.mistake_analysis}</p>
                </div>

                <div className="analysis-section">
                  <h4>💡 改善提案</h4>
                  <ul>
                    {currentReport.improvement_suggestions.map((suggestion, index) => (
                      <li key={index}>💡 {suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h4>🎯 明日のフォーカス</h4>
                  <p className="tomorrow-focus">{currentReport.tomorrow_focus}</p>
                </div>

                <div className="analysis-section">
                  <h4>⚡ 学習効率</h4>
                  <p>{currentReport.study_efficiency}</p>
                </div>

                <div className="analysis-section motivational">
                  <h4>🌟 応援メッセージ</h4>
                  <p className="motivational-message">{currentReport.motivational_message}</p>
                </div>
              </div>

              <div className="analysis-footer">
                <small>分析日時: {new Date(currentReport.analyzedAt).toLocaleString()}</small>
              </div>
            </div>
          ) : (
            <div className="no-analysis">
              <h3>🤖 AI分析</h3>
              <p>この日の学習データのAI分析はまだ実行されていません。</p>
              <button
                onClick={() => analyzeDailySession(selectedDate)}
                disabled={isAnalyzing}
                className="analyze-button"
              >
                {isAnalyzing ? '🔄 分析中...' : '🚀 AI分析を実行'}
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="no-selection">
          <p>📅 分析したい日付を選択してください</p>
        </div>
      )}

      {selectedDate && (!currentSession || currentSession.length === 0) && (
        <div className="no-data">
          <p>📝 選択した日付の学習データがありません</p>
        </div>
      )}

      <style jsx>{`
        .daily-report {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          min-height: 100vh;
        }

        .daily-report-header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }

        .back-button {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          margin-right: 20px;
          font-size: 14px;
        }

        .back-button:hover {
          background: #4b5563;
        }

        .daily-report h2 {
          color: #1f2937;
          margin: 0;
          font-size: 24px;
        }

        .date-selector {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .date-selector label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #374151;
        }

        .date-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          background: white;
        }

        .date-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .session-stats {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .session-stats h3 {
          margin: 0 0 15px 0;
          color: #0c4a6e;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
        }

        .stat-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e0f2fe;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .ai-analysis {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 25px;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .analysis-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .overall-score {
          text-align: center;
        }

        .score-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 5px;
        }

        .score-value {
          font-size: 24px;
          font-weight: 800;
        }

        .analysis-sections {
          display: grid;
          gap: 20px;
        }

        .analysis-section {
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .analysis-section h4 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 16px;
        }

        .analysis-section p {
          margin: 0;
          line-height: 1.6;
          color: #374151;
        }

        .analysis-section ul {
          margin: 0;
          padding-left: 20px;
          color: #374151;
        }

        .analysis-section li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .strength-list {
          border-left-color: #10b981 !important;
        }

        .weakness-list {
          border-left-color: #f59e0b !important;
        }

        .tomorrow-focus {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #fbbf24;
          font-weight: 600;
          color: #92400e;
        }

        .motivational {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left-color: #f59e0b !important;
        }

        .motivational-message {
          font-weight: 600;
          color: #92400e;
          font-size: 16px;
        }

        .analysis-footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
        }

        .no-analysis {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
        }

        .no-analysis h3 {
          margin-bottom: 15px;
          color: #374151;
        }

        .no-analysis p {
          margin-bottom: 20px;
          color: #6b7280;
        }

        .analyze-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .analyze-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .analyze-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .no-selection, .no-data {
          text-align: center;
          padding: 40px;
          color: #6b7280;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .daily-report {
            padding: 15px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .analysis-header {
            flex-direction: column;
            gap: 15px;
          }

          .score-value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default DailyReport;