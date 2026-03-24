import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Smile, Frown, Meh, Heart, Sun, AlertCircle, Cloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const MoodTracker = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodInsights, setMoodInsights] = useState(null);
  const [notes, setNotes] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const moods = [
    { id: 1, name: 'happy', icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-100', value: 5, label: 'Happy' },
    { id: 2, name: 'calm', icon: Sun, color: 'text-green-500', bg: 'bg-green-100', value: 4, label: 'Calm' },
    { id: 3, name: 'neutral', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-100', value: 3, label: 'Neutral' },
    { id: 4, name: 'anxious', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100', value: 2, label: 'Anxious' },
    { id: 5, name: 'sad', icon: Frown, color: 'text-red-500', bg: 'bg-red-100', value: 1, label: 'Sad' },
    { id: 6, name: 'angry', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-100', value: 1, label: 'Angry' }
  ];

  useEffect(() => {
    if (user) {
      loadMoodData();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('mentalease_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadMoodData = async () => {
    try {
      const [historyResponse, insightsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/mood/history`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/mood/insights`, { headers: getAuthHeaders() })
      ]);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setMoodHistory(historyData.history);
      }

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setMoodInsights(insightsData);
      }
    } catch (error) {
      console.error('Failed to load mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMood = async () => {
    if (!selectedMood) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mood/track`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          mood: selectedMood.name,
          notes: notes
        }),
      });

      if (response.ok) {
        await loadMoodData(); // Reload data
        setSelectedMood(null);
        setNotes('');
      } else {
        throw new Error('Failed to save mood');
      }
    } catch (error) {
      console.error('Failed to save mood:', error);
      alert('Failed to save mood. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getMoodForDate = (date) => {
    return moodHistory.find(entry => entry.timestamp.split('T')[0] === date);
  };

  const getMoodByName = (moodName) => {
    return moods.find(m => m.name === moodName);
  };

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    const moodValues = moodHistory.map(entry => {
      const mood = getMoodByName(entry.mood);
      return mood ? mood.value : 3;
    });
    const sum = moodValues.reduce((acc, value) => acc + value, 0);
    return (sum / moodValues.length).toFixed(1);
  };

  const getRecentTrend = () => {
    if (moodHistory.length < 2) return 'neutral';
    const recent = moodHistory.slice(0, 7); // Last 7 entries (already sorted by timestamp DESC)
    
    if (recent.length < 2) return 'neutral';
    
    const firstHalf = recent.slice(Math.ceil(recent.length / 2));
    const secondHalf = recent.slice(0, Math.ceil(recent.length / 2));
    
    const getAvgValue = (entries) => {
      const values = entries.map(entry => {
        const mood = getMoodByName(entry.mood);
        return mood ? mood.value : 3;
      });
      return values.reduce((acc, val) => acc + val, 0) / values.length;
    };
    
    const firstAvg = getAvgValue(firstHalf);
    const secondAvg = getAvgValue(secondHalf);
    
    if (secondAvg > firstAvg + 0.5) return 'improving';
    if (secondAvg < firstAvg - 0.5) return 'declining';
    return 'stable';
  };

  const todaysMood = getMoodForDate(currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your mood data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mood Tracker</h1>
          <p className="text-xl text-gray-600">Track your daily mood and see patterns over time</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mood Entry */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">How are you feeling today?</h2>
            </div>

            <div className="mb-6">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {todaysMood ? (
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  {(() => {
                    const mood = getMoodByName(todaysMood.mood);
                    const IconComponent = mood?.icon || Meh;
                    return <IconComponent className={`w-8 h-8 ${mood?.color || 'text-gray-500'}`} />;
                  })()}
                  <span className="text-xl font-semibold text-gray-800 capitalize">
                    You felt {todaysMood.mood} on this day
                  </span>
                </div>
                {todaysMood.notes && (
                  <p className="text-gray-600 italic">"{todaysMood.notes}"</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Recorded on {new Date(todaysMood.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMood(mood)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMood?.id === mood.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <mood.icon className={`w-8 h-8 mx-auto mb-2 ${mood.color}`} />
                      <span className="text-sm font-medium text-gray-700">{mood.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What contributed to this mood? Any thoughts or events..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="3"
                  />
                </div>

                <button
                  onClick={saveMood}
                  disabled={!selectedMood || saving}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? 'Saving...' : 'Save Mood Entry'}
                </button>
              </>
            )}
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Statistics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{getAverageMood()}</div>
                  <div className="text-sm text-gray-600">Average Mood</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{moodHistory.length}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    getRecentTrend() === 'improving' ? 'text-green-600' :
                    getRecentTrend() === 'declining' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {getRecentTrend() === 'improving' ? '↗️' :
                     getRecentTrend() === 'declining' ? '↘️' : '→'}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{getRecentTrend()}</div>
                </div>

                {moodInsights && moodInsights.most_common_mood && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-lg font-bold text-pink-600 capitalize">
                      {moodInsights.most_common_mood}
                    </div>
                    <div className="text-sm text-gray-600">Most Common Mood</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-gray-800">Recent Entries</h3>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {moodHistory.slice(0, 5).map((entry) => {
                  const mood = getMoodByName(entry.mood);
                  const IconComponent = mood?.icon || Meh;
                  return (
                    <div key={entry.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <IconComponent className={`w-5 h-5 ${mood?.color || 'text-gray-500'}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800 capitalize">{entry.mood}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                        {entry.notes && (
                          <div className="text-xs text-gray-600 mt-1 truncate">
                            "{entry.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {moodHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No entries yet</p>
                )}
              </div>
            </div>

            {/* Mood Distribution */}
            {moodInsights && moodInsights.mood_distribution && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-800">Mood Distribution</h3>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(moodInsights.mood_distribution).map(([moodName, count]) => {
                    const mood = getMoodByName(moodName);
                    const IconComponent = mood?.icon || Meh;
                    const percentage = ((count / moodInsights.total_entries) * 100).toFixed(1);
                    
                    return (
                      <div key={moodName} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`w-4 h-4 ${mood?.color || 'text-gray-500'}`} />
                          <span className="text-sm text-gray-700 capitalize">{moodName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{count}</div>
                          <div className="text-xs text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;