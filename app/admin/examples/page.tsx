'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';

interface Example {
  id: number;
  input: string;
  output: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminExamples() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExample, setNewExample] = useState({ input: '', output: '' });
  const [isAdding, setIsAdding] = useState(false);

  // Fetch examples on component mount
  useEffect(() => {
    if (session) {
      fetchExamples();
    }
  }, [session]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) router.push('/admin/signin');
  }, [session, status, router]);

  const fetchExamples = async () => {
    try {
      const response = await fetch('/api/examples');
      const data = await response.json();
      if (response.ok) {
        setExamples(data.examples);
      } else {
        setError(data.error || 'Failed to fetch examples.');
      }
    } catch (err) {
      console.error('Error fetching examples:', err);
      setError('An unexpected error occurred.');
    }
  };

  // Debounced autosave function
  const autosave = debounce(async (id: number, field: 'input' | 'output', value: string) => {
    try {
      const response = await fetch(`/api/examples/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();

      if (response.ok) {
        setExamples((prev) =>
          prev.map((ex) => (ex.id === id ? { ...ex, [field]: data.example[field], updatedAt: data.example.updatedAt } : ex))
        );
      } else {
        setError(data.error || `Failed to update example ${field}.`);
      }
    } catch (err) {
      console.error(`Error updating example ${field}:`, err);
      setError('An unexpected error occurred.');
    }
  }, 500); // 500ms debounce

  const handleFieldChange = (id: number, field: 'input' | 'output', value: string) => {
    setExamples((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
    autosave(id, field, value);
  };

  const handleDeleteExample = async (id: number) => {
    if (confirm('Are you sure you want to delete this example?')) {
      try {
        const response = await fetch(`/api/examples/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (response.ok) {
          setExamples(examples.filter((ex) => ex.id !== id));
        } else {
          setError(data.error || 'Failed to delete example.');
        }
      } catch (err) {
        console.error('Error deleting example:', err);
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleAddExample = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newExample.input.trim() || !newExample.output.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch('/api/examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExample),
      });

      const data = await response.json();

      if (response.ok) {
        setExamples([data.example, ...examples]);
        setNewExample({ input: '', output: '' }); // Reset form
      } else {
        setError(data.error || 'Failed to add example.');
      }
    } catch (err) {
      console.error('Error adding example:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsAdding(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel - Manage Examples</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/signin' })}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>

      {/* Display Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add New Example Form */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Example</h2>
        <form onSubmit={handleAddExample} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Input:
            </label>
            <textarea
              value={newExample.input}
              onChange={(e) => setNewExample({ ...newExample, input: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              required
              placeholder="Enter input text..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Output:
            </label>
            <textarea
              value={newExample.output}
              onChange={(e) => setNewExample({ ...newExample, output: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              required
              placeholder="Enter output text..."
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className={`${
              isAdding ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-700'
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            {isAdding ? 'Adding...' : 'Add Example'}
          </button>
        </form>
      </div>

      {/* List of Examples */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Examples</h2>
        {examples.length === 0 ? (
          <p className="text-gray-700">No examples found.</p>
        ) : (
          <ul>
            {examples.map((example) => (
              <motion.li
                key={example.id}
                className="mb-4 p-4 bg-white rounded shadow flex flex-col md:flex-row justify-between items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex-1">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Input:</label>
                    <textarea
                      value={example.input}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        handleFieldChange(example.id, 'input', e.target.value)
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Output:</label>
                    <textarea
                      value={example.output}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        handleFieldChange(example.id, 'output', e.target.value)
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      required
                    ></textarea>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Created At: {new Date(example.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated At: {new Date(example.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex flex-col">
                  <button
                    onClick={() => handleDeleteExample(example.id)}
                    className="mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
