import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useQuizData } from '../hooks/useQuizData';

const QuizSummary = ({ variant = 'compact', showActions = true }) => {
  const { quizSummary, loading } = useQuizData();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatDaysAgo = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!quizSummary || !quizSummary.has_quiz) {
    if (variant === 'compact') {
      return (
        <div className="text-sm text-gray-500 flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          No assessment taken yet
          {showActions && (
            <Link to="/quiz" className="ml-2 text-primary-600 hover:text-primary-700">
              Take Quiz
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center mb-2">
          <Brain className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-700">Mental Health Assessment</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Take our comprehensive assessment to get personalized insights and recommendations.
        </p>
        {showActions && (
          <Link
            to="/quiz"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
          >
            <Brain className="h-4 w-4 mr-1" />
            Start Assessment
          </Link>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg mr-2">{quizSummary.severity_emoji}</span>
          <div>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(quizSummary.overall_severity)}`}>
                {quizSummary.overall_severity}
              </span>
              {quizSummary.critical_flag && (
                <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDaysAgo(quizSummary.days_since)}
            </p>
          </div>
        </div>
        {showActions && (
          <Link
            to="/dashboard"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            View Details
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Critical Alert */}
      {quizSummary.critical_flag && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Support Recommended</p>
              <p className="text-xs text-red-700 mt-1">
                Your assessment indicates you may benefit from professional support.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-primary-600 mr-2" />
          <div>
            <h4 className="font-medium text-gray-900">Latest Assessment</h4>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {formatDaysAgo(quizSummary.days_since)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(quizSummary.overall_severity)}`}>
            {quizSummary.severity_emoji} {quizSummary.overall_severity}
          </span>
        </div>
      </div>

      {quizSummary.primary_concern && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Primary concern:</span> {quizSummary.primary_concern}
          </p>
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-800">{quizSummary.simple_suggestion}</p>
        </div>
      </div>

      {showActions && (
        <div className="flex space-x-2">
          <Link
            to="/dashboard"
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
          >
            View Full Results
          </Link>
          <Link
            to="/quiz"
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            Retake Assessment
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuizSummary;