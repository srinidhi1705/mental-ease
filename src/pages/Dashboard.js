import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  Brain, 

  BookOpen, 
  Award, 
  Library,
  TrendingUp,
  Calendar,
  Zap,
  Smile,
  BarChart3,
  Heart
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const { user } = useAuth();
  const [moodInsights, setMoodInsights] = useState(null);
  const [chatStats, setChatStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('mentalease_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const [dashboardInsights, setDashboardInsights] = useState(null);
  const [quizInsights, setQuizInsights] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [moodResponse, chatResponse, insightsResponse, quizResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/mood/insights`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/chat/history`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/dashboard/insights`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/dashboard/quiz-insights`, { headers: getAuthHeaders() })
      ]);

      if (moodResponse.ok) {
        const moodData = await moodResponse.json();
        setMoodInsights(moodData);
      }

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        setChatStats({
          totalChats: chatData.history.length,
          recentChats: chatData.history.slice(0, 3)
        });
      }

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setDashboardInsights(insightsData);
      }

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuizInsights(quizData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Chat Support',
      description: 'Talk to our AI wellness companion',
      icon: MessageCircle,
      path: '/chatbot',
      color: 'from-primary-400 to-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Take Quiz',
      description: 'Assess your current wellbeing',
      icon: Brain,
      path: '/quizzes',
      color: 'from-secondary-400 to-secondary-600',
      bgColor: 'bg-secondary-50'
    },
    {
      title: 'Mood Check',
      description: 'Track how you\'re feeling today',
      icon: Heart,
      path: '/mood-tracker',
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Journal',
      description: 'Reflect on your thoughts and feelings',
      icon: BookOpen,
      path: '/journal',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'My Progress',
      description: 'View badges and achievements',
      icon: Award,
      path: '/gamification',
      color: 'from-accent-400 to-accent-600',
      bgColor: 'bg-accent-50'
    },
    {
      title: 'Resources',
      description: 'Explore wellness articles and tips',
      icon: Library,
      path: '/resources',
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const stats = [
    {
      label: 'Current Streak',
      value: user?.streak || 0,
      unit: 'days',
      icon: Zap,
      color: 'text-accent-600'
    },
    {
      label: 'Mood Entries',
      value: moodInsights?.total_entries || 0,
      unit: 'entries',
      icon: Smile,
      color: 'text-pink-600'
    },
    {
      label: 'Chat Messages',
      value: chatStats?.totalChats || 0,
      unit: 'messages',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      label: 'Registered Since',
      value: Math.floor((new Date() - new Date(user?.joinDate)) / (1000 * 60 * 60 * 24)) || 0,
      unit: 'days',
      icon: Calendar,
      color: 'text-secondary-600'
    }
  ];

  const recentBadges = user?.badges?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 dashboard-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to continue your wellness journey today?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                    <span className="text-lg font-normal text-gray-500 ml-1">{stat.unit}</span>
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="card p-6 group-hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl ${action.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quiz Insights */}
        {quizInsights && quizInsights.has_quiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🧠 Mental Health Assessment</h2>
            
            {/* Critical Alert */}
            {quizInsights.quiz_summary.critical_flag && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="card p-6 mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-full bg-red-100">
                    🚨
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-red-800">
                      Immediate Support Recommended
                    </h4>
                    <p className="mt-1 text-red-700">
                      Your recent assessment indicates you may benefit from professional support. Please consider reaching out to a mental health professional.
                    </p>
                    <div className="mt-3">
                      <a
                        href="tel:988"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Crisis
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quiz Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Brain className="mr-2 h-6 w-6 text-primary-600" />
                  Latest Assessment Results
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(quizInsights.quiz_summary.timestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                    quizInsights.quiz_summary.overall_severity === 'severe' ? 'bg-red-100 text-red-600' :
                    quizInsights.quiz_summary.overall_severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {quizInsights.quiz_summary.overall_severity === 'severe' ? '😟' :
                     quizInsights.quiz_summary.overall_severity === 'moderate' ? '😐' : '😊'}
                  </div>
                  <p className="text-sm text-gray-600">Overall Level</p>
                  <p className="font-semibold capitalize">{quizInsights.quiz_summary.overall_severity}</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-3">
                    🎯
                  </div>
                  <p className="text-sm text-gray-600">Areas of Focus</p>
                  <p className="font-semibold">{quizInsights.quiz_summary.main_concerns?.length || 0}</p>
                </div>
              </div>

              {quizInsights.quiz_summary.main_concerns?.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Main Concerns:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quizInsights.quiz_summary.main_concerns.map((concern, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalized Suggestions */}
              {quizInsights.suggestions?.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    💡 Personalized Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {quizInsights.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <span className="text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {quizInsights.next_steps?.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    🎯 Recommended Next Steps
                  </h4>
                  <div className="space-y-3">
                    {quizInsights.next_steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium mr-3 ${
                          step.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          step.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          step.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {step.priority}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{step.action}</p>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wellness Tip */}
              {quizInsights.wellness_tip && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    🌟 Personal Wellness Tip
                  </h4>
                  <p className="text-gray-700">{quizInsights.wellness_tip}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* No Quiz Taken Yet */}
        {quizInsights && !quizInsights.has_quiz && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card p-6 text-center bg-gradient-to-r from-primary-50 to-secondary-50">
              <Brain className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Take Your Mental Health Assessment
              </h3>
              <p className="text-gray-600 mb-4">
                Get personalized insights and recommendations based on your current wellbeing.
              </p>
              <Link
                to="/quiz"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Assessment
                <Brain className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Recent Activity & Mood Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Mood Insights</h3>
              <Link to="/mood-tracker" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View Details
              </Link>
            </div>
            
            {moodInsights && moodInsights.total_entries > 0 ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Heart className="h-6 w-6 text-pink-500" />
                    <span className="font-medium text-gray-900">Most Common Mood</span>
                  </div>
                  <p className="text-lg font-semibold text-pink-600 capitalize">
                    {moodInsights.most_common_mood}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {moodInsights.message}
                  </p>
                </div>
                
                {moodInsights.mood_distribution && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Recent Mood Distribution</h4>
                    {Object.entries(moodInsights.mood_distribution).slice(0, 3).map(([mood, count]) => (
                      <div key={mood} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{mood}</span>
                        <span className="text-sm font-medium text-gray-900">{count} times</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No mood data yet</p>
                <p className="text-sm text-gray-400">Start tracking your mood to see insights!</p>
                <Link 
                  to="/mood-tracker" 
                  className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Track Your Mood
                </Link>
              </div>
            )}
          </motion.div>

          {/* Wellness Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card p-6 bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
          >
            <h3 className="text-xl font-semibold mb-4">💡 Today's Wellness Tip</h3>
            <p className="text-primary-100 mb-4">
              "Take a moment to practice deep breathing. Inhale for 4 counts, hold for 4, 
              and exhale for 6. This simple technique can help reduce stress and anxiety."
            </p>
            <Link 
              to="/resources" 
              className="inline-flex items-center text-white hover:text-primary-100 font-medium"
            >
              Explore More Tips
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;