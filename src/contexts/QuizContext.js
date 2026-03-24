import React, { createContext, useContext, useState, useCallback } from 'react';

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const [quizUpdateTrigger, setQuizUpdateTrigger] = useState(0);

  const triggerQuizUpdate = useCallback(() => {
    setQuizUpdateTrigger(prev => prev + 1);
  }, []);

  const value = {
    quizUpdateTrigger,
    triggerQuizUpdate
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export default QuizContext;