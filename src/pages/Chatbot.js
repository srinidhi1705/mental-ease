import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Heart, Smile, Frown, Meh, AlertCircle, Sun, Cloud, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const moods = [
    { name: 'happy', icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { name: 'sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'anxious', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
    { name: 'calm', icon: Sun, color: 'text-green-500', bg: 'bg-green-100' },
    { name: 'angry', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-100' },
    { name: 'neutral', icon: Meh, color: 'text-purple-500', bg: 'bg-purple-100' }
  ];

  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 100);
    }
  };

  const handleScroll = (e) => {
    e.stopPropagation();
    
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShouldAutoScroll(isAtBottom);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && !loading && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, loading, shouldAutoScroll]);

  useEffect(() => {
    if (!loading && messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [loading]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
      loadMoodHistory();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('mentalease_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadChatHistory = async () => {
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      if (!healthResponse.ok) {
        throw new Error('Backend server is not running');
      }

      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = [];
        
        if (data.history.length === 0) {
          formattedMessages.push({
            id: 'welcome',
            text: `Hi ${user.name}! I'm your AI companion. I'm here to listen, support you, and help track your mood. How are you feeling today?`,
            sender: 'bot',
            timestamp: new Date(),
            mood: null
          });
        } else {
          data.history.reverse().forEach(chat => {
            formattedMessages.push({
              id: `user-${chat.id}`,
              text: chat.user_message,
              sender: 'user',
              timestamp: new Date(chat.timestamp),
              mood: chat.mood
            });
            formattedMessages.push({
              id: `bot-${chat.id}`,
              text: chat.bot_response,
              sender: 'bot',
              timestamp: new Date(chat.timestamp),
              mood: null
            });
          });
        }
        
        setMessages(formattedMessages);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      
      setMessages([{
        id: 'connection-error',
        text: `Hi ${user?.name || 'there'}! I'm having trouble answering, try later.`,
        sender: 'bot',
        timestamp: new Date(),
        mood: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoodHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mood/history`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMoodHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load mood history:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      mood: selectedMood || null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShouldAutoScroll(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: inputMessage,
          mood: selectedMood || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          id: `bot-${data.id}`,
          text: data.bot_response,
          sender: 'bot',
          timestamp: new Date(),
          mood: null
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        if (data.mood) {
          loadMoodHistory();
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      let errorText = "I'm sorry, I'm having trouble responding right now.";
      
      if (error.message.includes('Failed to fetch')) {
        errorText = "Connection error: Please make sure the backend server is running on http://localhost:8000";
      } else if (error.message.includes('401')) {
        errorText = "Authentication error: Please try logging in again.";
      }
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        mood: null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setSelectedMood('');
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
  };

  const trackMood = async (mood, notes = '') => {
    try {
      await fetch(`${API_BASE_URL}/mood/track`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          mood: mood,
          notes: notes
        }),
      });
      loadMoodHistory();
    } catch (error) {
      console.error('Failed to track mood:', error);
    }
  };

  const getMoodIcon = (moodName) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? mood.icon : Meh;
  };

  const getMoodColor = (moodName) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? mood.color : 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">AI Companion</h1>
                  <p className="text-purple-100">Your supportive chat partner</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoodSelector(!showMoodSelector)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <Heart className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Mood Selector */}
          <AnimatePresence>
            {showMoodSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b bg-gray-50 p-4"
              >
                <p className="text-sm text-gray-600 mb-3">How are you feeling?</p>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => {
                    const IconComponent = mood.icon;
                    return (
                      <button
                        key={mood.name}
                        onClick={() => handleMoodSelect(mood.name)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full border transition-all ${
                          selectedMood === mood.name
                            ? `${mood.bg} border-current ${mood.color}`
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${selectedMood === mood.name ? mood.color : 'text-gray-500'}`} />
                        <span className={`text-sm capitalize ${selectedMood === mood.name ? mood.color : 'text-gray-700'}`}>
                          {mood.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-96 overflow-y-auto p-6 space-y-4"
          >
            <AnimatePresence>
              {messages.map((message) => {
                const MoodIcon = message.mood ? getMoodIcon(message.mood) : null;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`p-2 rounded-full ${
                        message.sender === 'user' 
                          ? 'bg-purple-100' 
                          : 'bg-blue-100'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          {MoodIcon && (
                            <MoodIcon className={`w-3 h-3 ml-2 ${getMoodColor(message.mood)}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {!shouldAutoScroll && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setShouldAutoScroll(true);
                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
              }}
              className="absolute bottom-20 right-6 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          )}

          {/* Input */}
          <div className="border-t p-6">
            {selectedMood && (
              <div className="mb-3 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Mood:</span>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${moods.find(m => m.name === selectedMood)?.bg}`}>
                  {(() => {
                    const MoodIcon = getMoodIcon(selectedMood);
                    return <MoodIcon className={`w-3 h-3 ${getMoodColor(selectedMood)}`} />;
                  })()}
                  <span className={`text-xs capitalize ${getMoodColor(selectedMood)}`}>{selectedMood}</span>
                </div>
                <button
                  onClick={() => setSelectedMood('')}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isTyping}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Quick Mood Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-xl shadow-md p-4"
        >
          <h3 className="font-semibold text-gray-800 mb-3">Quick Mood Check</h3>
          <div className="flex flex-wrap gap-2">
            {moods.slice(0, 4).map((mood) => {
              const IconComponent = mood.icon;
              return (
                <button
                  key={mood.name}
                  onClick={() => trackMood(mood.name)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full border transition-all hover:${mood.bg} hover:${mood.color} hover:border-current`}
                >
                  <IconComponent className="w-4 h-4 text-gray-500" />
                  <span className="text-sm capitalize text-gray-700">{mood.name}</span>
                </button>
              );
            })}
          </div>
          {moodHistory.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Recent: {moodHistory.slice(0, 3).map(m => m.mood).join(', ')}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;