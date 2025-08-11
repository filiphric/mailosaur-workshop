import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Mailosaur OTP Demo
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose your authentication method
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <Link
              href="/auth/magic-link"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Magic Link Login
            </Link>
            
            <Link
              href="/auth/sms"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              SMS Authentication
            </Link>
            
            <Link
              href="/auth/totp"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Authenticator App (TOTP)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}