"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

export default function Home() {
  const [inputValue, setInputValue] = useState('Dokąd jutro idziesz?');
  const [submittedValue, setSubmittedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-b from-gray-50 to-gray-100">
      <Head>
        <title>Bezczas</title>
      </Head>
      <main className="flex flex-col items-center justify-center w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-6 py-4 text-xl sm:text-2xl text-gray-700 bg-white rounded-lg shadow-lg 
                          border-2 border-transparent focus:border-blue-500 focus:outline-none 
                          transition-all duration-300 ease-in-out"
                placeholder="Wpisz zdanie"
                required
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 
                            group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <button
              type="submit"
              className={`w-full px-6 py-4 text-xl sm:text-2xl font-bold text-white rounded-lg shadow-lg 
                         transition-all duration-300 ease-in-out transform hover:scale-102 hover:shadow-xl
                         ${loading 
                           ? 'bg-gray-400 cursor-not-allowed' 
                           : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                         }`}
              disabled={loading}
            >
              {loading ? 'Myślenie...' : 'Tłumacz'}
            </button>
          </form>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-xl text-red-500 bg-red-50 px-6 py-3 rounded-lg shadow"
          >
            {error}
          </motion.p>
        )}

        {submittedValue && (
          <motion.div
            className="mt-12 w-full bg-white rounded-lg shadow-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-2xl sm:text-3xl text-gray-700 leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {submittedValue.split('').map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20, rotate: -10 },
                    visible: { opacity: 1, y: 0, rotate: 0 },
                  }}
                  className="inline-block"
                >
                  {char.replace(/\s/g, '\u00A0')}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
