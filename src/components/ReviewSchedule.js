import React, { useMemo } from 'react';

const ReviewSchedule = ({ allQuestions, reviewSchedule, onStartQuiz, onGoHome }) => {
  // 復習対象の問題を取得
  const reviewQuestions = useMemo(() => {
    const now = Date.now();
    return allQuestions.filter(question => {
      const schedule = reviewSchedule[question.number];
      return schedule && schedule.nextReview <= now;
    });
  }, [allQuestions, reviewSchedule]);

  // 今後の復習予定問題
  const upcomingQuestions = useMemo(() => {
    const now = Date.now();
    return allQuestions
      .filter(question => {
        const schedule = reviewSchedule[question.number];
        return schedule && schedule.nextReview > now;
      })
      .sort((a, b) => {
        const scheduleA = reviewSchedule[a.number];
        const scheduleB = reviewSchedule[b.number];
        return scheduleA.nextReview - scheduleB.nextReview;
      })
      .slice(0, 10); // 直近10問のみ表示
  }, [allQuestions, reviewSchedule]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今日';
    } else if (diffDays === 1) {
      return '明日';
    } else if (diffDays < 7) {
      return `${diffDays}日後`;
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  };

  const getLevelColor = (level) => {
    const colors = ['#ff4444', '#ff8800', '#ffaa00', '#88cc00', '#00cc88', '#0088cc'];
    return colors[level] || '#666';
  };

  const handleStartReviewQuiz = () => {
    if (reviewQuestions.length === 0) return;
    onStartQuiz(reviewQuestions);
  };

  return (
    <div className="review-schedule-container">
      <div className="review-schedule-header">
        <h2>復習スケジュール</h2>
        <button onClick={onGoHome} className="home-button">ホームに戻る</button>
      </div>
      
      {/* 復習対象の問題 */}
      <div className="review-section">
        <h3>復習対象の問題 ({reviewQuestions.length}問)</h3>
        {reviewQuestions.length > 0 ? (
          <>
            <button 
              onClick={handleStartReviewQuiz}
              className="review-start-button"
            >
              復習を開始する
            </button>
            <div className="review-questions-list">
              {reviewQuestions.slice(0, 5).map(question => {
                const schedule = reviewSchedule[question.number];
                return (
                  <div key={question.number} className="review-question-item">
                    <div className="question-info">
                      <span className="question-number">問題 {question.number}</span>
                      <span className="question-year">{question.year}年</span>
                    </div>
                    <div className="question-preview">
                      {question.question.substring(0, 50)}...
                    </div>
                    <div className="review-info">
                      <span 
                        className="review-level"
                        style={{ backgroundColor: getLevelColor(schedule.level) }}
                      >
                        Lv.{schedule.level}
                      </span>
                      <span className="consecutive-correct">
                        連続正解: {schedule.consecutiveCorrect}回
                      </span>
                    </div>
                  </div>
                );
              })}
              {reviewQuestions.length > 5 && (
                <div className="more-questions">
                  他 {reviewQuestions.length - 5}問
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-review">
            <p>現在復習対象の問題はありません。</p>
            <p>問題を解くと自動的に復習スケジュールが作成されます。</p>
          </div>
        )}
      </div>

      {/* 今後の復習予定 */}
      {upcomingQuestions.length > 0 && (
        <div className="upcoming-section">
          <h3>今後の復習予定</h3>
          <div className="upcoming-list">
            {upcomingQuestions.map(question => {
              const schedule = reviewSchedule[question.number];
              return (
                <div key={question.number} className="upcoming-item">
                  <div className="upcoming-date">
                    {formatDate(schedule.nextReview)}
                  </div>
                  <div className="upcoming-question">
                    <span className="question-number">問題 {question.number}</span>
                    <span className="question-preview">
                      {question.question.substring(0, 30)}...
                    </span>
                  </div>
                  <div className="upcoming-level">
                    <span 
                      className="review-level small"
                      style={{ backgroundColor: getLevelColor(schedule.level) }}
                    >
                      Lv.{schedule.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 復習システムの説明 */}
      <div className="review-explanation">
        <h3>復習システムについて</h3>
        <ul>
          <li>問題を正解すると復習レベルが上がり、次回復習日が延期されます</li>
          <li>間違えると復習レベルが下がり、翌日に復習対象となります</li>
          <li>レベル0: 1日後 → レベル1: 3日後 → レベル2: 1週間後 → レベル3: 2週間後 → レベル4: 1ヶ月後 → レベル5: 3ヶ月後</li>
          <li>効率的な記憶定着のため、適切なタイミングで復習しましょう</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewSchedule;