"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence, MotionStyle } from 'framer-motion';

// Define different animation styles
const animationStyles = [
  // 1. Spiral - with increased spacing
  {
    name: 'spiral',
    container: {},
    wordContainer: (wordIndex: number, words: string[], word: string) => {
      // Increase spacing between spiral loops
      const angle = (wordIndex * 3 * Math.PI) / words.length; // Increased from 2 to 3
      const spiralRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35; // Increased from 0.25 to 0.35
      // Make the spiral grow more gradually
      const radius = (wordIndex * spiralRadius) / (words.length * 1.2); // Added factor to slow growth
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return {
        initial: { opacity: 0, scale: 0.5, x: 0, y: 100 },
        animate: { 
          opacity: 1, scale: 1, x, y,
          transition: { delay: wordIndex * 0.15, duration: 0.8 }
        },
        style: {
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          zIndex: words.length - wordIndex
        }
      };
    },
    word: {
      animate: {
        y: [0, -5, 0],
        rotate: [0, -3, 3, 0],
      },
      transition: { duration: 4, repeat: Infinity, repeatType: "reverse" }
    }
  },

  // 2. Vertical Cascade - with dynamic spacing and scroll prevention
  {
    name: 'cascade',
    container: { 
      className: "flex items-center justify-center h-full p-8 relative" // Added relative positioning
    },
    wordContainer: (wordIndex: number, words: string[]) => {
      const maxWordsPerColumn = 8;
      const numberOfColumns = Math.ceil(words.length / maxWordsPerColumn);
      const columnIndex = Math.floor(wordIndex / maxWordsPerColumn);
      const indexInColumn = wordIndex % maxWordsPerColumn;
      
      // Calculate column layout with margins
      const containerWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800; // Use 80% of window width
      const columnWidth = containerWidth / numberOfColumns;
      const startX = -(containerWidth / 2) + (columnWidth / 2); // Start from left side
      const xOffset = startX + (columnWidth * columnIndex);
      
      // Calculate vertical spacing
      const containerHeight = typeof window !== 'undefined' ? window.innerHeight * 0.55 : 600;
      const padding = 32;
      const availableHeight = containerHeight - padding;
      const wordsInThisColumn = Math.min(maxWordsPerColumn, words.length - (columnIndex * maxWordsPerColumn));
      const spacing = Math.min(30, availableHeight / (wordsInThisColumn + 1));

      return {
        initial: { opacity: 0, x: -50, rotateY: 90 },
        animate: { 
          opacity: 1, 
          x: xOffset, 
          rotateY: 0,
          transition: { delay: wordIndex * 0.1, duration: 1 }
        },
        style: { 
          position: 'absolute',
          top: `${((indexInColumn + 1) * spacing) + 20}px`,
          transform: 'translateX(-50%)',
          margin: `${spacing/2}px 0`,
          width: `${columnWidth * 0.9}px`, // 90% of column width to add some spacing
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center'
        }
      };
    },
    word: {
      animate: {
        scale: [1, 1.03, 1],
        color: ['#1a365d', '#7e22ce', '#1a365d'],
      },
      transition: { duration: 3, repeat: Infinity, repeatType: "reverse" }
    }
  },

  // 3. Explosion
  {
    name: 'explosion',
    container: { className: "relative h-full" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const angle = (wordIndex * 360) / words.length;
      const distance = 200;
      return {
        initial: { opacity: 0, scale: 0, x: 0, y: 0 },
        animate: { 
          opacity: 1,
          scale: 1,
          x: Math.cos(angle * Math.PI / 180) * distance,
          y: Math.sin(angle * Math.PI / 180) * distance,
          transition: { 
            type: "spring",
            duration: 1,
            delay: wordIndex * 0.1
          }
        },
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
      };
    },
    word: {
      animate: {
        rotate: [0, 360],
      },
      transition: { duration: 20, repeat: Infinity, ease: "linear" }
    }
  },

  // 4. Wave
  {
    name: 'wave',
    container: { className: "flex flex-wrap justify-center items-center h-full" },
    wordContainer: (wordIndex: number) => ({
      initial: { opacity: 0, y: 50 },
      animate: { 
        opacity: 1,
        y: 0,
        transition: { delay: wordIndex * 0.1, duration: 0.5 }
      },
      style: { margin: '0.5rem' }
    }),
    word: {
      animate: {
        y: [0, -20, 0],
      },
      transition: { 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        delay: Math.random() * 2
      }
    }
  }
];

export default function Home() {
  const [inputValue, setInputValue] = useState('Dokąd jutro idziesz?');
  const [submittedValue, setSubmittedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState(animationStyles[0]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmittedValue('');

    try {
      const response = await fetch('/api/process-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Choose a random animation style
        const randomStyle = animationStyles[Math.floor(Math.random() * animationStyles.length)];
        setCurrentStyle(randomStyle);
        setSubmittedValue(data.processedText);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen py-2 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Head>
        <title>Bezczas</title>
      </Head>
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Split the screen into two sections */}
      <div className="min-h-screen flex flex-col">
        {/* Top half - Input section */}
        <div className="h-[40vh] flex items-center justify-center">
          <main className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full space-y-8"
            >
              {/* <motion.h1 
                className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                Język Bezczasowy
              </motion.h1> */}
              
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="relative w-full px-8 py-6 text-2xl sm:text-3xl text-gray-700 bg-white rounded-lg shadow-lg 
                              border-2 border-transparent focus:border-blue-500 focus:outline-none 
                              transition-all duration-300 ease-in-out"
                    placeholder="Wpisz zdanie"
                    required
                  />
                </motion.div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-8 py-6 text-2xl sm:text-3xl font-bold text-white rounded-lg shadow-lg 
                             transition-all duration-300 ease-in-out
                             ${loading 
                               ? 'bg-gray-400 cursor-not-allowed' 
                               : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                             }`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Myślenie...</span>
                    </div>
                  ) : (
                    'Tłumacz'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </main>
        </div>

        {/* Bottom half - Output section */}
        <div className="h-[60vh] relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
              >
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
                  <p className="text-xl text-red-500">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {submittedValue && (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <motion.div
                  className={`relative w-full h-full flex items-center justify-center ${currentStyle.container.className || ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {submittedValue.split(' ').map((word, wordIndex, words) => {
                    const containerProps = currentStyle.wordContainer(wordIndex, words, word);
                    const style = containerProps.style as MotionStyle;
                    
                    return (
                      <motion.div
                        key={wordIndex}
                        className="relative"
                        {...containerProps}
                        style={style}
                      >
                        <motion.span
                          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 inline-block whitespace-nowrap"
                          animate={currentStyle.word.animate}
                          transition={{
                            ...currentStyle.word.transition,
                            repeatType: "reverse"
                          }}
                        >
                          {word}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
