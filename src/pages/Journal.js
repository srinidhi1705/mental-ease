import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Calendar, Edit3, Trash2, Save, X } from 'lucide-react';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [currentEntry, setCurrentEntry] = useState({ title: '', content: '', mood: 'neutral' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');

  const moods = [
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'text-yellow-500' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: 'text-blue-500' },
    { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'text-red-500' },
    { value: 'excited', label: 'Excited', emoji: '🤩', color: 'text-purple-500' },
    { value: 'calm', label: 'Calm', emoji: '😌', color: 'text-green-500' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-gray-500' }
  ];

  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntries = (newEntries) => {
    setEntries(newEntries);
    localStorage.setItem('journalEntries', JSON.stringify(newEntries));
  };

  const handleSaveEntry = () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) return;

    const entry = {
      id: editingEntry ? editingEntry.id : Date.now(),
      ...currentEntry,
      date: editingEntry ? editingEntry.date : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newEntries;
    if (editingEntry) {
      newEntries = entries.map(e => e.id === editingEntry.id ? entry : e);
    } else {
      newEntries = [entry, ...entries];
    }

    saveEntries(newEntries);
    setCurrentEntry({ title: '', content: '', mood: 'neutral' });
    setIsWriting(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry) => {
    setCurrentEntry(entry);
    setEditingEntry(entry);
    setIsWriting(true);
  };

  const handleDeleteEntry = (id) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    saveEntries(newEntries);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodEmoji = (mood) => {
    const moodObj = moods.find(m => m.value === mood);
    return moodObj ? moodObj.emoji : '😐';
  };

  if (isWriting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
              <button
                onClick={() => {
                  setIsWriting(false);
                  setEditingEntry(null);
                  setCurrentEntry({ title: '', content: '', mood: 'neutral' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={currentEntry.title}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                  placeholder="Give your entry a title..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setCurrentEntry({ ...currentEntry, mood: mood.value })}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        currentEntry.mood === mood.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{mood.emoji}</span>
                      <span className="text-sm font-medium">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your thoughts
                </label>
                <textarea
                  value={currentEntry.content}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
                  placeholder="What's on your mind today? Write about your thoughts, feelings, experiences..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="12"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsWriting(false);
                    setEditingEntry(null);
                    setCurrentEntry({ title: '', content: '', mood: 'neutral' });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={!currentEntry.title.trim() || !currentEntry.content.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingEntry ? 'Update' : 'Save'} Entry</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Personal Journal</h1>
          <p className="text-xl text-gray-600">Reflect on your thoughts and track your journey</p>
        </motion.div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Moods</option>
                {moods.map((mood) => (
                  <option key={mood.value} value={mood.value}>
                    {mood.emoji} {mood.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsWriting(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{entry.title}</h3>
                        <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(entry.date)}</span>
                        </div>
                        {entry.updatedAt !== entry.date && (
                          <span className="italic">Updated {formatDate(entry.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {entry.content.length > 300 
                      ? `${entry.content.substring(0, 300)}...` 
                      : entry.content
                    }
                  </p>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {entries.length === 0 ? 'No entries yet' : 'No entries match your search'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {entries.length === 0 
                    ? 'Start your journaling journey by writing your first entry'
                    : 'Try adjusting your search or mood filter'
                  }
                </p>
                {entries.length === 0 && (
                  <button
                    onClick={() => setIsWriting(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Write Your First Entry
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Journal;