import React, { useState, useMemo } from 'react';

const Search = ({ allQuestions, onStartQuiz, onGoHome }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, question, answer

  // 検索結果を計算
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase().trim();
    
    return allQuestions.filter(question => {
      switch (searchType) {
        case 'question':
          return question.question.toLowerCase().includes(term);
        case 'answer':
          return question.answer.toLowerCase().includes(term);
        default: // 'all'
          return question.question.toLowerCase().includes(term) || 
                 question.answer.toLowerCase().includes(term);
      }
    });
  }, [searchTerm, searchType, allQuestions]);

  // 検索語をハイライト
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  const handleStartSearchQuiz = (mode = 'all') => {
    if (searchResults.length === 0) return;
    
    let questionsToShow = searchResults;
    if (mode === 'random') {
      questionsToShow = [...searchResults].sort(() => Math.random() - 0.5);
    }
    
    onStartQuiz(questionsToShow);
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>問題検索</h2>
        <button onClick={onGoHome} className="home-button">ホームに戻る</button>
      </div>
      
      <div className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="検索キーワードを入力..."
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="clear-button"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="search-options">
          <label>
            <input
              type="radio"
              value="all"
              checked={searchType === 'all'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            すべて
          </label>
          <label>
            <input
              type="radio"
              value="question"
              checked={searchType === 'question'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            問題文のみ
          </label>
          <label>
            <input
              type="radio"
              value="answer"
              checked={searchType === 'answer'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            解説のみ
          </label>
        </div>
      </div>

      {searchTerm && (
        <div className="search-info">
          <p>{searchResults.length}件の問題が見つかりました</p>
          {searchResults.length > 0 && (
            <div className="search-actions">
              <button 
                onClick={() => handleStartSearchQuiz('all')}
                className="search-quiz-button primary"
              >
                この結果でクイズ開始
              </button>
              <button 
                onClick={() => handleStartSearchQuiz('random')}
                className="search-quiz-button secondary"
              >
                ランダムでクイズ開始
              </button>
            </div>
          )}
        </div>
      )}

      <div className="search-results">
        {searchResults.map((question, index) => (
          <div key={question.number} className="search-result-item">
            <div className="result-header">
              <span className="result-number">問題 {question.number}</span>
              <span className="result-year">{question.year}年</span>
            </div>
            
            <div className="result-question">
              <h4>問題文</h4>
              <p>{highlightText(question.question, searchTerm)}</p>
            </div>
            
            {searchType !== 'question' && (
              <div className="result-answer">
                <h4>解説</h4>
                <p>{highlightText(question.answer, searchTerm)}</p>
              </div>
            )}
            
            <div className="result-footer">
              <span className="result-answer-type">
                正解: {question.result}
              </span>
            </div>
          </div>
        ))}
      </div>

      {searchTerm && searchResults.length === 0 && (
        <div className="no-results">
          <p>「{searchTerm}」に一致する問題が見つかりませんでした。</p>
          <p>別のキーワードで検索してみてください。</p>
        </div>
      )}
    </div>
  );
};

export default Search;