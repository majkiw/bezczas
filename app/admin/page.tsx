'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SystemPrompt {
  id: number;
  content: string;
  createdAt: string;
}

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) router.push('/admin/signin');
  }, [session, status, router]);

  // Fetch all system prompts
  useEffect(() => {
    if (session) {
      fetchPrompts();
    }
  }, [session]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/system-prompts');
      const data = await response.json();
      if (response.ok) {
        setPrompts(data.prompts);
      } else {
        setError(data.error || 'Failed to fetch prompts.');
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleAddPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/system-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPrompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setPrompts([data.prompt, ...prompts]);
        setNewPrompt('');
      } else {
        setError(data.error || 'Failed to add prompt.');
      }
    } catch (err) {
      console.error('Error adding prompt:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (id: number) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        const response = await fetch(`/api/system-prompts/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (response.ok) {
          setPrompts(prompts.filter((prompt) => prompt.id !== id));
        } else {
          setError(data.error || 'Failed to delete prompt.');
        }
      } catch (err) {
        console.error('Error deleting prompt:', err);
        setError('An unexpected error occurred.');
      }
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel - Manage System Prompts</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/signin' })}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>
      
      {/* Add New System Prompt */}
      <form onSubmit={handleAddPrompt} className="mb-8">
        <textarea
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter new system prompt here..."
          rows={4}
          required
        ></textarea>
        <button
          type="submit"
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add New Prompt'}
        </button>
      </form>

      {/* Display Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* List of System Prompts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">System Prompts</h2>
        <ul>
          {prompts.map((prompt) => (
            <motion.li
              key={prompt.id}
              className="mb-4 p-4 bg-white rounded shadow flex justify-between items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <p className="whitespace-pre-wrap">{prompt.content}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Created At: {new Date(prompt.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDeletePrompt(prompt.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                Delete
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
