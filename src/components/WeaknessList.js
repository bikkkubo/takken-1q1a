
import React from 'react';

const WeaknessList = ({ weaknesses, allQuestions, onStartQuiz, onRemoveWeakness, onGoHome }) => {
  const weaknessQuestions = allQuestions.filter(q => weaknesses.includes(q.number));

  return (
    <div className="weakness-list-container">
      <div className="weakness-list-header">
        <h2>弱点一覧</h2>
        <button onClick={onGoHome} className="home-button">ホームに戻る</button>
      </div>
      {weaknessQuestions.length > 0 ? (
        <>
          <button onClick={onStartQuiz} className="start-weakness-quiz-button">
            このリストの問題でクイズを開始
          </button>
          <ul className="weakness-list">
            {weaknessQuestions.map(q => (
              <li key={q.number}>
                <span>{q.question}</span>
                <button onClick={() => onRemoveWeakness(q.number)}>削除</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>現在、弱点として登録されている問題はありません。</p>
      )}
    </div>
  );
};

export default WeaknessList;
