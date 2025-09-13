'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Input } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { SecurityService } from '@ciuna/sb';
import { useAuth } from '../lib/auth-context';
import { Shield, Smartphone, Mail, Key, CheckCircle, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export default function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const { user } = useAuth();
  const [activeMethod, setActiveMethod] = useState<'SMS' | 'TOTP' | 'EMAIL'>('TOTP');
  const [step, setStep] = useState<'select' | 'setup' | 'verify' | 'complete'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Setup data
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [secret, setSecret] = useState<string>('');
  
  // Verification data
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleMethodSelect = async (method: 'SMS' | 'TOTP' | 'EMAIL') => {
    if (!user) return;
    
    setActiveMethod(method);
    setLoading(true);
    setError(null);

    try {
      let secret: string | undefined;
      let phoneNumber: string | undefined;
      let emailAddress: string | undefined;

      if (method === 'TOTP') {
        // Generate TOTP secret
        secret = generateTOTPSecret();
      } else if (method === 'SMS') {
        phoneNumber = phoneNumber;
      } else if (method === 'EMAIL') {
        emailAddress = email;
      }

      const result = await SecurityService.enable2FA(
        user.id,
        method,
        secret,
        phoneNumber,
        emailAddress
      );

      if (result.success) {
        if (result.qrCode) {
          setQrCode(result.qrCode);
          setSecret(secret || '');
        }
        if (result.backupCodes) {
          setBackupCodes(result.backupCodes);
        }
        setStep('setup');
      } else {
        setError('Failed to set up 2FA. Please try again.');
      }
    } catch (err) {
      console.error('Error setting up 2FA:', err);
      setError('An error occurred while setting up 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!user || !verificationCode) return;

    setLoading(true);
    setError(null);

    try {
      const result = await SecurityService.verify2FA(
        user.id,
        verificationCode,
        activeMethod
      );

      if (result.success) {
        setSuccess('2FA has been successfully enabled!');
        setStep('complete');
        onComplete?.();
      } else {
        setError(result.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying 2FA:', err);
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const generateTOTPSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateQRCode = async (qrData: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      setQrCode(qrCodeDataURL);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  useEffect(() => {
    if (qrCode && qrCode.startsWith('otpauth://')) {
      generateQRCode(qrCode);
    }
  }, [qrCode]);

  if (step === 'select') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Enable Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling 2FA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleMethodSelect('TOTP')}
            >
              <CardContent className="p-4 text-center">
                <Key className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">Authenticator App</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Use Google Authenticator, Authy, or similar apps
                </p>
                <Badge variant="secondary">Recommended</Badge>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleMethodSelect('SMS')}
            >
              <CardContent className="p-4 text-center">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">SMS</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Receive codes via text message
                </p>
                <Badge variant="outline">Easy Setup</Badge>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleMethodSelect('EMAIL')}
            >
              <CardContent className="p-4 text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Receive codes via email
                </p>
                <Badge variant="outline">Backup Option</Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Up {activeMethod === 'TOTP' ? 'Authenticator App' : activeMethod}</CardTitle>
          <CardDescription>
            Follow the steps below to complete your 2FA setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeMethod === 'TOTP' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Scan QR Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use your authenticator app to scan this QR code
                </p>
                {qrCode && qrCode.startsWith('data:image') ? (
                  <div className="inline-block p-4 bg-white border rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="inline-block p-4 bg-gray-100 border rounded-lg">
                    <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                      Loading QR Code...
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
                <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {secret}
                </code>
              </div>
            </div>
          )}

          {activeMethod === 'SMS' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send verification codes to this number
                </p>
              </div>
            </div>
          )}

          {activeMethod === 'EMAIL' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send verification codes to this email
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setStep('select')}
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('verify')}
              disabled={loading}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify Your {activeMethod === 'TOTP' ? 'Authenticator App' : activeMethod}</CardTitle>
          <CardDescription>
            Enter the verification code to complete setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full text-center text-lg tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              {activeMethod === 'TOTP' 
                ? 'Enter the code from your authenticator app'
                : `Enter the code sent to your ${activeMethod.toLowerCase()}`
              }
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setStep('setup')}
            >
              Back
            </Button>
            <Button
              onClick={handleVerification}
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            2FA Successfully Enabled!
          </CardTitle>
          <CardDescription>
            Your account is now protected with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {backupCodes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Save Your Backup Codes</h3>
              <p className="text-sm text-yellow-700 mb-3">
                These codes can be used to access your account if you lose your device.
                Save them in a safe place - each code can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onComplete}>
              Complete Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
