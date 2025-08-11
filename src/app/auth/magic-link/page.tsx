'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MagicLinkAuth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/magic-link/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'An error occurred. Please try again.');
      } else {
        setMessage('Check your email for the magic link!');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="text-indigo-600 hover:text-indigo-500">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Magic Link Authentication
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to receive a magic link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleMagicLink}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-900 focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${message.includes('Check your email') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}