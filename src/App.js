import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Question from './components/Question';
import Answer from './components/Answer';
import WeaknessList from './components/WeaknessList';
import Statistics from './components/Statistics';
import Categories from './components/Categories';
import Search from './components/Search';
import ReviewSchedule from './components/ReviewSchedule';
import QuestionAnalytics from './components/QuestionAnalytics';
import ConfirmDialog from './components/ConfirmDialog';
import OfflineIndicator from './components/OfflineIndicator';
import InstallPrompt from './components/InstallPrompt';
import questionsData from './data.json';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [view, setView] = useState('home'); // home, question, answer, weaknessList, statistics, categories, search, review, analytics
  const [isCorrect, setIsCorrect] = useState(false);
  const [weaknesses, setWeaknesses] = useState(() => {
    const saved = localStorage.getItem('weaknesses');
    return saved ? JSON.parse(saved) : [];
  });

  // メモ機能の状態管理
  const [memos, setMemos] = useState(() => {
    const saved = localStorage.getItem('memos');
    return saved ? JSON.parse(saved) : {};
  });

  // 復習スケジュール機能の状態管理
  const [reviewSchedule, setReviewSchedule] = useState(() => {
    const saved = localStorage.getItem('reviewSchedule');
    return saved ? JSON.parse(saved) : {};
  });

  // 問題別統計情報の状態管理
  const [questionStats, setQuestionStats] = useState(() => {
    const saved = localStorage.getItem('questionStats');
    return saved ? JSON.parse(saved) : {};
  });

  // 統計情報の状態管理
  const [statistics, setStatistics] = useState(() => {
    const saved = localStorage.getItem('statistics');
    return saved ? JSON.parse(saved) : {
      totalSessions: 0,
      totalAnswered: 0,
      correctAnswers: 0,
      totalTime: 0,
      maxStreak: 0,
      currentStreak: 0,
      recentSessions: []
    };
  });

  // セッション管理
  const [sessionData, setSessionData] = useState({
    startTime: null,
    currentSessionCorrect: 0,
    currentSessionTotal: 0,
    questionStartTime: null
  });

  // 進行状況の保存
  const [sessionProgress, setSessionProgress] = useState(() => {
    const saved = localStorage.getItem('sessionProgress');
    return saved ? JSON.parse(saved) : {};
  });

  // 確認ダイアログの状態
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    mode: null,
    onConfirm: null
  });

  useEffect(() => {
    localStorage.setItem('weaknesses', JSON.stringify(weaknesses));
  }, [weaknesses]);

  useEffect(() => {
    localStorage.setItem('memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem('reviewSchedule', JSON.stringify(reviewSchedule));
  }, [reviewSchedule]);

  useEffect(() => {
    localStorage.setItem('questionStats', JSON.stringify(questionStats));
  }, [questionStats]);

  useEffect(() => {
    localStorage.setItem('statistics', JSON.stringify(statistics));
  }, [statistics]);

  useEffect(() => {
    localStorage.setItem('sessionProgress', JSON.stringify(sessionProgress));
  }, [sessionProgress]);

  const handleStart = (mode) => {
    if (mode === 'weakness') {
      setView('weaknessList');
      return;
    }
    if (mode === 'statistics') {
      setView('statistics');
      return;
    }
    if (mode === 'categories') {
      setView('categories');
      return;
    }
    if (mode === 'search') {
      setView('search');
      return;
    }
    if (mode === 'review') {
      setView('review');
      return;
    }
    if (mode === 'analytics') {
      setView('analytics');
      return;
    }

    // 進行中のセッションがあるかチェック
    const hasProgress = sessionProgress[mode] && sessionProgress[mode].currentIndex > 0;
    
    if (hasProgress) {
      setConfirmDialog({
        isOpen: true,
        mode: mode,
        onConfirm: (continueSession) => {
          if (continueSession) {
            resumeSession(mode);
          } else {
            startNewSession(mode);
          }
          setConfirmDialog({ isOpen: false, mode: null, onConfirm: null });
        }
      });
      return;
    }

    startNewSession(mode);
  };

  const startNewSession = (mode) => {
    // セッション開始
    const now = Date.now();
    setSessionData({
      startTime: now,
      currentSessionCorrect: 0,
      currentSessionTotal: 0,
      questionStartTime: now
    });

    let questionsToShow = [];
    if (mode === 'random') {
        questionsToShow = [...questionsData].sort(() => Math.random() - 0.5);
    } else if (mode === 'adaptive') {
        questionsToShow = getAdaptiveQuestions();
    } else {
        questionsToShow = questionsData;
    }
    setQuestions(questionsToShow);
    setCurrentQuestionIndex(0);
    
    // 進行状況を保存
    setSessionProgress(prev => ({
      ...prev,
      [mode]: {
        questions: questionsToShow,
        currentIndex: 0,
        startTime: now,
        sessionCorrect: 0,
        sessionTotal: 0
      }
    }));
    
    setView('question');
  };

  const resumeSession = (mode) => {
    const progress = sessionProgress[mode];
    if (progress) {
      const now = Date.now();
      setSessionData({
        startTime: progress.startTime,
        currentSessionCorrect: progress.sessionCorrect,
        currentSessionTotal: progress.sessionTotal,
        questionStartTime: now
      });
      setQuestions(progress.questions);
      setCurrentQuestionIndex(progress.currentIndex);
      setView('question');
    }
  };

  const startWeaknessQuiz = () => {
    const weaknessQuestions = questionsData.filter(q => weaknesses.includes(q.number));
    
    // セッション開始
    const now = Date.now();
    setSessionData({
      startTime: now,
      currentSessionCorrect: 0,
      currentSessionTotal: 0,
      questionStartTime: now
    });

    setQuestions(weaknessQuestions);
    setCurrentQuestionIndex(0);
    setView('question');
  }

  const startCategoryQuiz = (categoryQuestions) => {
    // セッション開始
    const now = Date.now();
    setSessionData({
      startTime: now,
      currentSessionCorrect: 0,
      currentSessionTotal: 0,
      questionStartTime: now
    });

    setQuestions(categoryQuestions);
    setCurrentQuestionIndex(0);
    setView('question');
  }

  const startSearchQuiz = (searchQuestions) => {
    // セッション開始
    const now = Date.now();
    setSessionData({
      startTime: now,
      currentSessionCorrect: 0,
      currentSessionTotal: 0,
      questionStartTime: now
    });

    setQuestions(searchQuestions);
    setCurrentQuestionIndex(0);
    setView('question');
  }

  const startReviewQuiz = (reviewQuestions) => {
    // セッション開始
    const now = Date.now();
    setSessionData({
      startTime: now,
      currentSessionCorrect: 0,
      currentSessionTotal: 0,
      questionStartTime: now
    });

    setQuestions(reviewQuestions);
    setCurrentQuestionIndex(0);
    setView('question');
  }

  const handleAnswer = (userAnswer) => {
    const correctAnswer = questions[currentQuestionIndex].result;
    const correct = userAnswer === correctAnswer;
    setIsCorrect(correct);

    // 統計情報の更新
    const now = Date.now();

    // セッションデータの更新
    const updatedSessionData = {
      currentSessionCorrect: sessionData.currentSessionCorrect + (correct ? 1 : 0),
      currentSessionTotal: sessionData.currentSessionTotal + 1,
      questionStartTime: now
    };
    
    setSessionData(prev => ({
      ...prev,
      ...updatedSessionData
    }));
    
    // 進行状況を更新（現在のモードを特定）
    updateSessionProgress(updatedSessionData);

    // 統計情報の更新
    setStatistics(prev => {
      const newStreak = correct ? prev.currentStreak + 1 : 0;
      return {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak)
      };
    });

    // 復習スケジュールの更新
    updateReviewSchedule(questions[currentQuestionIndex].number, correct);

    // 問題別統計の更新
    updateQuestionStats(questions[currentQuestionIndex].number, correct);

    if (!correct) {
        const questionNumber = questions[currentQuestionIndex].number;
        if (!weaknesses.includes(questionNumber)) {
            setWeaknesses([...weaknesses, questionNumber]);
        }
    }
    setView('answer');
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setSessionData(prev => ({
        ...prev,
        questionStartTime: Date.now()
      }));
      
      // 進行状況を更新
      updateSessionProgressIndex(newIndex);
      
      setView('question');
    } else {
      // セッション終了処理
      const sessionEndTime = Date.now();
      const sessionDuration = sessionData.startTime ? 
        Math.round((sessionEndTime - sessionData.startTime) / 1000) : 0;

      setStatistics(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalTime: prev.totalTime + sessionDuration,
        recentSessions: [
          ...prev.recentSessions,
          {
            date: sessionEndTime,
            correct: sessionData.currentSessionCorrect,
            total: sessionData.currentSessionTotal,
            time: sessionDuration
          }
        ].slice(-50) // 最新50セッションのみ保持
      }));
      
      // セッション終了時に進行状況をクリア
      clearSessionProgress();

      setView('home');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      setSessionData(prev => ({
        ...prev,
        questionStartTime: Date.now()
      }));
      
      // 進行状況を更新
      updateSessionProgressIndex(newIndex);
      
      setView('question');
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setSessionData(prev => ({
        ...prev,
        questionStartTime: Date.now()
      }));
      
      // 進行状況を更新
      updateSessionProgressIndex(index);
      
      setView('question');
    }
  };

  const toggleWeakness = (questionNumber) => {
    if (weaknesses.includes(questionNumber)) {
      setWeaknesses(weaknesses.filter(n => n !== questionNumber));
    } else {
      setWeaknesses([...weaknesses, questionNumber]);
    }
  };

  const isCurrentWeakness = () => {
      if(questions.length > 0) {
          return weaknesses.includes(questions[currentQuestionIndex].number);
      }
      return false;
  }

  const handleMemoChange = (questionNumber, memo) => {
    setMemos(prev => ({
      ...prev,
      [questionNumber]: memo
    }));
  };

  const getCurrentMemo = () => {
    if (questions.length > 0) {
      return memos[questions[currentQuestionIndex].number] || '';
    }
    return '';
  };

  // 復習スケジュール管理
  const updateReviewSchedule = (questionNumber, correct) => {
    const now = Date.now();
    const currentSchedule = reviewSchedule[questionNumber] || {
      level: 0,
      consecutiveCorrect: 0,
      lastReviewed: now,
      nextReview: now
    };

    if (correct) {
      // 正解の場合、レベルを上げて次回復習日を遅らせる
      const newLevel = Math.min(currentSchedule.level + 1, 5);
      const intervals = [1, 3, 7, 14, 30, 90]; // 日数
      const nextReviewDate = now + (intervals[newLevel] * 24 * 60 * 60 * 1000);

      setReviewSchedule(prev => ({
        ...prev,
        [questionNumber]: {
          level: newLevel,
          consecutiveCorrect: currentSchedule.consecutiveCorrect + 1,
          lastReviewed: now,
          nextReview: nextReviewDate
        }
      }));
    } else {
      // 不正解の場合、レベルを下げて次回復習日を早める
      const newLevel = Math.max(currentSchedule.level - 1, 0);
      const nextReviewDate = now + (24 * 60 * 60 * 1000); // 1日後

      setReviewSchedule(prev => ({
        ...prev,
        [questionNumber]: {
          level: newLevel,
          consecutiveCorrect: 0,
          lastReviewed: now,
          nextReview: nextReviewDate
        }
      }));
    }
  };

  // 復習対象の問題を取得
  const getReviewQuestions = () => {
    const now = Date.now();
    return questionsData.filter(question => {
      const schedule = reviewSchedule[question.number];
      return schedule && schedule.nextReview <= now;
    });
  };

  // レベル判定機能
  const getUserLevel = () => {
    if (statistics.totalAnswered < 10) return 'beginner';
    
    const accuracy = statistics.correctAnswers / statistics.totalAnswered;
    const streak = statistics.maxStreak;
    
    if (accuracy >= 0.9 && streak >= 20) return 'expert';
    if (accuracy >= 0.8 && streak >= 10) return 'advanced';
    if (accuracy >= 0.7 && streak >= 5) return 'intermediate';
    return 'beginner';
  };

  const getAdaptiveQuestions = () => {
    const userLevel = getUserLevel();
    const answeredQuestions = Object.keys(reviewSchedule);
    
    // 既に解いた問題の習熟度別分類
    const levelCategories = {
      mastered: [], // レベル4以上
      learning: [], // レベル1-3
      struggling: [] // レベル0
    };

    answeredQuestions.forEach(questionNumber => {
      const schedule = reviewSchedule[questionNumber];
      if (schedule.level >= 4) {
        levelCategories.mastered.push(parseInt(questionNumber));
      } else if (schedule.level >= 1) {
        levelCategories.learning.push(parseInt(questionNumber));
      } else {
        levelCategories.struggling.push(parseInt(questionNumber));
      }
    });

    // 未回答問題
    const unansweredQuestions = questionsData.filter(q => 
      !answeredQuestions.includes(q.number.toString())
    );

    let selectedQuestions = [];

    switch (userLevel) {
      case 'expert':
        // 上級者：未回答問題中心 + 苦手問題の復習
        selectedQuestions = [
          ...unansweredQuestions.slice(0, 15),
          ...questionsData.filter(q => levelCategories.struggling.includes(q.number)).slice(0, 5)
        ];
        break;
      
      case 'advanced':
        // 中上級者：未回答問題 + 学習中問題 + 苦手問題
        selectedQuestions = [
          ...unansweredQuestions.slice(0, 10),
          ...questionsData.filter(q => levelCategories.learning.includes(q.number)).slice(0, 5),
          ...questionsData.filter(q => levelCategories.struggling.includes(q.number)).slice(0, 5)
        ];
        break;
      
      case 'intermediate':
        // 中級者：苦手問題中心 + 学習中問題 + 少し新問題
        selectedQuestions = [
          ...questionsData.filter(q => levelCategories.struggling.includes(q.number)).slice(0, 8),
          ...questionsData.filter(q => levelCategories.learning.includes(q.number)).slice(0, 7),
          ...unansweredQuestions.slice(0, 5)
        ];
        break;
      
      default: // 'beginner'
        // 初級者：未回答問題中心
        selectedQuestions = unansweredQuestions.slice(0, 20);
        break;
    }

    return selectedQuestions.length > 0 ? selectedQuestions : questionsData.slice(0, 20);
  };

  // 問題別統計の更新
  const updateQuestionStats = (questionNumber, correct) => {
    setQuestionStats(prev => {
      const currentStats = prev[questionNumber] || {
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0
      };

      const newTotalAttempts = currentStats.totalAttempts + 1;
      const newCorrectAttempts = currentStats.correctAttempts + (correct ? 1 : 0);
      const newAccuracy = (newCorrectAttempts / newTotalAttempts) * 100;

      return {
        ...prev,
        [questionNumber]: {
          totalAttempts: newTotalAttempts,
          correctAttempts: newCorrectAttempts,
          accuracy: Math.round(newAccuracy * 10) / 10 // 小数点第1位まで
        }
      };
    });
  };

  // 問題の統計情報を取得
  const getQuestionStats = (questionNumber) => {
    return questionStats[questionNumber] || {
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0
    };
  };

  // 現在のセッションモードを特定
  const getCurrentSessionMode = () => {
    for (const [mode, progress] of Object.entries(sessionProgress)) {
      if (progress && JSON.stringify(progress.questions) === JSON.stringify(questions)) {
        return mode;
      }
    }
    return null;
  };

  // 進行状況の更新
  const updateSessionProgress = (updatedSessionData) => {
    const currentMode = getCurrentSessionMode();
    if (currentMode) {
      setSessionProgress(prev => ({
        ...prev,
        [currentMode]: {
          ...prev[currentMode],
          currentIndex: currentQuestionIndex,
          sessionCorrect: updatedSessionData.currentSessionCorrect,
          sessionTotal: updatedSessionData.currentSessionTotal
        }
      }));
    }
  };

  // 進行状況のインデックス更新
  const updateSessionProgressIndex = (newIndex) => {
    const currentMode = getCurrentSessionMode();
    if (currentMode) {
      setSessionProgress(prev => ({
        ...prev,
        [currentMode]: {
          ...prev[currentMode],
          currentIndex: newIndex
        }
      }));
    }
  };

  // 進行状況のクリア
  const clearSessionProgress = () => {
    const currentMode = getCurrentSessionMode();
    if (currentMode) {
      setSessionProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[currentMode];
        return newProgress;
      });
    }
  };

  return (
    <div className="App">
      <OfflineIndicator />
      {view === 'home' && (
        <Home 
          onStart={handleStart} 
          reviewCount={getReviewQuestions().length}
          userLevel={getUserLevel()}
          totalAnswered={statistics.totalAnswered}
        />
      )}
      {view === 'weaknessList' && 
        <WeaknessList 
            weaknesses={weaknesses} 
            allQuestions={questionsData}
            onStartQuiz={startWeaknessQuiz}
            onRemoveWeakness={toggleWeakness}
            onGoHome={() => setView('home')}
        />}
      {view === 'statistics' &&
        <Statistics 
          stats={{...statistics, weaknessCount: weaknesses.length}}
          onGoHome={() => setView('home')}
        />}
      {view === 'categories' &&
        <Categories 
          allQuestions={questionsData}
          onStartQuiz={startCategoryQuiz}
          onGoHome={() => setView('home')}
        />}
      {view === 'search' &&
        <Search 
          allQuestions={questionsData}
          onStartQuiz={startSearchQuiz}
          onGoHome={() => setView('home')}
        />}
      {view === 'review' &&
        <ReviewSchedule 
          allQuestions={questionsData}
          reviewSchedule={reviewSchedule}
          onStartQuiz={startReviewQuiz}
          onGoHome={() => setView('home')}
        />}
      {view === 'analytics' &&
        <QuestionAnalytics 
          allQuestions={questionsData}
          questionStats={questionStats}
          onGoHome={() => setView('home')}
        />}
      {view === 'question' && questions.length > 0 && (
        <Question 
          question={questions[currentQuestionIndex]} 
          onAnswer={handleAnswer}
          sessionData={sessionData}
          onGoHome={() => setView('home')}
          onPrevious={handlePrevious}
          onNext={() => goToQuestion(currentQuestionIndex + 1)}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          questionStats={getQuestionStats(questions[currentQuestionIndex].number)}
        />
      )}
      {view === 'answer' && questions.length > 0 && (
        <Answer 
          question={questions[currentQuestionIndex]} 
          isCorrect={isCorrect} 
          onNext={handleNext} 
          onToggleWeakness={() => toggleWeakness(questions[currentQuestionIndex].number)}
          isWeakness={isCurrentWeakness()}
          memo={getCurrentMemo()}
          onMemoChange={(memo) => handleMemoChange(questions[currentQuestionIndex].number, memo)}
          onGoHome={() => setView('home')}
          onPrevious={handlePrevious}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />
      )}
      
      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        mode={confirmDialog.mode}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, mode: null, onConfirm: null })}
      />
      
      {/* PWAインストールプロンプト */}
      <InstallPrompt />
    </div>
  );
}

export default App;