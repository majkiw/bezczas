'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/admin/signin');
  }, [session, status, router]);

  if (!session) return null;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/signin' })}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* System Prompt Card */}
        <Link href="/admin/system-prompt" className="block">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">System Prompt</h2>
            <p className="text-gray-600">
              Configure and manage the system prompt that controls the AI's behavior.
            </p>
          </div>
        </Link>

        {/* Examples Card */}
        <Link href="/admin/examples" className="block">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Examples</h2>
            <p className="text-gray-600">
              Manage input-output examples to train and guide the AI's responses.
            </p>
          </div>
        </Link>

        {/* Proposed Examples Card */}
        <Link href="/admin/proposed-examples" className="block">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-purple-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M12 4h.01M4 12h.01M20 12h.01M4.93 4.93h.01M19.07 19.07h.01M4.93 19.07h.01M19.07 4.93h.01" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Proposed Examples</h2>
            <p className="text-gray-600">
              Generate and review proposed examples based on input phrases.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
