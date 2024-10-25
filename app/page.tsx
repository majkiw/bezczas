"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence, MotionStyle, AnimationControls, TargetAndTransition, VariantLabels } from 'framer-motion';

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
  },

  // 5. Synesthetic Pulse - Fixed positioning
  {
    name: 'synesthetic',
    container: { className: "relative h-full" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const radius = 150;
      const angle = (wordIndex * 2 * Math.PI) / words.length;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return {
        initial: { 
          opacity: 0,
          x: 0,
          y: 0,
          scale: 0
        },
        animate: { 
          opacity: 1,
          x,
          y,
          scale: 1,
          transition: { 
            delay: wordIndex * 0.2,
            duration: 1,
            type: "spring"
          }
        },
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'url(#glow)'
        }
      };
    },
    word: {
      animate: {
        scale: [1, 1.2, 1],
        textShadow: [
          "0 0 8px rgba(124, 58, 237, 0.8)",
          "0 0 16px rgba(139, 92, 246, 0.8)",
          "0 0 8px rgba(124, 58, 237, 0.8)"
        ],
        color: [
          "#818cf8",
          "#c084fc",
          "#818cf8"
        ]
      },
      transition: { 
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  },

  // 6. Musical Flow - Updated for right-to-left movement
  {
    name: 'musicalFlow',
    container: { className: "relative h-full overflow-hidden" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const baseY = 0;
      const amplitude = 40;  // Reduced amplitude for better readability
      const frequency = 0.2; // Reduced frequency for smoother waves
      const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const spacing = width / (words.length + 1);
      const startX = width + (spacing * wordIndex);  // Start from right side
      
      return {
        initial: { 
          opacity: 0,
          x: startX,
          y: baseY
        },
        animate: { 
          opacity: 1,
          x: [startX, -spacing],  // Move from right to left
          y: [
            baseY,
            baseY + Math.sin(wordIndex * frequency) * amplitude,
            baseY - Math.sin(wordIndex * frequency) * amplitude,
            baseY
          ],
          transition: {
            duration: 15,  // Slowed down the animation
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.33, 0.66, 1]
          }
        },
        style: {
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          whiteSpace: 'nowrap',
          fontSize: '2rem',  // Increased font size
          fontWeight: 'bold'
        }
      };
    },
    word: {
      animate: {
        rotate: [-3, 3],  // Reduced rotation for better readability
        scale: [0.98, 1.02],  // Subtler scale changes
        color: [
          "#4f46e5",
          "#7c3aed",
          "#4f46e5"
        ]
      },
      transition: { 
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  },

  // 7. Quantum Entanglement - Improved
  {
    name: 'quantum',
    container: { className: "relative h-full" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const isEven = wordIndex % 2 === 0;
      const orbitRadius = 180;
      
      return {
        initial: { 
          opacity: 0,
          scale: 0.5,
          x: 0,
          y: 0
        },
        animate: { 
          opacity: [0.4, 1, 0.4],
          scale: 1,
          x: [
            orbitRadius * Math.cos(wordIndex),
            orbitRadius * Math.cos(wordIndex + Math.PI),
            orbitRadius * Math.cos(wordIndex + 2 * Math.PI)
          ],
          y: [
            orbitRadius * Math.sin(wordIndex),
            orbitRadius * Math.sin(wordIndex + Math.PI),
            orbitRadius * Math.sin(wordIndex + 2 * Math.PI)
          ],
          transition: {
            duration: isEven ? 8 : 12,
            repeat: Infinity,
            ease: "linear",
            delay: wordIndex * 0.2
          }
        },
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: words.length - wordIndex,
          filter: 'url(#glow)'
        }
      };
    },
    word: {
      animate: {
        scale: [1, 1.1, 1],
        rotate: [0, 360],
        textShadow: [
          "0 0 8px rgba(56, 189, 248, 0.6)",
          "0 0 16px rgba(14, 165, 233, 0.8)",
          "0 0 8px rgba(56, 189, 248, 0.6)"
        ],
        color: [
          "#38bdf8",
          "#0ea5e9",
          "#38bdf8"
        ]
      },
      transition: { 
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  },

  // 8. Kaleidoscope
  {
    name: 'kaleidoscope',
    container: { className: "relative h-full" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const segments = 6;
      const angleStep = (2 * Math.PI) / segments;
      const radius = 150;
      const baseAngle = (wordIndex * 2 * Math.PI) / words.length;
      
      return {
        initial: { opacity: 0, scale: 0 },
        animate: { 
          opacity: 1,
          scale: 1,
          transition: { duration: 1, delay: wordIndex * 0.1 }
        },
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          filter: 'url(#glow)',
        }
      };
    },
    word: {
      animate: {
        x: [0, 100, 0],
        y: [0, 100, 0],
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        color: [
          "#f472b6",
          "#818cf8",
          "#f472b6"
        ]
      },
      transition: { 
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear"
      }
    }
  },

  // 9. Nebula
  {
    name: 'nebula',
    container: { className: "relative h-full" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const radius = 200;
      const angle = (wordIndex * 2 * Math.PI) / words.length;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return {
        initial: { 
          opacity: 0,
          x: 0,
          y: 0,
          scale: 0,
          filter: 'blur(10px)'
        },
        animate: { 
          opacity: [0.4, 1, 0.4],
          x: [x, x * 1.2, x],
          y: [y, y * 1.2, y],
          scale: 1,
          filter: ['blur(3px)', 'blur(0px)', 'blur(3px)'],
          transition: { 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        } as AnimationControls | TargetAndTransition | VariantLabels | boolean,
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
      };
    },
    word: {
      animate: {
        textShadow: [
          "0 0 20px rgba(167, 139, 250, 0.7)",
          "0 0 35px rgba(139, 92, 246, 0.9)",
          "0 0 20px rgba(167, 139, 250, 0.7)"
        ],
        color: [
          "#a78bfa",
          "#8b5cf6",
          "#a78bfa"
        ]
      },
      transition: { 
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  },

  // 10. Constellation
  {
    name: 'constellation',
    container: { className: "relative h-full" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const gridSize = Math.ceil(Math.sqrt(words.length));
      const cellSize = 100;
      const startX = -(gridSize * cellSize) / 2;
      const startY = -(gridSize * cellSize) / 2;
      const row = Math.floor(wordIndex / gridSize);
      const col = wordIndex % gridSize;
      
      return {
        initial: { 
          opacity: 0,
          x: startX + (col * cellSize),
          y: startY + (row * cellSize),
          scale: 0
        },
        animate: { 
          opacity: [0.5, 1, 0.5],
          scale: 1,
          x: [
            startX + (col * cellSize),
            startX + (col * cellSize) + (Math.random() * 20 - 10),
            startX + (col * cellSize)
          ],
          y: [
            startY + (row * cellSize),
            startY + (row * cellSize) + (Math.random() * 20 - 10),
            startY + (row * cellSize)
          ],
          transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        } as AnimationControls | TargetAndTransition | VariantLabels | boolean,
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'url(#glow)'
        }
      };
    },
    word: {
      animate: {
        scale: [1, 1.1, 1],
        textShadow: [
          "0 0 5px rgba(147, 197, 253, 0.6)",
          "0 0 15px rgba(59, 130, 246, 0.8)",
          "0 0 5px rgba(147, 197, 253, 0.6)"
        ],
        color: [
          "#93c5fd",
          "#3b82f6",
          "#93c5fd"
        ]
      },
      transition: { 
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  },

  // 11. Sinusoidal Wave
  {
    name: 'sinusoidal',
    container: { className: "relative h-full" },
    wordContainer: (wordIndex: number, words: string[]) => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const height = typeof window !== 'undefined' ? window.innerHeight : 600;
      
      // Calculate base position along sine wave
      const xSpacing = width * 0.8 / (words.length - 1); // Use 80% of width
      const x = (xSpacing * wordIndex) - (width * 0.4); // Center horizontally
      const frequency = 0.005; // Controls how many waves appear
      const amplitude = height * 0.15; // Controls wave height
      const y = Math.sin(x * frequency) * amplitude;
      
      return {
        initial: { 
          opacity: 0,
          x: x,
          y: 0,
          scale: 0
        },
        animate: { 
          opacity: [0.7, 1, 0.7],
          scale: 1,
          x: x,
          y: [
            y,
            y + (Math.sin(wordIndex * 0.5) * 20), // Small individual vertical movement
            y
          ],
          transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: wordIndex * 0.1
          }
        } as AnimationControls | TargetAndTransition | VariantLabels | boolean,
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${Math.max(1.2, 2 - (words.length * 0.05))}rem`, // Adjust size based on word count
          filter: 'url(#glow)',
          zIndex: Math.round(Math.abs(y)) // Words closer to center appear on top
        }
      };
    },
    word: {
      animate: {
        rotate: [-2, 2], // Subtle rotation
        scale: [0.95, 1.05],
        color: [
          "#6366f1", // Indigo
          "#8b5cf6", // Purple
          "#6366f1"  // Back to indigo
        ],
        textShadow: [
          "0 0 8px rgba(99, 102, 241, 0.5)",
          "0 0 12px rgba(139, 92, 246, 0.6)",
          "0 0 8px rgba(99, 102, 241, 0.5)"
        ]
      },
      transition: { 
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  }
];

// Near the top of the file, after imports
const ANIMATION_STYLES_PARAM = 'show-controls';

// Add these new types and state in the Home component
type AnimationStyleName = typeof animationStyles[number]['name'];

export default function Home() {
  const [inputValue, setInputValue] = useState('Dokąd jutro idziesz?');
  const [submittedValue, setSubmittedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState(animationStyles[0]);
  const [showControls, setShowControls] = useState(false);

  // Add this useEffect to check URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setShowControls(searchParams.has(ANIMATION_STYLES_PARAM));
  }, []);

  // Add this handler
  const handleStyleChange = (styleName: AnimationStyleName) => {
    const style = animationStyles.find(s => s.name === styleName);
    if (style) {
      setCurrentStyle(style);
    }
  };

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
        // Only randomize if controls are not shown
        if (!showControls) {
          const randomStyle = animationStyles[Math.floor(Math.random() * animationStyles.length)];
          console.log("Animation style:", randomStyle.name);
          setCurrentStyle(randomStyle);
        }
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
      <svg className="hidden">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      <Head>
        <title>Bezczas</title>
      </Head>
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {showControls && (
        <div className="fixed top-4 right-4 z-50">
          <select 
            className="px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm border border-purple-200 
                       shadow-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={currentStyle.name}
            onChange={(e) => handleStyleChange(e.target.value as AnimationStyleName)}
          >
            {animationStyles.map(style => (
              <option key={style.name} value={style.name}>
                {style.name.charAt(0).toUpperCase() + style.name.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
      
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
