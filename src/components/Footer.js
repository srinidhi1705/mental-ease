import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Logo className="h-8 w-8" />
              <span className="text-2xl font-bold">MentalEase</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your digital wellness companion, supporting mental health through 
              evidence-based tools and compassionate care.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>support@mentalease.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Crisis Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Mental Health Tips</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors">Help Center</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2026 MentalEase. All rights reserved. Made with ❤️ for mental wellness.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            If you're in crisis, please contact emergency services or a crisis hotline immediately.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;