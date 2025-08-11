'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TOTPAuth() {
  const [identifier, setIdentifier] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const router = useRouter();

  const setupTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/totp/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'An error occurred. Please try again.');
      } else {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('verify');
        setMessage('Scan the QR code with your authenticator app, then enter the 6-digit code.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, code: totpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('No TOTP setup found')) {
          setMessage('Setup not found. Please restart the setup process.');
          setStep('setup');
          setQrCode('');
          setSecret('');
          setTotpCode('');
        } else {
          setMessage(data.error || 'An error occurred. Please try again.');
        }
        
        // Log debug info for development
        if (data.debug) {
          console.log('TOTP Debug:', data.debug);
        }
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
        <Link href="/" className="text-purple-600 hover:text-purple-500">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Authenticator App (TOTP)
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'setup' && 'Enter your email or phone to set up TOTP authentication'}
          {step === 'verify' && 'Enter the code from your authenticator app'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
          {step === 'setup' && (
            <form className="space-y-6" onSubmit={setupTOTP}>
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Email or Phone
                </label>
                <div className="mt-1">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-900 focus:outline-hidden focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900"
                    placeholder="your@email.com or +1234567890"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use email or phone number (with country code)
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting up...' : 'Setup TOTP'}
                </button>
              </div>
            </form>
          )}

          {step === 'verify' && qrCode && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="bg-white p-4 rounded-lg border flex justify-center">
                  <img src={qrCode} alt="TOTP QR Code" className="max-w-full h-auto" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Manual entry key: <code className="bg-gray-100 px-1 rounded-sm">{secret}</code>
                </p>
              </div>
              
              <form className="space-y-6" onSubmit={verifyTOTP}>
                <div>
                  <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="totpCode"
                      name="totpCode"
                      type="text"
                      required
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-hidden focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-center text-lg tracking-widest text-gray-900"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify & Complete Setup'}
                  </button>
                </div>
              </form>
            </div>
          )}


          {message && (
            <div className={`mt-4 p-4 rounded-md ${message.includes('Scan the QR') 
              ? 'bg-blue-50 text-blue-700' 
              : message.includes('error') || message.includes('Error')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}