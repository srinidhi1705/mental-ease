import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Award, Zap, Calendar, TrendingUp, Gift } from 'lucide-react';
import QuizSummary from '../components/QuizSummary';

const Gamification = () => {
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    xpToNext: 100,
    streak: 0,
    totalPoints: 0,
    completedChallenges: 0
  });

  const [achievements, setAchievements] = useState([]);
  const [dailyChallenges, setDailyChallenges] = useState([]);

  const allAchievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first daily challenge', icon: '🎯', unlocked: false, xp: 50 },
    { id: 2, name: 'Streak Master', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false, xp: 100 },
    { id: 3, name: 'Mood Tracker', description: 'Log your mood for 10 days', icon: '😊', unlocked: false, xp: 75 },
    { id: 4, name: 'Journal Writer', description: 'Write 5 journal entries', icon: '📝', unlocked: false, xp: 80 },
    { id: 5, name: 'Quiz Master', description: 'Complete 3 quizzes with 80% score', icon: '🧠', unlocked: false, xp: 120 },
    { id: 6, name: 'Wellness Warrior', description: 'Reach level 5', icon: '⚡', unlocked: false, xp: 200 },
    { id: 7, name: 'Consistent Learner', description: 'Complete challenges for 30 days', icon: '🏆', unlocked: false, xp: 300 }
  ];

  const challenges = [
    { id: 1, title: 'Morning Reflection', description: 'Write a journal entry about your goals for today', xp: 25, completed: false },
    { id: 2, title: 'Mood Check-in', description: 'Log your current mood and add a note', xp: 15, completed: false },
    { id: 3, title: 'Mindful Moment', description: 'Take 5 minutes for deep breathing or meditation', xp: 20, completed: false },
    { id: 4, title: 'Gratitude Practice', description: 'List 3 things you\'re grateful for today', xp: 20, completed: false },
    { id: 5, title: 'Knowledge Quest', description: 'Complete a mental health quiz', xp: 30, completed: false },
    { id: 6, title: 'Self-Care Activity', description: 'Do something nice for yourself today', xp: 25, completed: false }
  ];

  useEffect(() => {
    // Load user data from localStorage
    const savedStats = localStorage.getItem('userStats');
    const savedAchievements = localStorage.getItem('achievements');
    const savedChallenges = localStorage.getItem('dailyChallenges');
    const lastChallengeDate = localStorage.getItem('lastChallengeDate');
    
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      setAchievements(allAchievements);
    }

    // Reset daily challenges if it's a new day
    const today = new Date().toDateString();
    if (lastChallengeDate !== today) {
      const shuffledChallenges = [...challenges].sort(() => Math.random() - 0.5).slice(0, 3);
      setDailyChallenges(shuffledChallenges);
      localStorage.setItem('dailyChallenges', JSON.stringify(shuffledChallenges));
      localStorage.setItem('lastChallengeDate', today);
    } else if (savedChallenges) {
      setDailyChallenges(JSON.parse(savedChallenges));
    }
  }, []);

  const completeChallenge = (challengeId) => {
    const updatedChallenges = dailyChallenges.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        const newStats = {
          ...userStats,
          xp: userStats.xp + challenge.xp,
          totalPoints: userStats.totalPoints + challenge.xp,
          completedChallenges: userStats.completedChallenges + 1
        };

        // Level up logic
        if (newStats.xp >= newStats.xpToNext) {
          newStats.level += 1;
          newStats.xp = newStats.xp - newStats.xpToNext;
          newStats.xpToNext = Math.floor(newStats.xpToNext * 1.5);
        }

        setUserStats(newStats);
        localStorage.setItem('userStats', JSON.stringify(newStats));
        
        return { ...challenge, completed: true };
      }
      return challenge;
    });

    setDailyChallenges(updatedChallenges);
    localStorage.setItem('dailyChallenges', JSON.stringify(updatedChallenges));
  };

  const getProgressPercentage = () => {
    return (userStats.xp / userStats.xpToNext) * 100;
  };

  const getLevelColor = (level) => {
    if (level < 3) return 'text-green-600';
    if (level < 6) return 'text-blue-600';
    if (level < 10) return 'text-purple-600';
    return 'text-yellow-600';
  };

  const completedToday = dailyChallenges.filter(c => c.completed).length;
  const totalToday = dailyChallenges.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Wellness Journey</h1>
          <p className="text-xl text-gray-600">Level up your mental health with daily challenges and achievements</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold ${getLevelColor(userStats.level)} mb-2`}>
                Level {userStats.level}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {userStats.xp} / {userStats.xpToNext} XP
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-800">Total Points</span>
                </div>
                <span className="font-bold text-yellow-600">{userStats.totalPoints}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-800">Streak</span>
                </div>
                <span className="font-bold text-orange-600">{userStats.streak} days</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">Completed</span>
                </div>
                <span className="font-bold text-green-600">{userStats.completedChallenges}</span>
              </div>
            </div>

            {/* Quiz Summary */}
            <div className="mt-6">
              <QuizSummary variant="compact" showActions={false} />
            </div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Daily Challenges</h2>
              <div className="text-sm text-gray-600">
                {completedToday}/{totalToday} completed
              </div>
            </div>

            <div className="space-y-4">
              {dailyChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    challenge.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 ${
                        challenge.completed ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {challenge.title}
                      </h3>
                      <p className={`text-sm mb-3 ${
                        challenge.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {challenge.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          challenge.completed ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          +{challenge.xp} XP
                        </span>
                        {!challenge.completed && (
                          <button
                            onClick={() => completeChallenge(challenge.id)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                          >
                            Complete
                          </button>
                        )}
                        {challenge.completed && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">Completed!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {completedToday === totalToday && totalToday > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-center"
              >
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold text-lg">All Challenges Complete!</h3>
                <p className="text-sm opacity-90">Great job! Come back tomorrow for new challenges.</p>
              </motion.div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Achievements</h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        achievement.unlocked ? 'text-purple-800' : 'text-gray-600'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-medium ${
                          achievement.unlocked ? 'text-purple-600' : 'text-gray-500'
                        }`}>
                          +{achievement.xp} XP
                        </span>
                        {achievement.unlocked && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Unlocked!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Gift className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-800">Rewards & Milestones</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-bold text-gray-800 mb-2">Level 5 Reward</h3>
              <p className="text-sm text-gray-600 mb-3">Unlock premium journal themes</p>
              <div className={`text-sm font-medium ${userStats.level >= 5 ? 'text-green-600' : 'text-gray-500'}`}>
                {userStats.level >= 5 ? 'Unlocked!' : `${5 - userStats.level} levels to go`}
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-bold text-gray-800 mb-2">Level 10 Reward</h3>
              <p className="text-sm text-gray-600 mb-3">Advanced mood analytics</p>
              <div className={`text-sm font-medium ${userStats.level >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                {userStats.level >= 10 ? 'Unlocked!' : `${10 - userStats.level} levels to go`}
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-bold text-gray-800 mb-2">Level 15 Reward</h3>
              <p className="text-sm text-gray-600 mb-3">Personalized wellness plan</p>
              <div className={`text-sm font-medium ${userStats.level >= 15 ? 'text-green-600' : 'text-gray-500'}`}>
                {userStats.level >= 15 ? 'Unlocked!' : `${15 - userStats.level} levels to go`}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Gamification;