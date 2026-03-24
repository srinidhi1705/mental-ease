import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Phone, 
  Video, 
  Users, 
  Brain, 
  Shield, 
  ExternalLink,
  Search,
  Filter,
  Clock,
  MapPin,
  Heart
} from 'lucide-react';

const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'crisis', name: 'Crisis Support', icon: Phone },
    { id: 'therapy', name: 'Therapy & Counseling', icon: Brain },
    { id: 'support', name: 'Support Groups', icon: Users },
    { id: 'education', name: 'Educational', icon: BookOpen },
    { id: 'wellness', name: 'Wellness Tools', icon: Heart }
  ];

  const resources = [
    {
      id: 1,
      title: 'National Suicide Prevention Lifeline',
      description: '24/7 crisis support for people in suicidal crisis or emotional distress',
      category: 'crisis',
      type: 'Hotline',
      contact: '988',
      website: 'https://suicidepreventionlifeline.org',
      available: '24/7',
      free: true
    },
    {
      id: 2,
      title: 'Crisis Text Line',
      description: 'Free, 24/7 support for those in crisis via text message',
      category: 'crisis',
      type: 'Text Support',
      contact: 'Text HOME to 741741',
      website: 'https://crisistextline.org',
      available: '24/7',
      free: true
    },
    {
      id: 3,
      title: 'BetterHelp',
      description: 'Online therapy platform connecting you with licensed therapists',
      category: 'therapy',
      type: 'Online Therapy',
      contact: 'Online Platform',
      website: 'https://betterhelp.com',
      available: 'Flexible scheduling',
      free: false
    },
    {
      id: 4,
      title: 'Psychology Today',
      description: 'Find therapists, psychiatrists, and support groups in your area',
      category: 'therapy',
      type: 'Directory',
      contact: 'Online Directory',
      website: 'https://psychologytoday.com',
      available: 'Always available',
      free: true
    },
    {
      id: 5,
      title: 'NAMI Support Groups',
      description: 'National Alliance on Mental Illness peer support groups',
      category: 'support',
      type: 'Support Groups',
      contact: 'Local chapters',
      website: 'https://nami.org',
      available: 'Varies by location',
      free: true
    },
    {
      id: 6,
      title: 'Mental Health America',
      description: 'Mental health screening tools and educational resources',
      category: 'education',
      type: 'Educational',
      contact: 'Online Resources',
      website: 'https://mhanational.org',
      available: 'Always available',
      free: true
    },
    {
      id: 7,
      title: 'Headspace',
      description: 'Meditation and mindfulness app for mental wellness',
      category: 'wellness',
      type: 'Mobile App',
      contact: 'Mobile App',
      website: 'https://headspace.com',
      available: 'Always available',
      free: false
    },
    {
      id: 8,
      title: 'Calm',
      description: 'Sleep stories, meditation, and relaxation techniques',
      category: 'wellness',
      type: 'Mobile App',
      contact: 'Mobile App',
      website: 'https://calm.com',
      available: 'Always available',
      free: false
    },
    {
      id: 9,
      title: 'SAMHSA National Helpline',
      description: 'Treatment referral and information service for mental health and substance abuse',
      category: 'crisis',
      type: 'Helpline',
      contact: '1-800-662-4357',
      website: 'https://samhsa.gov',
      available: '24/7',
      free: true
    },
    {
      id: 10,
      title: 'Anxiety and Depression Association',
      description: 'Resources, support groups, and educational materials for anxiety and depression',
      category: 'education',
      type: 'Educational',
      contact: 'Online Resources',
      website: 'https://adaa.org',
      available: 'Always available',
      free: true
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Hotline':
      case 'Helpline':
        return Phone;
      case 'Text Support':
        return Phone;
      case 'Online Therapy':
        return Video;
      case 'Support Groups':
        return Users;
      case 'Mobile App':
        return Heart;
      default:
        return BookOpen;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Hotline':
      case 'Helpline':
        return 'text-red-600 bg-red-100';
      case 'Text Support':
        return 'text-blue-600 bg-blue-100';
      case 'Online Therapy':
        return 'text-purple-600 bg-purple-100';
      case 'Support Groups':
        return 'text-green-600 bg-green-100';
      case 'Mobile App':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mental Health Resources</h1>
          <p className="text-xl text-gray-600">Find support, information, and tools for your mental health journey</p>
        </motion.div>

        {/* Emergency Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Emergency Support</h3>
              <p className="text-red-700">
                If you're in immediate danger or having thoughts of self-harm, please call 988 (Suicide & Crisis Lifeline) 
                or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedCategory === category.id
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full lg:w-64"
              />
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {resource.free && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Free
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{resource.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{resource.contact}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{resource.available}</span>
                  </div>
                </div>

                <a
                  href={resource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </motion.div>
        )}

        {/* Additional Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Need More Help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-2">Find Local Resources</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use online directories to find mental health professionals in your area
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Search Locally
              </button>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-2">Join Support Groups</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with others who understand what you're going through
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                Find Groups
              </button>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-2">Self-Care Tools</h3>
              <p className="text-sm text-gray-600 mb-4">
                Explore apps and tools to support your daily mental wellness
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                Explore Tools
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Resources;