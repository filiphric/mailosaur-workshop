'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Success() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Successful!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            You have successfully logged in
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">User Information:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>User ID:</strong> {user?.id}</p>
                {user?.email && <p><strong>Email:</strong> {user.email}</p>}
                {user?.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                {user?.identifier && <p><strong>Identifier:</strong> {user.identifier}</p>}
                <p><strong>Auth Method:</strong> {user?.method || 'N/A'}</p>
                <p><strong>Login Time:</strong> {user?.loginTime ? new Date(user.loginTime).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Try Another Method
              </Link>
              
              <button
                onClick={signOut}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-xs text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}