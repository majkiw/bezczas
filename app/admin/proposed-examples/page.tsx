'use client';

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminNav from '../components/AdminNav';

const ProposedExamplesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [proposedExamples, setProposedExamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ id: number; message: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerationProgress, setCurrentGenerationProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Add authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/admin/signin');
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  useEffect(() => {
    const fetchProposedExamples = async () => {
      try {
        const response = await fetch("/api/proposed-examples");
        if (!response.ok) {
          throw new Error("Failed to fetch proposed examples.");
        }
        const data = await response.json();
        setProposedExamples(data.proposedExamples);
      } catch (err: any) {
        setError("An error occurred while fetching proposed examples.");
        console.error(err);
      }
    };

    fetchProposedExamples();
  }, []);

  const handleGenerate = async () => {
    const phrases = input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (phrases.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setCurrentGenerationProgress({ current: 0, total: phrases.length });

    try {
      for (let i = 0; i < phrases.length; i++) {
        const phrase = phrases[i];
        setCurrentGenerationProgress({ current: i + 1, total: phrases.length });

        const response = await fetch("/api/proposed-examples", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: phrase }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate proposed example for: ${phrase}`);
        }

        const data = await response.json();
        setProposedExamples((prev) => [...prev, data.proposedExample]);
      }

      // Clear input after successful generation
      setInput('');
    } catch (err: any) {
      setError("An error occurred while generating examples.");
      console.error(err);
    } finally {
      setIsGenerating(false);
      setCurrentGenerationProgress(null);
    }
  };

  const handleSaveExample = async (exampleId: number, selectedCompletion: string) => {
    try {
      const response = await fetch("/api/examples", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: proposedExamples[exampleId].input, output: selectedCompletion }),
      });

      if (!response.ok) {
        throw new Error("Failed to save example.");
      }

      // Delete the proposed example from the database
      await fetch(`/api/proposed-examples/${proposedExamples[exampleId].id}`, {
        method: "DELETE",
      });

      // Show notification
      setNotification({ id: exampleId, message: "Example added successfully!" });

      // Remove the proposed example from the list after a delay
      setTimeout(() => {
        setProposedExamples((prev) => prev.filter((_, index) => index !== exampleId));
        setNotification(null);
      }, 3000);
    } catch (err: any) {
      setError("An error occurred while saving the example.");
      console.error(err);
    }
  };

  const handleRegenerate = async (exampleId: number) => {
    try {
      const response = await fetch("/api/proposed-examples", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: proposedExamples[exampleId].input }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate proposed example.");
      }

      const data = await response.json();
      setProposedExamples((prev) =>
        prev.map((example, index) =>
          index === exampleId ? data.proposedExample : example
        )
      );
    } catch (err: any) {
      setError("An error occurred while regenerating the example.");
      console.error(err);
    }
  };

  const handleDelete = async (exampleId: number) => {
    try {
      await fetch(`/api/proposed-examples/${proposedExamples[exampleId].id}`, {
        method: "DELETE",
      });

      setProposedExamples((prev) => prev.filter((_, index) => index !== exampleId));
    } catch (err: any) {
      setError("An error occurred while deleting the example.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Generate Proposed Examples</h1>
        <div className="mb-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter phrases (one per line)"
            className="border p-2 w-full rounded min-h-[100px]"
            rows={5}
          />
          <div className="mt-2 flex items-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate Examples"}
            </button>
            {currentGenerationProgress && (
              <span className="ml-3 text-gray-600">
                Generating {currentGenerationProgress.current} of {currentGenerationProgress.total}...
              </span>
            )}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div>
          {proposedExamples.map((example, index) => (
            <div
              key={index}
              className={`mb-4 p-4 border rounded transition-all duration-500 ${
                notification?.id === index ? "bg-gray-200 opacity-50" : ""
              }`}
            >
              {notification?.id === index ? (
                <p className="text-green-500">{notification.message}</p>
              ) : (
                <>
                  <h2 className="font-bold">Input: {example.input}</h2>
                  <h3 className="font-semibold mt-2">Proposed Completions:</h3>
                  <div className="space-y-2">
                    {example.completions.map((completion: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2">
                        <textarea
                          defaultValue={completion}
                          className="border p-2 w-full"
                        />
                        <button
                          onClick={() => handleSaveExample(index, completion)}
                          className="p-2 bg-green-500 text-white rounded"
                        >
                          Add to Examples
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleRegenerate(index)}
                      className="p-2 bg-yellow-500 text-white rounded"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProposedExamplesPage;
