'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { SecurityService, PrivacyRequest, UserConsent } from '@ciuna/sb';
import { useAuth } from '@/lib/auth-context';
import { 
  Shield, 
  Download, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock,
  FileText,
  Eye,
  AlertTriangle
} from 'lucide-react';

export default function PrivacyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadPrivacyData();
    }
  }, [user]);

  const loadPrivacyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [requests, userConsents] = await Promise.all([
        SecurityService.getPrivacyRequests(user.id),
        SecurityService.getConsents(user.id)
      ]);

      setPrivacyRequests(requests);
      setConsents(userConsents);
    } catch (error) {
      console.error('Error loading privacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    if (!user) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const result = await SecurityService.submitPrivacyRequest(
        user.id,
        'DATA_EXPORT',
        'Request for personal data export',
        { includeAll: true }
      );

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Data export request submitted. You will receive an email with your data within 30 days.' 
        });
        await loadPrivacyData();
      } else {
        setMessage({ type: 'error', text: 'Failed to submit data export request.' });
      }
    } catch (error) {
      console.error('Error submitting data export:', error);
      setMessage({ type: 'error', text: 'An error occurred while submitting your request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to request data deletion? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const result = await SecurityService.submitPrivacyRequest(
        user.id,
        'DATA_DELETION',
        'Request for complete data deletion',
        { confirmDeletion: true }
      );

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Data deletion request submitted. Your account will be deleted within 30 days.' 
        });
        await loadPrivacyData();
      } else {
        setMessage({ type: 'error', text: 'Failed to submit data deletion request.' });
      }
    } catch (error) {
      console.error('Error submitting data deletion:', error);
      setMessage({ type: 'error', text: 'An error occurred while submitting your request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConsentUpdate = async (consentType: string, granted: boolean) => {
    if (!user) return;

    try {
      const success = await SecurityService.updateConsent(
        user.id,
        consentType,
        granted,
        `Updated consent for ${consentType}`,
        '1.0'
      );

      if (success) {
        await loadPrivacyData();
        setMessage({ 
          type: 'success', 
          text: `Consent ${granted ? 'granted' : 'withdrawn'} successfully.` 
        });
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      setMessage({ type: 'error', text: 'Failed to update consent.' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'REJECTED':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access privacy settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy & Data Protection</h1>
          <p className="text-gray-600 mt-2">
            Manage your privacy settings and data protection rights under GDPR and other regulations.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue="rights" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rights">Your Rights</TabsTrigger>
            <TabsTrigger value="consent">Consent</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Your Rights Tab */}
          <TabsContent value="rights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Data Export
                  </CardTitle>
                  <CardDescription>
                    Download a copy of all your personal data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    You have the right to receive a copy of all personal data we hold about you in a structured, 
                    machine-readable format.
                  </p>
                  <Button
                    onClick={handleDataExport}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? 'Requesting...' : 'Request Data Export'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Data Rectification
                  </CardTitle>
                  <CardDescription>
                    Request correction of inaccurate personal data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    You have the right to have inaccurate personal data corrected and incomplete data completed.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = '/settings'}
                  >
                    Update Your Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Data Deletion
                  </CardTitle>
                  <CardDescription>
                    Request complete deletion of your personal data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    You have the right to request the deletion of your personal data under certain circumstances.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDataDeletion}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? 'Requesting...' : 'Request Data Deletion'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Data Portability
                  </CardTitle>
                  <CardDescription>
                    Transfer your data to another service.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    You have the right to receive your personal data in a structured format and transfer it to another controller.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDataExport}
                    disabled={submitting}
                  >
                    {submitting ? 'Preparing...' : 'Request Data Transfer'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Privacy Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Privacy Rights</CardTitle>
                <CardDescription>
                  Understanding your rights under data protection laws.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Right to Information</h3>
                    <p className="text-sm text-gray-600">
                      You have the right to know what personal data we collect, how we use it, and who we share it with.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Access</h3>
                    <p className="text-sm text-gray-600">
                      You can request access to all personal data we hold about you and information about how we process it.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Rectification</h3>
                    <p className="text-sm text-gray-600">
                      You can request correction of any inaccurate or incomplete personal data we hold about you.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Erasure</h3>
                    <p className="text-sm text-gray-600">
                      You can request deletion of your personal data in certain circumstances, such as when it's no longer necessary.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Right to Object</h3>
                    <p className="text-sm text-gray-600">
                      You can object to processing of your personal data for direct marketing or legitimate interests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent Tab */}
          <TabsContent value="consent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consent Management</CardTitle>
                <CardDescription>
                  Manage your consent preferences for different types of data processing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      type: 'MARKETING_EMAILS',
                      title: 'Marketing Emails',
                      description: 'Receive promotional emails and newsletters about our services and products.',
                      current: consents.find(c => c.consent_type === 'MARKETING_EMAILS')?.granted || false
                    },
                    {
                      type: 'ANALYTICS_TRACKING',
                      title: 'Analytics Tracking',
                      description: 'Allow us to collect anonymous usage data to improve our services.',
                      current: consents.find(c => c.consent_type === 'ANALYTICS_TRACKING')?.granted || false
                    },
                    {
                      type: 'COOKIES',
                      title: 'Cookies',
                      description: 'Allow us to use cookies to enhance your browsing experience.',
                      current: consents.find(c => c.consent_type === 'COOKIES')?.granted || false
                    },
                    {
                      type: 'DATA_PROCESSING',
                      title: 'Data Processing',
                      description: 'Allow us to process your personal data to provide our services.',
                      current: consents.find(c => c.consent_type === 'DATA_PROCESSING')?.granted || true
                    },
                    {
                      type: 'THIRD_PARTY_SHARING',
                      title: 'Third-Party Sharing',
                      description: 'Allow us to share your data with trusted third-party service providers.',
                      current: consents.find(c => c.consent_type === 'THIRD_PARTY_SHARING')?.granted || false
                    }
                  ].map((consent) => (
                    <div key={consent.type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{consent.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{consent.description}</p>
                        <div className="flex items-center mt-2">
                          <Badge className={consent.current ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {consent.current ? 'Consented' : 'Not Consented'}
                          </Badge>
                          {consent.current && (
                            <span className="text-xs text-gray-500 ml-2">
                              Since {consents.find(c => c.consent_type === consent.type)?.granted_at ? 
                                new Date(consents.find(c => c.consent_type === consent.type)!.granted_at).toLocaleDateString() : 
                                'Recently'
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant={consent.current ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleConsentUpdate(consent.type, !consent.current)}
                        >
                          {consent.current ? 'Withdraw' : 'Grant'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Requests</CardTitle>
                <CardDescription>
                  Track the status of your privacy-related requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {privacyRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No privacy requests
                    </h3>
                    <p className="text-gray-600">
                      You haven't submitted any privacy requests yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {privacyRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <h3 className="font-medium capitalize">
                              {request.request_type.toLowerCase().replace('_', ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Submitted {new Date(request.created_at).toLocaleDateString()}
                            </p>
                            {request.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {request.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status)}
                          {request.status === 'COMPLETED' && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

                    You have the right to have inaccurate personal data corrected and incomplete data completed.

                  </p>

                  <Button

                    variant="outline"

                    className="w-full"

                    onClick={() => window.location.href = '/settings'}

                  >

                    Update Your Data

                  </Button>

                </CardContent>

              </Card>



              <Card>

                <CardHeader>

                  <CardTitle className="flex items-center">

                    <Trash2 className="h-5 w-5 mr-2" />

                    Data Deletion

                  </CardTitle>

                  <CardDescription>

                    Request complete deletion of your personal data.

                  </CardDescription>

                </CardHeader>

                <CardContent>

                  <p className="text-sm text-gray-600 mb-4">

                    You have the right to request the deletion of your personal data under certain circumstances.

                  </p>

                  <Button

                    variant="destructive"

                    onClick={handleDataDeletion}

                    disabled={submitting}

                    className="w-full"

                  >

                    {submitting ? 'Requesting...' : 'Request Data Deletion'}

                  </Button>

                </CardContent>

              </Card>



              <Card>

                <CardHeader>

                  <CardTitle className="flex items-center">

                    <Eye className="h-5 w-5 mr-2" />

                    Data Portability

                  </CardTitle>

                  <CardDescription>

                    Transfer your data to another service.

                  </CardDescription>

                </CardHeader>

                <CardContent>

                  <p className="text-sm text-gray-600 mb-4">

                    You have the right to receive your personal data in a structured format and transfer it to another controller.

                  </p>

                  <Button

                    variant="outline"

                    className="w-full"

                    onClick={handleDataExport}

                    disabled={submitting}

                  >

                    {submitting ? 'Preparing...' : 'Request Data Transfer'}

                  </Button>

                </CardContent>

              </Card>

            </div>



            {/* Privacy Information */}

            <Card>

              <CardHeader>

                <CardTitle>Your Privacy Rights</CardTitle>

                <CardDescription>

                  Understanding your rights under data protection laws.

                </CardDescription>

              </CardHeader>

              <CardContent>

                <div className="space-y-4">

                  <div>

                    <h3 className="font-semibold mb-2">Right to Information</h3>

                    <p className="text-sm text-gray-600">

                      You have the right to know what personal data we collect, how we use it, and who we share it with.

                    </p>

                  </div>

                  <div>

                    <h3 className="font-semibold mb-2">Right to Access</h3>

                    <p className="text-sm text-gray-600">

                      You can request access to all personal data we hold about you and information about how we process it.

                    </p>

                  </div>

                  <div>

                    <h3 className="font-semibold mb-2">Right to Rectification</h3>

                    <p className="text-sm text-gray-600">

                      You can request correction of any inaccurate or incomplete personal data we hold about you.

                    </p>

                  </div>

                  <div>

                    <h3 className="font-semibold mb-2">Right to Erasure</h3>

                    <p className="text-sm text-gray-600">

                      You can request deletion of your personal data in certain circumstances, such as when it's no longer necessary.

                    </p>

                  </div>

                  <div>

                    <h3 className="font-semibold mb-2">Right to Object</h3>

                    <p className="text-sm text-gray-600">

                      You can object to processing of your personal data for direct marketing or legitimate interests.

                    </p>

                  </div>

                </div>

              </CardContent>

            </Card>

          </TabsContent>



          {/* Consent Tab */}

          <TabsContent value="consent" className="space-y-6">

            <Card>

              <CardHeader>

                <CardTitle>Consent Management</CardTitle>

                <CardDescription>

                  Manage your consent preferences for different types of data processing.

                </CardDescription>

              </CardHeader>

              <CardContent>

                <div className="space-y-6">

                  {[

                    {

                      type: 'MARKETING_EMAILS',

                      title: 'Marketing Emails',

                      description: 'Receive promotional emails and newsletters about our services and products.',

                      current: consents.find(c => c.consent_type === 'MARKETING_EMAILS')?.granted || false

                    },

                    {

                      type: 'ANALYTICS_TRACKING',

                      title: 'Analytics Tracking',

                      description: 'Allow us to collect anonymous usage data to improve our services.',

                      current: consents.find(c => c.consent_type === 'ANALYTICS_TRACKING')?.granted || false

                    },

                    {

                      type: 'COOKIES',

                      title: 'Cookies',

                      description: 'Allow us to use cookies to enhance your browsing experience.',

                      current: consents.find(c => c.consent_type === 'COOKIES')?.granted || false

                    },

                    {

                      type: 'DATA_PROCESSING',

                      title: 'Data Processing',

                      description: 'Allow us to process your personal data to provide our services.',

                      current: consents.find(c => c.consent_type === 'DATA_PROCESSING')?.granted || true

                    },

                    {

                      type: 'THIRD_PARTY_SHARING',

                      title: 'Third-Party Sharing',

                      description: 'Allow us to share your data with trusted third-party service providers.',

                      current: consents.find(c => c.consent_type === 'THIRD_PARTY_SHARING')?.granted || false

                    }

                  ].map((consent) => (

                    <div key={consent.type} className="flex items-center justify-between p-4 border rounded-lg">

                      <div className="flex-1">

                        <h3 className="font-medium">{consent.title}</h3>

                        <p className="text-sm text-gray-600 mt-1">{consent.description}</p>

                        <div className="flex items-center mt-2">

                          <Badge className={consent.current ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>

                            {consent.current ? 'Consented' : 'Not Consented'}

                          </Badge>

                          {consent.current && (

                            <span className="text-xs text-gray-500 ml-2">

                              Since {consents.find(c => c.consent_type === consent.type)?.granted_at ? 

                                new Date(consents.find(c => c.consent_type === consent.type)!.granted_at).toLocaleDateString() : 

                                'Recently'

                              }

                            </span>

                          )}

                        </div>

                      </div>

                      <div className="ml-4">

                        <Button

                          variant={consent.current ? 'destructive' : 'default'}

                          size="sm"

                          onClick={() => handleConsentUpdate(consent.type, !consent.current)}

                        >

                          {consent.current ? 'Withdraw' : 'Grant'}

                        </Button>

                      </div>

                    </div>

                  ))}

                </div>

              </CardContent>

            </Card>

          </TabsContent>



          {/* Requests Tab */}

          <TabsContent value="requests" className="space-y-6">

            <Card>

              <CardHeader>

                <CardTitle>Privacy Requests</CardTitle>

                <CardDescription>

                  Track the status of your privacy-related requests.

                </CardDescription>

              </CardHeader>

              <CardContent>

                {privacyRequests.length === 0 ? (

                  <div className="text-center py-8">

                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />

                    <h3 className="text-lg font-medium text-gray-900 mb-2">

                      No privacy requests

                    </h3>

                    <p className="text-gray-600">

                      You haven't submitted any privacy requests yet.

                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {privacyRequests.map((request) => (

                      <div

                        key={request.id}

                        className="flex items-center justify-between p-4 border rounded-lg"

                      >

                        <div className="flex items-center space-x-3">

                          {getStatusIcon(request.status)}

                          <div>

                            <h3 className="font-medium capitalize">

                              {request.request_type.toLowerCase().replace('_', ' ')}

                            </h3>

                            <p className="text-sm text-gray-600">

                              Submitted {new Date(request.created_at).toLocaleDateString()}

                            </p>

                            {request.description && (

                              <p className="text-sm text-gray-500 mt-1">

                                {request.description}

                              </p>

                            )}

                          </div>

                        </div>

                        <div className="flex items-center space-x-2">

                          {getStatusBadge(request.status)}

                          {request.status === 'COMPLETED' && (

                            <Button variant="outline" size="sm">

                              <Download className="h-4 w-4 mr-1" />

                              Download

                            </Button>

                          )}

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

    </div>

  );

}


