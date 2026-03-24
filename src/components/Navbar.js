import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuizData } from '../hooks/useQuizData';
import { Menu, X, User, LogOut, Brain } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { quizSummary: quizStatus } = useQuizData();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/chatbot', label: 'Chat' },
    { path: '/mood-tracker', label: 'Mood' },
    { path: '/journal', label: 'Journal' },
    { path: '/resources', label: 'Resources' }
  ] : [];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-2xl font-bold gradient-text">CuraCore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors duration-300 ${
                  location.pathname === link.path
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Quiz Status Indicator */}
                {quizStatus && quizStatus.has_quiz && (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                    title={`Assessment: ${quizStatus.overall_severity} - ${quizStatus.simple_suggestion}`}
                  >
                    <Brain className="h-4 w-4 text-primary-500" />
                    <span className="text-lg">{quizStatus.severity_emoji}</span>
                    {quizStatus.critical_flag && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </Link>
                )}
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary-500" />
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-primary-500 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary-500 transition-colors duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`font-medium transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-700 font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link to="/login" className="text-gray-600 hover:text-primary-500 font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-center">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;