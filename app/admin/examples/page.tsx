'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import AdminNav from '../components/AdminNav';

interface Example {
  id: number;
  input: string;
  output: string;
  createdAt: string;
  updatedAt: string;
  isSaving?: boolean;
  savedRecently?: boolean;
  originalInput?: string;  // Track original value
  originalOutput?: string; // Track original value
  isDirty?: boolean;      // Track if changes are unsaved
}

// Add this CSS class to your globals.css file or use inline styles
const savingStyles = `
  relative
  before:absolute before:inset-0
  before:rounded
  before:border-2
  before:border-blue-300
  before:animate-pulse
`;

export default function AdminExamples() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExample, setNewExample] = useState({ input: '', output: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [selectedExamples, setSelectedExamples] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState<{ id: number; message: string } | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  // Fetch examples on component mount
  useEffect(() => {
    if (session) {
      fetchExamples();
    }
  }, [session, deletedIds]);

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
        // Filter out deleted examples
        const filteredExamples = data.examples
          .filter((ex: Example) => !deletedIds.has(ex.id))
          .map((ex: Example) => ({
            ...ex,
            originalInput: ex.input,
            originalOutput: ex.output,
            isDirty: false
          }));
        setExamples(filteredExamples);
      } else {
        setError(data.error || 'Failed to fetch examples.');
      }
    } catch (err) {
      console.error('Error fetching examples:', err);
      setError('An unexpected error occurred.');
    }
  };

  // Create a stable debounced save function using useCallback
  const debouncedSave = React.useCallback(
    debounce(async (id: number, updates: { input?: string; output?: string }) => {
      try {
        // Mark as saving
        setExamples((prev) =>
          prev.map((ex) => (ex.id === id ? { ...ex, isSaving: true } : ex))
        );

        const response = await fetch(`/api/examples/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (response.ok) {
          handleSaveSuccess(id, data.example);
          
          setTimeout(() => {
            setExamples((prev) =>
              prev.map((ex) =>
                ex.id === id ? { ...ex, savedRecently: false } : ex
              )
            );
          }, 5000);
        } else {
          setError(data.error || `Failed to update example.`);
        }
      } catch (err) {
        console.error(`Error updating example:`, err);
        setError('An unexpected error occurred.');
      }
    }, 2000),
    []
  );

  // Update handleBlur to check for changes before saving
  const handleBlur = async (id: number) => {
    const example = examples.find(ex => ex.id === id);
    if (example && example.isDirty) {
      debouncedSave.cancel(); // Cancel any pending debounced saves
      await debouncedSave(id, { 
        input: example.input,
        output: example.output 
      });
    }
  };

  const handleFieldChange = (id: number, field: 'input' | 'output', value: string) => {
    setExamples((prev) =>
      prev.map((ex) => {
        if (ex.id !== id) return ex;
        
        const originalValue = field === 'input' ? ex.originalInput : ex.originalOutput;
        const hasChanged = value !== originalValue;
        
        return {
          ...ex,
          [field]: value,
          isDirty: hasChanged || (field === 'input' ? ex.output !== ex.originalOutput : ex.input !== ex.originalInput)
        };
      })
    );

    // Only trigger save if the example is dirty
    const example = examples.find(ex => ex.id === id);
    if (example?.isDirty) {
      debouncedSave(id, {
        input: field === 'input' ? value : example.input,
        output: field === 'output' ? value : example.output
      });
    }
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

  const handleSaveSuccess = (id: number, updatedExample: any) => {
    setExamples((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              ...updatedExample,
              originalInput: updatedExample.input,
              originalOutput: updatedExample.output,
              isSaving: false,
              savedRecently: true,
              isDirty: false
            }
          : ex
      )
    );
  };

  const handleSelectExample = (id: number) => {
    setSelectedExamples((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedExamples.size === 0) return;
    if (confirm('Are you sure you want to delete the selected examples?')) {
      try {
        for (const id of Array.from(selectedExamples)) {
          await fetch(`/api/examples/${id}`, {
            method: 'DELETE',
          });
        }
        setExamples(examples.filter((ex) => !selectedExamples.has(ex.id)));
        setSelectedExamples(new Set());
      } catch (err) {
        console.error('Error deleting selected examples:', err);
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleRegenerateExample = async (exampleId: number) => {
    try {
      const example = examples.find((ex) => ex.id === exampleId);
      if (!example) return;

      // Show notification in place of the example
      setNotification({ id: exampleId, message: 'Example will be regenerated as Proposed Example!' });

      // First, delete the example from the database
      const deleteResponse = await fetch(`/api/examples/${exampleId}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete example before regenerating.');
      }

      // Then create a proposed example with 3 completions
      const response = await fetch('/api/proposed-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: example.input }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate example as proposed example.');
      }

      // Mark as deleted after successful API calls
      setDeletedIds(prev => new Set(prev).add(exampleId));

      // Remove the example from the UI after a delay
      setTimeout(() => {
        setExamples((prev) => prev.filter((ex) => ex.id !== exampleId));
        setNotification(null);
      }, 5000);
    } catch (err) {
      console.error('Error regenerating example:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleRegenerateSelected = async () => {
    if (selectedExamples.size === 0) return;
    for (const id of Array.from(selectedExamples)) {
      await handleRegenerateExample(id);
    }
    setSelectedExamples(new Set());
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Manage Examples</h1>

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
                style={{ width: '100%' }} // Ensure full width
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
                style={{ width: '100%' }} // Ensure full width
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
            <>
              <button
                onClick={handleDeleteSelected}
                className="mb-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                disabled={selectedExamples.size === 0}
              >
                Delete Selected
              </button>
              <button
                onClick={handleRegenerateSelected}
                className="mb-4 ml-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                disabled={selectedExamples.size === 0}
              >
                Regenerate Selected
              </button>
              <ul>
                {examples.map((example) => (
                  <motion.li
                    key={example.id}
                    className="mb-4 p-4 bg-white rounded shadow flex flex-col md:flex-row justify-between items-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {notification?.id === example.id ? (
                      <p className="text-green-500">{notification.message}</p>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={selectedExamples.has(example.id)}
                          onChange={() => handleSelectExample(example.id)}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <div className="mb-2 relative">
                            <label className="block text-sm font-semibold text-gray-700">Input:</label>
                            <textarea
                              value={example.input}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                handleFieldChange(example.id, 'input', e.target.value)
                              }
                              onBlur={() => handleBlur(example.id)}
                              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300
                                ${example.savedRecently ? 'bg-green-50 border-green-200' : ''}
                                ${example.isSaving ? savingStyles : ''}`}
                              rows={2}
                              required
                              style={{ width: '100%' }} // Ensure full width
                            ></textarea>
                            {example.isSaving && (
                              <span className="absolute right-2 top-8 text-blue-500 text-sm flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </span>
                            )}
                            {example.savedRecently && !example.isSaving && (
                              <span className="absolute right-2 top-8 text-green-500 text-sm flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Saved!
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700">Output:</label>
                            <textarea
                              value={example.output}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                handleFieldChange(example.id, 'output', e.target.value)
                              }
                              onBlur={() => handleBlur(example.id)}
                              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300
                                ${example.savedRecently ? 'bg-green-50 border-green-200' : ''}
                                ${example.isSaving ? savingStyles : ''}`}
                              rows={2}
                              required
                              style={{ width: '100%' }} // Ensure full width
                            ></textarea>
                            {example.isSaving && (
                              <span className="absolute right-2 top-8 text-blue-500 text-sm flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </span>
                            )}
                            {example.savedRecently && !example.isSaving && (
                              <span className="absolute right-2 top-8 text-green-500 text-sm flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Saved!
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4 flex flex-col">
                          <button
                            onClick={() => handleDeleteExample(example.id)}
                            className="mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleRegenerateExample(example.id)}
                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
                          >
                            Regenerate
                          </button>
                        </div>
                      </>
                    )}
                  </motion.li>
                ))}
              </ul>
            </>
          )}
        </div>
        {notification && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded shadow-lg">
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}
