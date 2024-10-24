'use client';

import React, { useState, useEffect } from "react";

const ProposedExamplesPage: React.FC = () => {
  const [input, setInput] = useState("");
  const [proposedExamples, setProposedExamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ id: number; message: string } | null>(null);

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
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/proposed-examples", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate proposed examples.");
      }

      const data = await response.json();
      setProposedExamples((prev) => [...prev, data.proposedExample]);
    } catch (err: any) {
      setError("An error occurred while generating examples.");
      console.error(err);
    } finally {
      setLoading(false);
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Proposed Examples</h1>
      <div className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a phrase"
          className="border p-2 w-full"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-2 p-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Generating..." : "Generate Examples"}
        </button>
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
  );
};

export default ProposedExamplesPage;
