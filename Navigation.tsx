'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'cosmic-authentication';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Navigation() {
  const { isAuthenticated, user, signIn, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user credits and admin status
      fetchUserData();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const onCreditsUpdated = () => {
      fetchUserData();
    };
    window.addEventListener('credits-updated', onCreditsUpdated as EventListener);
    return () => window.removeEventListener('credits-updated', onCreditsUpdated as EventListener);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.credits || 0);
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const scrollToPrompts = () => {
    const promptsSection = document.getElementById('prompts');
    if (promptsSection) {
      promptsSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-lg border-b border-red-500/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Icon 
                  icon="fluent:prompt-20-filled" 
                  className="w-8 h-8 text-red-500 group-hover:text-red-400 transition-colors"
                />
                <div className="absolute inset-0 blur-md bg-red-500/30 group-hover:bg-red-400/40 transition-colors"></div>
              </div>
              <span className="text-xl font-medium text-white">Promptopiya</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-white/80 hover:text-red-400 transition-colors text-sm font-light"
              >
                Home
              </Link>
              <button
                onClick={scrollToPrompts}
                className="text-white/80 hover:text-red-400 transition-colors text-sm font-light"
              >
                Prompts
              </button>
              <Link 
                href="/reviews" 
                className="text-white/80 hover:text-red-400 transition-colors text-sm font-light"
              >
                Reviews
              </Link>
              <Link 
                href="/reviews#about" 
                className="text-white/80 hover:text-red-400 transition-colors text-sm font-light"
              >
                About Us
              </Link>
              <Link 
                href="/pricing" 
                className="text-white/80 hover:text-red-400 transition-colors text-sm font-light"
              >
                Pricing
              </Link>
              <Link 
                href="/enhancer" 
                className="text-white/80 hover:text-red-400 transition-colors text-sm font-light"
              >
                Enhancer
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-red-400 hover:text-red-300 transition-colors text-sm font-light"
                >
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Auth & Credits */}
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              {isAuthenticated && (
                <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Icon icon="icon-park:credit" className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm font-light">{userCredits}</span>
                </div>
              )}

              {/* Auth Button */}
              {loading ? (
                <div className="w-20 h-8 bg-white/10 rounded animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-white/80 text-sm font-light">
                    {user?.displayName}
                  </div>
                  <button
                    onClick={signOut}
                    className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg transition-all text-sm font-light border border-red-500/30"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg transition-all text-sm font-light"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white/80 hover:text-white transition-colors"
              >
                <Icon icon={isMenuOpen ? "mdi:close" : "mdi:menu"} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/90 backdrop-blur-lg border-t border-red-500/20"
            >
              <div className="px-4 py-4 space-y-4">
                {isAuthenticated && (
                  <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                    <Icon icon="icon-park:credit" className="w-4 h-4 text-red-400" />
                    <span className="text-white text-sm font-light">{userCredits} Credits</span>
                  </div>
                )}
                
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/80 hover:text-red-400 transition-colors text-sm font-light py-2"
                >
                  Home
                </Link>
                <button
                  onClick={scrollToPrompts}
                  className="block text-white/80 hover:text-red-400 transition-colors text-sm font-light py-2 text-left w-full"
                >
                  Prompts
                </button>
                <Link 
                  href="/reviews"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/80 hover:text-red-400 transition-colors text-sm font-light py-2"
                >
                  Reviews
                </Link>
                <Link 
                  href="/reviews#about"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/80 hover:text-red-400 transition-colors text-sm font-light py-2"
                >
                  About Us
                </Link>
                <Link 
                  href="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/80 hover:text-red-400 transition-colors text-sm font-light py-2"
                >
                  Pricing
                </Link>
                <Link 
                  href="/enhancer"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/80 hover:text-red-400 transition-colors text-sm font-light py-2"
                >
                  Enhancer
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-red-400 hover:text-red-300 transition-colors text-sm font-light py-2"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}