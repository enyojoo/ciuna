'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@ciuna/ui';
import { CheckCircle, XCircle, Clock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (_token: string) => {
    try {
      setStatus('loading');
      
      // Mock verification - in real app, this would call Supabase auth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      setStatus('success');
      setMessage('Your email has been successfully verified!');
    } catch (error) {
      setStatus('error');
      setMessage('Verification failed. The link may be invalid or expired.');
    }
  };

  const resendVerification = async () => {
    try {
      // Mock resend - in real app, this would call Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage('Failed to send verification email. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Clock className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Mail className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="ciuna-shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email Verification
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className={`text-lg ${getStatusColor()}`}>
                {status === 'loading' && 'Verifying your email...'}
                {status === 'success' && 'Email Verified Successfully!'}
                {status === 'error' && 'Verification Failed'}
                {status === 'expired' && 'Verification Link Expired'}
              </p>
              
              <p className="text-gray-600 mt-2">
                {message}
              </p>
            </div>

            {status === 'loading' && (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-600 font-medium">Please wait...</span>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-800 font-medium">
                      Your account is now fully activated!
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/">
                      Continue to Ciuna
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/profile">
                      Complete Your Profile
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-800 font-medium">
                      {status === 'expired' 
                        ? 'This verification link has expired'
                        : 'Unable to verify your email'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button onClick={resendVerification} className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/signin">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="border-t pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Need help with verification?
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/help">
                      Help Center
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/contact">
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This verification link is valid for 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="ciuna-shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Clock className="h-16 w-16 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Email Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
