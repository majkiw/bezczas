"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

export default function Home() {
  const [inputValue, setInputValue] = useState('Where are you going to?');
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Bezczas</title>
      </Head>
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Wpisz zdanie"
            required
          />
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Myślenie...' : 'Tłumacz'}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-red-500">{error}</p>
        )}
        {submittedValue && (
          <motion.p
            className="mt-4 text-xl text-gray-800"
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
        )}
      </main>
    </div>
  );
}
