import React from "react";
import { SparklesCore } from "./ui/sparkles";
import { SimpleSparkles } from "./ui/simple-sparkles";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Brain, Users } from "lucide-react";

export function HeroSection() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Sparkles Background */}
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />
        {/* Fallback simple sparkles */}
        <SimpleSparkles className="w-full h-full" particleCount={80} />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-6">
            MentalEase
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto">
            Your personal mental health companion. Track your mood, connect with support, and build healthier habits.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link
            to="/register"
            className="bg-white text-primary-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-primary-900 transition-all duration-300 transform hover:scale-105"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mood Tracking</h3>
            <p className="text-neutral-300">Monitor your emotional wellbeing with daily mood check-ins</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Support</h3>
            <p className="text-neutral-300">Get personalized guidance from our intelligent chatbot</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
            <p className="text-neutral-300">Connect with others on similar wellness journeys</p>
          </div>
        </motion.div>
      </div>

      {/* Gradient overlay to soften edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-transparent to-primary-900/20 pointer-events-none"></div>
    </div>
  );
}