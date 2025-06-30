import React, { useState, useMemo } from 'react';

const MemoList = ({ memos, allQuestions, onMemoChange, onGoHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMemo, setEditingMemo] = useState(null);
  const [editText, setEditText] = useState('');

  // メモがある問題のリストを作成
  const memosWithQuestions = useMemo(() => {
    const memoEntries = Object.entries(memos).filter(([, memo]) => memo.trim() !== '');
    
    return memoEntries.map(([questionNumber, memo]) => {
      const question = allQuestions.find(q => q.number.toString() === questionNumber);
      return {
        questionNumber: parseInt(questionNumber),
        memo,
        question: question || null
      };
    }).sort((a, b) => a.questionNumber - b.questionNumber);
  }, [memos, allQuestions]);

  // 検索フィルタ
  const filteredMemos = useMemo(() => {
    if (!searchQuery.trim()) return memosWithQuestions;
    
    const query = searchQuery.toLowerCase();
    return memosWithQuestions.filter(item => 
      item.memo.toLowerCase().includes(query) ||
      (item.question && item.question.question.toLowerCase().includes(query)) ||
      (item.question && item.question.explanation.toLowerCase().includes(query))
    );
  }, [memosWithQuestions, searchQuery]);

  const handleEditStart = (questionNumber, currentMemo) => {
    setEditingMemo(questionNumber);
    setEditText(currentMemo);
  };

  const handleEditSave = (questionNumber) => {
    onMemoChange(questionNumber, editText);
    setEditingMemo(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingMemo(null);
    setEditText('');
  };

  const handleMemoDelete = (questionNumber) => {
    if (window.confirm('このメモを削除しますか？')) {
      onMemoChange(questionNumber, '');
    }
  };

  return (
    <div className="memo-list-container">
      <div className="memo-list-header">
        <h2>メモ一覧</h2>
        <button onClick={onGoHome} className="home-button">ホームに戻る</button>
      </div>

      {/* 検索バー */}
      <div className="memo-search">
        <input
          type="text"
          placeholder="メモ・問題文・解説を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="memo-search-input"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')} 
            className="clear-search-button"
          >
            ×
          </button>
        )}
      </div>

      {/* 統計情報 */}
      <div className="memo-stats">
        <div className="memo-stat-item">
          <span className="memo-stat-value">{memosWithQuestions.length}</span>
          <span className="memo-stat-label">総メモ数</span>
        </div>
        <div className="memo-stat-item">
          <span className="memo-stat-value">{filteredMemos.length}</span>
          <span className="memo-stat-label">表示中</span>
        </div>
      </div>

      {/* メモリスト */}
      <div className="memo-items">
        {filteredMemos.length === 0 ? (
          <div className="no-memos">
            {searchQuery ? (
              <p>検索条件に一致するメモがありません。</p>
            ) : (
              <p>メモがありません。<br/>問題解答時にメモを追加してください。</p>
            )}
          </div>
        ) : (
          filteredMemos.map(({ questionNumber, memo, question }) => (
            <div key={questionNumber} className="memo-item">
              {/* 問題情報 */}
              <div className="memo-question-header">
                <span className="memo-question-number">問題 {questionNumber}</span>
                {question && (
                  <span className="memo-question-year">{question.year}年</span>
                )}
              </div>

              {/* 問題文 */}
              {question && (
                <div className="memo-question-section">
                  <h4>問題文</h4>
                  <p className="memo-question-text">{question.question}</p>
                  <div className="memo-answer-info">
                    <span className="memo-correct-answer">正解: {question.result}</span>
                  </div>
                </div>
              )}

              {/* メモ */}
              <div className="memo-section">
                <div className="memo-section-header">
                  <h4>メモ</h4>
                  <div className="memo-actions">
                    <button 
                      onClick={() => handleEditStart(questionNumber, memo)}
                      className="memo-edit-button"
                    >
                      編集
                    </button>
                    <button 
                      onClick={() => handleMemoDelete(questionNumber)}
                      className="memo-delete-button"
                    >
                      削除
                    </button>
                  </div>
                </div>
                
                {editingMemo === questionNumber ? (
                  <div className="memo-edit-form">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="memo-edit-textarea"
                      rows="4"
                    />
                    <div className="memo-edit-actions">
                      <button 
                        onClick={() => handleEditSave(questionNumber)}
                        className="memo-save-button"
                      >
                        保存
                      </button>
                      <button 
                        onClick={handleEditCancel}
                        className="memo-cancel-button"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="memo-content">{memo}</p>
                )}
              </div>

              {/* 解説 */}
              {question && (
                <div className="memo-explanation-section">
                  <h4>解説</h4>
                  <p className="memo-explanation-text">{question.explanation}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoList;