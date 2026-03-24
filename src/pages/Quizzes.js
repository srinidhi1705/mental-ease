import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, Heart, Target } from 'lucide-react';

const Quizzes = () => {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const quizzes = [
    {
      id: 1,
      title: "Mental Health Awareness",
      description: "Test your knowledge about mental health basics",
      questions: [
        {
          question: "What percentage of people experience mental health issues?",
          options: ["10%", "25%", "50%", "75%"],
          correct: 1
        },
        {
          question: "Which is a common symptom of anxiety?",
          options: ["Rapid heartbeat", "Improved focus", "Better sleep", "Increased appetite"],
          correct: 0
        },
        {
          question: "What is the best first step for mental health support?",
          options: ["Ignore the problem", "Talk to someone you trust", "Isolate yourself", "Wait it out"],
          correct: 1
        }
      ]
    },
    {
      id: 2,
      title: "Stress Management",
      description: "Learn about effective stress management techniques",
      questions: [
        {
          question: "Which technique is most effective for immediate stress relief?",
          options: ["Deep breathing", "Caffeine", "Social media", "Multitasking"],
          correct: 0
        },
        {
          question: "How much sleep do adults need for optimal mental health?",
          options: ["4-5 hours", "6-7 hours", "7-9 hours", "10+ hours"],
          correct: 2
        }
      ]
    }
  ];

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === quizzes[currentQuiz].questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < quizzes[currentQuiz].questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizCompleted(false);
  };

  const selectQuiz = (quizIndex) => {
    setCurrentQuiz(quizIndex);
    resetQuiz();
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
            <p className="text-xl text-gray-600 mb-6">
              You scored {score} out of {quizzes[currentQuiz].questions.length}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Quizzes
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return null; // This case is handled by showResult
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mental Health Quizzes</h1>
          <p className="text-xl text-gray-600">Test your knowledge and learn something new</p>
        </motion.div>

        {currentQuestion === 0 && !quizCompleted ? (
          <div className="space-y-8">
            {/* Adaptive Mental Health Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-xl p-8 text-white"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Personalized Mental Health Assessment</h2>
                  <p className="text-primary-100">Get personalized insights and recommendations</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Adaptive questioning based on your responses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI-powered mood and emotion analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Personalized recommendations and resources</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Covers stress, anxiety, mood, and sleep</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Crisis detection and immediate support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-5 h-5" />
                    <span>Track progress over time</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-primary-100">
                  <p>⏱️ Takes 5-10 minutes</p>
                  <p>🔒 Completely confidential</p>
                </div>
                <Link
                  to="/quiz"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg"
                >
                  Start Assessment
                </Link>
              </div>
            </motion.div>

            {/* Educational Quizzes */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Educational Quizzes</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => selectQuiz(index)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {quiz.questions.length} questions
                  </span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Start Quiz
                  </button>
                </div>
              </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {quizzes[currentQuiz].title}
                </h2>
                <span className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {quizzes[currentQuiz].questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / quizzes[currentQuiz].questions.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {quizzes[currentQuiz].questions[currentQuestion].question}
              </h3>
              <div className="space-y-3">
                {quizzes[currentQuiz].questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === index
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowResult(false)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Quizzes
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentQuestion === quizzes[currentQuiz].questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;