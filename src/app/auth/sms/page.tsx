'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SMSAuth() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const router = useRouter();

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'An error occurred. Please try again.');
      } else {
        setStep('verify');
        setMessage('SMS sent! Enter the verification code.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/sms/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'An error occurred. Please try again.');
      } else {
        router.push('/success');
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
        <Link href="/" className="text-green-600 hover:text-green-500">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SMS Authentication
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'phone' 
            ? 'Enter your phone number to receive an SMS code'
            : 'Enter the verification code sent to your phone'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            <form className="space-y-6" onSubmit={sendOTP}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900"
                    placeholder="+1234567890"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send SMS Code'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={verifyOTP}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-hidden focus:ring-green-500 focus:border-green-500 sm:text-sm text-center text-lg tracking-widest text-gray-900"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-xs text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          )}

          {message && (
            <div className={`mt-4 p-4 rounded-md ${message.includes('SMS sent') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}