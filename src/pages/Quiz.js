import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import './Quiz.css';

const API_BASE_URL = 'http://localhost:8000';

const Quiz = () => {
  const { user } = useAuth();
  const { triggerQuizUpdate } = useQuiz();
  const [quizState, setQuizState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizSummary, setQuizSummary] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [error, setError] = useState('');
  const [criticalAlert, setCriticalAlert] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('mentalease_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/start`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setQuizState(data.quiz_state);
        setCurrentQuestion(data.question);
      } else {
        setError('Failed to start quiz');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (selectedAnswer === '' && selectedAnswer !== false && selectedAnswers.length === 0) {
      setError('Please select an answer');
      return;
    }

    setLoading(true);
    try {
      const answer = currentQuestion.type === 'multiple_choice' ? selectedAnswers : selectedAnswer;
      
      const response = await fetch(`${API_BASE_URL}/quiz/answer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          quiz_id: quizState.quiz_id,
          question_id: currentQuestion.question_id,
          answer: answer
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.critical_flag) {
          setCriticalAlert(true);
        }

        if (data.quiz_complete) {
          setQuizComplete(true);
          setQuizSummary(data.summary);
          // Trigger quiz data update across the app
          triggerQuizUpdate();
        } else {
          setCurrentQuestion(data.question);
          setSelectedAnswer('');
          setSelectedAnswers([]);
        }
      } else {
        setError('Failed to submit answer');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChoice = (option) => {
    setSelectedAnswer(option);
    setError('');
  };

  const handleMultipleChoice = (option) => {
    const newAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter(a => a !== option)
      : [...selectedAnswers, option];
    setSelectedAnswers(newAnswers);
    setError('');
  };

  const handleYesNo = (value) => {
    setSelectedAnswer(value);
    setError('');
  };

  const handleScale = (value) => {
    setSelectedAnswer(value);
    setError('');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'severe': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'mild': return '😊';
      case 'moderate': return '😐';
      case 'severe': return '😟';
      default: return '🤔';
    }
  };

  if (loading && !currentQuestion) {
    return (
      <div className="quiz-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizComplete && quizSummary) {
    return (
      <div className="quiz-container">
        <div className="quiz-complete">
          <h2>🎉 Quiz Complete!</h2>
          
          {quizSummary.critical_flag && (
            <div className="critical-alert">
              <h3>🚨 Important Notice</h3>
              <p>Your responses indicate you may benefit from professional support. Please consider reaching out to a mental health professional.</p>
              <div className="crisis-resources">
                <p><strong>Immediate Help:</strong></p>
                <ul>
                  <li>National Suicide Prevention Lifeline: 1800-233-3330</li>
                  <li>Crisis Text Line: Text HOME, Friend or Family</li>
                  <li>Emergency: 112</li>
                </ul>
              </div>
            </div>
          )}

          <div className="quiz-results">
            <h3>Your Results</h3>
            <div className="overall-severity">
              <span className="severity-icon">{getSeverityIcon(quizSummary.overall_severity)}</span>
              <span className="severity-text" style={{ color: getSeverityColor(quizSummary.overall_severity) }}>
                Overall Level: {quizSummary.overall_severity.charAt(0).toUpperCase() + quizSummary.overall_severity.slice(1)}
              </span>
            </div>

            <div className="main-concerns">
              <h4>Areas of Focus:</h4>
              <ul>
                {quizSummary.main_concerns.map((concern, index) => (
                  <li key={index}>{concern}</li>
                ))}
              </ul>
            </div>

            {quizSummary.scores && Object.keys(quizSummary.scores).length > 0 && (
              <div className="detailed-scores">
                <h4>Detailed Assessment:</h4>
                {Object.entries(quizSummary.scores).map(([concern, data]) => (
                  <div key={concern} className="concern-score">
                    <div className="concern-header">
                      <span className="concern-name">{concern}</span>
                      <span 
                        className="concern-severity" 
                        style={{ color: getSeverityColor(data.severity) }}
                      >
                        {data.severity} (Score: {data.score})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="recommendations">
              <h4>💡 Personalized Recommendations:</h4>
              <ul>
                {quizSummary.primary_recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="quiz-actions">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/dashboard'}
            >
              View Detailed Results
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.location.href = '/chatbot'}
            >
              Talk to AI Companion
            </button>
            <button 
              className="btn-outline"
              onClick={() => window.location.reload()}
            >
              Retake Assessment
            </button>
          </div>

          {/* Additional Resources */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Helpful Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">🧘 Mindfulness & Relaxation</h4>
                <p className="text-sm text-gray-600">Practice breathing exercises and meditation techniques</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">📞 Crisis Support</h4>
                <p className="text-sm text-gray-600">24/7 helplines: 988 (Suicide Prevention) | 741741 (Crisis Text)</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">🏫 Campus Resources</h4>
                <p className="text-sm text-gray-600">Visit your campus counseling center for professional support</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">👥 Peer Support</h4>
                <p className="text-sm text-gray-600">Connect with support groups and trusted friends</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          <p>{error || 'Unable to load quiz question'}</p>
          <button onClick={startQuiz} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {criticalAlert && (
        <div className="critical-banner">
          <p>🚨 We notice you may be going through a difficult time. Remember, support is available.</p>
        </div>
      )}

      <div className="quiz-header">
        <h2>Mental Health Assessment</h2>
        <div className="quiz-progress">
          <span>Section: {currentQuestion.section.replace('_', ' ').toUpperCase()}</span>
          {currentQuestion.level && <span>Level: {currentQuestion.level}</span>}
        </div>
      </div>

      <div className="quiz-question">
        <h3>{currentQuestion.question}</h3>
        
        {error && <div className="error-message">{error}</div>}

        <div className="answer-options">
          {currentQuestion.type === 'yes_no' && (
            <div className="yes-no-options">
              <button 
                className={`option-btn ${selectedAnswer === true ? 'selected' : ''}`}
                onClick={() => handleYesNo(true)}
              >
                Yes
              </button>
              <button 
                className={`option-btn ${selectedAnswer === false ? 'selected' : ''}`}
                onClick={() => handleYesNo(false)}
              >
                No
              </button>
            </div>
          )}

          {currentQuestion.type === 'single_choice' && (
            <div className="single-choice-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleSingleChoice(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multiple_choice' && (
            <div className="multiple-choice-options">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selectedAnswers.includes(option)}
                    onChange={() => handleMultipleChoice(option)}
                  />
                  <span className="checkmark"></span>
                  {option}
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'frequency' && (
            <div className="frequency-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleSingleChoice(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'impact' && (
            <div className="impact-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleSingleChoice(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'scale' && currentQuestion.scale && (
            <div className="scale-options">
              <div className="scale-labels">
                <span>0 (Never)</span>
                <span>7 (Every day)</span>
              </div>
              <div className="scale-buttons">
                {currentQuestion.scale.map((value) => (
                  <button
                    key={value}
                    className={`scale-btn ${selectedAnswer === value ? 'selected' : ''}`}
                    onClick={() => handleScale(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="quiz-actions">
          <button 
            className="btn-primary"
            onClick={submitAnswer}
            disabled={loading || (selectedAnswer === '' && selectedAnswer !== false && selectedAnswers.length === 0)}
          >
            {loading ? 'Submitting...' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;