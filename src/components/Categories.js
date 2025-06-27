import React, { useState, useMemo } from 'react';

const Categories = ({ allQuestions, onStartQuiz, onGoHome }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 年代別にカテゴリを作成
  const categories = useMemo(() => {
    const yearCategories = {};
    
    allQuestions.forEach(question => {
      const year = question.year;
      if (!yearCategories[year]) {
        yearCategories[year] = [];
      }
      yearCategories[year].push(question);
    });

    return Object.keys(yearCategories)
      .sort((a, b) => {
        // 平成・令和の順序を考慮したソート
        if (a.startsWith('R') && !b.startsWith('R')) return 1;
        if (!a.startsWith('R') && b.startsWith('R')) return -1;
        if (a.startsWith('R') && b.startsWith('R')) {
          return parseInt(a.substring(1)) - parseInt(b.substring(1));
        }
        return parseInt(a) - parseInt(b);
      })
      .map(year => ({
        id: year,
        name: year.startsWith('R') ? `令和${year.substring(1)}年` : `平成${year}年`,
        questions: yearCategories[year],
        count: yearCategories[year].length
      }));
  }, [allQuestions]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleStartCategoryQuiz = (mode = 'all') => {
    if (!selectedCategory) return;
    
    let questionsToShow = selectedCategory.questions;
    if (mode === 'random') {
      questionsToShow = [...selectedCategory.questions].sort(() => Math.random() - 0.5);
    }
    
    onStartQuiz(questionsToShow);
  };

  if (selectedCategory) {
    return (
      <div className="categories-container">
        <div className="categories-header">
          <h2>{selectedCategory.name}</h2>
          <button onClick={() => setSelectedCategory(null)} className="back-button">
            戻る
          </button>
        </div>
        
        <div className="category-info">
          <p>問題数: {selectedCategory.count}問</p>
        </div>

        <div className="category-actions">
          <button 
            onClick={() => handleStartCategoryQuiz('all')}
            className="category-button primary"
          >
            順番にスタート
          </button>
          <button 
            onClick={() => handleStartCategoryQuiz('random')}
            className="category-button secondary"
          >
            ランダムスタート
          </button>
        </div>

        <div className="question-preview">
          <h3>問題一覧</h3>
          <div className="question-list">
            {selectedCategory.questions.map((question, index) => (
              <div key={question.number} className="question-item">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-text-preview">
                  {question.question.substring(0, 50)}...
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>カテゴリ別学習</h2>
        <button onClick={onGoHome} className="home-button">ホームに戻る</button>
      </div>
      
      <div className="categories-grid">
        {categories.map(category => (
          <div 
            key={category.id}
            className="category-card"
            onClick={() => handleCategorySelect(category)}
          >
            <div className="category-name">{category.name}</div>
            <div className="category-count">{category.count}問</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;