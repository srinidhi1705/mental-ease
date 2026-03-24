import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import { useScrollToTop } from './hooks/useScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Quizzes from './pages/Quizzes';
import Quiz from './pages/Quiz';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Gamification from './pages/Gamification';
import Resources from './pages/Resources';
import ProtectedRoute from './components/ProtectedRoute';

// Component to handle global scroll behavior
const ScrollManager = () => {
  useScrollToTop();
  return null;
};

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollManager />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              } />
              <Route path="/quizzes" element={
                <ProtectedRoute>
                  <Quizzes />
                </ProtectedRoute>
              } />
              <Route path="/quiz" element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } />
              <Route path="/mood-tracker" element={
                <ProtectedRoute>
                  <MoodTracker />
                </ProtectedRoute>
              } />
              <Route path="/journal" element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              } />
              <Route path="/gamification" element={
                <ProtectedRoute>
                  <Gamification />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        </Router>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;