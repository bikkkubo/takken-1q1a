import React from 'react';

const ConfirmDialog = ({ isOpen, mode, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const getModeText = (mode) => {
    const modeTexts = {
      all: '全問スタート',
      random: 'ランダムスタート',
      adaptive: 'おすすめ学習'
    };
    return modeTexts[mode] || mode;
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h3>続きから始めますか？</h3>
        </div>
        <div className="dialog-content">
          <p>{getModeText(mode)}の途中のセッションがあります。</p>
          <p>続きから始めますか？それとも新しく始めますか？</p>
        </div>
        <div className="dialog-actions">
          <button 
            onClick={() => onConfirm(true)}
            className="dialog-button primary"
          >
            続きから始める
          </button>
          <button 
            onClick={() => onConfirm(false)}
            className="dialog-button secondary"
          >
            新しく始める
          </button>
          <button 
            onClick={onCancel}
            className="dialog-button cancel"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;