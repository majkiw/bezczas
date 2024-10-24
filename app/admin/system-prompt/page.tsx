'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminNav from '../components/AdminNav';

interface SystemPrompt {
  id: number;
  content: string;
  createdAt: string;
}

export default function SystemPrompt() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [latestPrompt, setLatestPrompt] = useState<SystemPrompt | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/admin/signin');
  }, [session, status, router]);

  // Fetch the latest system prompt
  useEffect(() => {
    if (session) {
      fetchLatestPrompt();
    }
  }, [session]);

  // Set edited content when latest prompt changes
  useEffect(() => {
    if (latestPrompt) {
      setEditedContent(latestPrompt.content);
    }
  }, [latestPrompt]);

  const fetchLatestPrompt = async () => {
    try {
      const response = await fetch('/api/system-prompts');
      const data = await response.json();
      if (response.ok && data.prompts.length > 0) {
        setLatestPrompt(data.prompts[0]);
      } else {
        setError(data.error || 'Failed to fetch prompt.');
      }
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleUpdatePrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editedContent.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/system-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setLatestPrompt(data.prompt);
      } else {
        setError(data.error || 'Failed to update prompt.');
      }
    } catch (err) {
      console.error('Error updating prompt:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Panel - System Prompt</h1>
        </div>

        {/* Display Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Edit System Prompt */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Edit System Prompt</h2>
          {latestPrompt ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleUpdatePrompt}>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={36}
                  required
                ></textarea>
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Prompt'}
                  </button>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(latestPrompt.createdAt).toLocaleString()}
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <p>Loading system prompt...</p>
          )}
        </div>
      </div>
    </div>
  );
}
