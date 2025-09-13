'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { SecurityService, KYCVerification } from '@ciuna/sb';
import { useAuth } from '@/lib/auth-context';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Camera,
  MapPin
} from 'lucide-react';

interface KYCVerificationProps {
  onComplete?: () => void;
}

export default function KYCVerification({ onComplete }: KYCVerificationProps) {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('identity');

  // Form data
  const [documentType, setDocumentType] = useState<string>('PASSPORT');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [addressProof, setAddressProof] = useState<File | null>(null);

  useEffect(() => {
    loadKYCStatus();
  }, [user]);

  const loadKYCStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const status = await SecurityService.getKYCStatus(user.id);
      setVerifications(status);
    } catch (err) {
      console.error('Error loading KYC status:', err);
      setError('Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File, type: 'front' | 'back' | 'selfie' | 'address') => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    switch (type) {
      case 'front':
        setDocumentFront(file);
        break;
      case 'back':
        setDocumentBack(file);
        break;
      case 'selfie':
        setSelfie(file);
        break;
      case 'address':
        setAddressProof(file);
        break;
    }

    setError(null);
  };

  const handleSubmit = async (verificationType: 'IDENTITY' | 'ADDRESS' | 'DOCUMENT' | 'SELFIE') => {
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      // Upload files and get URLs (in a real app, you'd upload to Supabase Storage)
      const documentFrontUrl = documentFront ? await uploadFile(documentFront) : undefined;
      const documentBackUrl = documentBack ? await uploadFile(documentBack) : undefined;
      const selfieUrl = selfie ? await uploadFile(selfie) : undefined;
      const addressProofUrl = addressProof ? await uploadFile(addressProof) : undefined;

      const result = await SecurityService.submitKYC(
        user.id,
        verificationType,
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        addressProofUrl,
        {
          documentType,
          documentNumber,
          submittedAt: new Date().toISOString(),
        }
      );

      if (result.success) {
        setSuccess('Verification submitted successfully! We\'ll review it within 24-48 hours.');
        await loadKYCStatus();
        onComplete?.();
      } else {
        setError('Failed to submit verification. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting KYC:', err);
      setError('An error occurred while submitting verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Mock file upload - in a real app, you'd upload to Supabase Storage
    return `https://example.com/uploads/${file.name}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'IN_REVIEW':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'IN_REVIEW':
        return <Badge className="bg-yellow-100 text-yellow-800">In Review</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>Loading verification status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            Verify your identity to access all platform features and increase your account security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="selfie">Selfie</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVER_LICENSE">Driver's License</option>
                    <option value="NATIONAL_ID">National ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Enter document number"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Front
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
                        className="hidden"
                        id="document-front"
                      />
                      <label
                        htmlFor="document-front"
                        className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                      >
                        {documentFront ? documentFront.name : 'Upload front of document'}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Back
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
                        className="hidden"
                        id="document-back"
                      />
                      <label
                        htmlFor="document-back"
                        className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                      >
                        {documentBack ? documentBack.name : 'Upload back of document'}
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit('IDENTITY')}
                  disabled={submitting || !documentFront || !documentNumber}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Identity Verification'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Proof
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'address')}
                      className="hidden"
                      id="address-proof"
                    />
                    <label
                      htmlFor="address-proof"
                      className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                    >
                      {addressProof ? addressProof.name : 'Upload utility bill or bank statement'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Must be dated within the last 3 months
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit('ADDRESS')}
                  disabled={submitting || !addressProof}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Address Verification'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="selfie" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie with Document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                      className="hidden"
                      id="selfie"
                    />
                    <label
                      htmlFor="selfie"
                      className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selfie ? selfie.name : 'Upload selfie with your document'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Hold your document next to your face for verification
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit('SELFIE')}
                  disabled={submitting || !selfie}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Selfie Verification'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Status */}
      {verifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Track the status of your submitted verifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(verification.status)}
                    <div>
                      <h3 className="font-medium capitalize">
                        {verification.verification_type.toLowerCase().replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Submitted {new Date(verification.created_at).toLocaleDateString()}
                      </p>
                      {verification.rejection_reason && (
                        <p className="text-sm text-red-600 mt-1">
                          {verification.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(verification.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </div>
  );
}
