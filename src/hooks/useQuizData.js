import { useState, useEffect, useCallback } from 'react';
import { useQuiz } from '../contexts/QuizContext';

const API_BASE_URL = 'http://localhost:8000';

export const useQuizData = () => {
  const [quizSummary, setQuizSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Safely get quiz context, fallback to 0 if not available
  let quizUpdateTrigger = 0;
  try {
    const quizContext = useQuiz();
    quizUpdateTrigger = quizContext.quizUpdateTrigger;
  } catch (err) {
    console.warn('QuizContext not available, using fallback');
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('mentalease_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadQuizSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/quiz/summary`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setQuizSummary(data);
        setError(null);
      } else {
        setError('Failed to load quiz data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Failed to load quiz summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshQuizData = useCallback(() => {
    loadQuizSummary();
  }, [loadQuizSummary]);

  useEffect(() => {
    loadQuizSummary();
  }, [loadQuizSummary, quizUpdateTrigger]);

  return {
    quizSummary,
    loading,
    error,
    refreshQuizData
  };
};

export default useQuizData;