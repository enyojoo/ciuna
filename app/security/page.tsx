'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { SecurityService, TwoFactorAuth, APIKey, SecurityEvent } from '@ciuna/sb';
import { useAuth } from '@/lib/auth-context';
import TwoFactorSetup from '@/components/two-factor-setup';
import KYCVerification from '@/components/kyc-verification';
import { 
  Shield, 
  Key, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Trash2,
  Plus,
  Download
} from 'lucide-react';

export default function SecurityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [twoFactorSettings, setTwoFactorSettings] = useState<TwoFactorAuth[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showKYC, setShowKYC] = useState(false);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [twoFactor, keys, events] = await Promise.all([
        SecurityService.get2FASettings(user.id),
        SecurityService.getAPIKeys(user.id),
        loadSecurityEvents(user.id)
      ]);

      setTwoFactorSettings(twoFactor);
      setApiKeys(keys);
      setSecurityEvents(events);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async (userId: string): Promise<SecurityEvent[]> => {
    // Mock data - in a real app, you'd fetch from SecurityService
    return [
      {
        id: '1',
        user_id: userId,
        event_type: 'LOGIN',
        severity: 'LOW',
        description: 'Successful login from Chrome on Windows',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        location_data: { country: 'US', city: 'New York' },
        metadata: {},
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: userId,
        event_type: '2FA_ENABLED',
        severity: 'MEDIUM',
        description: 'Two-factor authentication enabled',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        location_data: { country: 'US', city: 'New York' },
        metadata: { method: 'TOTP' },
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  };

  const handleDisable2FA = async (method: 'SMS' | 'TOTP' | 'EMAIL') => {
    if (!user) return;

    try {
      const success = await SecurityService.disable2FA(user.id, method);
      if (success) {
        await loadSecurityData();
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
    }
  };

  const handleCreateAPIKey = async () => {
    if (!user) return;

    const name = prompt('Enter a name for your API key:');
    if (!name) return;

    try {
      const result = await SecurityService.generateAPIKey(user.id, name);
      if (result.success && result.apiKey) {
        alert(`Your API key: ${result.apiKey}\n\nPlease save this key securely - it won't be shown again.`);
        await loadSecurityData();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleRevokeAPIKey = async (keyId: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to revoke this API key?')) {
      try {
        const success = await SecurityService.revokeAPIKey(user.id, keyId);
        if (success) {
          await loadSecurityData();
        }
      } catch (error) {
        console.error('Error revoking API key:', error);
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access security settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (show2FASetup) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setShow2FASetup(false)}
              className="mb-4"
            >
              ← Back to Security
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
            <p className="text-gray-600 mt-2">Set up 2FA to secure your account.</p>
          </div>
          <TwoFactorSetup onComplete={() => {
            setShow2FASetup(false);
            loadSecurityData();
          }} />
        </div>
      </div>
    );
  }

  if (showKYC) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setShowKYC(false)}
              className="mb-4"
            >
              ← Back to Security
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
            <p className="text-gray-600 mt-2">Verify your identity to access all features.</p>
          </div>
          <KYCVerification onComplete={() => {
            setShowKYC(false);
            loadSecurityData();
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and privacy settings.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="2fa">2FA</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Security Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">85/100</div>
                  <p className="text-sm text-gray-600">Good security practices</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Strong password
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Email verified
                    </div>
                    {twoFactorSettings.some(settings => settings.is_enabled) && (
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        2FA enabled
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShow2FASetup(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {twoFactorSettings.some(s => s.is_enabled) ? 'Manage 2FA' : 'Enable 2FA'}
                  </Button>
                  <Button
                    onClick={() => setShowKYC(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Identity Verification
                  </Button>
                  <Button
                    onClick={handleCreateAPIKey}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create API Key
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="2fa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {twoFactorSettings.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No 2FA methods enabled
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Enable two-factor authentication to secure your account.
                    </p>
                    <Button onClick={() => setShow2FASetup(true)}>
                      Enable 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {twoFactorSettings.map((settings) => (
                      <div
                        key={settings.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Key className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {settings.method === 'TOTP' ? 'Authenticator App' : settings.method}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {settings.is_enabled ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={settings.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {settings.is_enabled ? 'Active' : 'Inactive'}
                          </Badge>
                          {settings.is_enabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisable2FA(settings.method)}
                            >
                              Disable
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => setShow2FASetup(true)}
                      className="w-full"
                      variant="outline"
                    >
                      Add Another Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for programmatic access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No API keys created
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create an API key to access our services programmatically.
                    </p>
                    <Button onClick={handleCreateAPIKey}>
                      Create API Key
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <Key className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{key.name}</h3>
                            <p className="text-sm text-gray-600">
                              Created {new Date(key.created_at).toLocaleDateString()}
                            </p>
                            {key.last_used && (
                              <p className="text-xs text-gray-500">
                                Last used {new Date(key.last_used).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {key.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                          {key.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeAPIKey(key.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={handleCreateAPIKey}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New API Key
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Activity</CardTitle>
                <CardDescription>
                  Monitor your account's security events and activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          event.severity === 'CRITICAL' ? 'bg-red-100' :
                          event.severity === 'HIGH' ? 'bg-orange-100' :
                          event.severity === 'MEDIUM' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            event.severity === 'CRITICAL' ? 'text-red-600' :
                            event.severity === 'HIGH' ? 'text-orange-600' :
                            event.severity === 'MEDIUM' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{event.description}</h3>
                          <p className="text-sm text-gray-600">
                            {event.ip_address} • {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


              <Card>

                <CardHeader>

                  <CardTitle>Quick Actions</CardTitle>

                </CardHeader>

                <CardContent className="space-y-3">

                  <Button

                    onClick={() => setShow2FASetup(true)}

                    className="w-full justify-start"

                    variant="outline"

                  >

                    <Key className="h-4 w-4 mr-2" />

                    {twoFactorSettings.some(s => s.is_enabled) ? 'Manage 2FA' : 'Enable 2FA'}

                  </Button>

                  <Button

                    onClick={() => setShowKYC(true)}

                    className="w-full justify-start"

                    variant="outline"

                  >

                    <Eye className="h-4 w-4 mr-2" />

                    Identity Verification

                  </Button>

                  <Button

                    onClick={handleCreateAPIKey}

                    className="w-full justify-start"

                    variant="outline"

                  >

                    <Plus className="h-4 w-4 mr-2" />

                    Create API Key

                  </Button>

                </CardContent>

              </Card>



              {/* Recent Activity */}

              <Card>

                <CardHeader>

                  <CardTitle>Recent Activity</CardTitle>

                </CardHeader>

                <CardContent>

                  <div className="space-y-3">

                    {securityEvents.slice(0, 3).map((event) => (

                      <div key={event.id} className="flex items-center justify-between">

                        <div>

                          <p className="text-sm font-medium">{event.description}</p>

                          <p className="text-xs text-gray-500">

                            {new Date(event.created_at).toLocaleDateString()}

                          </p>

                        </div>

                        <Badge className={getSeverityColor(event.severity)}>

                          {event.severity}

                        </Badge>

                      </div>

                    ))}

                  </div>

                </CardContent>

              </Card>

            </div>

          </TabsContent>



          {/* 2FA Tab */}

          <TabsContent value="2fa" className="space-y-6">

            <Card>

              <CardHeader>

                <CardTitle>Two-Factor Authentication</CardTitle>

                <CardDescription>

                  Add an extra layer of security to your account.

                </CardDescription>

              </CardHeader>

              <CardContent>

                {twoFactorSettings.length === 0 ? (

                  <div className="text-center py-8">

                    <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />

                    <h3 className="text-lg font-medium text-gray-900 mb-2">

                      No 2FA methods enabled

                    </h3>

                    <p className="text-gray-600 mb-4">

                      Enable two-factor authentication to secure your account.

                    </p>

                    <Button onClick={() => setShow2FASetup(true)}>

                      Enable 2FA

                    </Button>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {twoFactorSettings.map((settings) => (

                      <div

                        key={settings.id}

                        className="flex items-center justify-between p-4 border rounded-lg"

                      >

                        <div className="flex items-center space-x-3">

                          <div className="p-2 bg-blue-100 rounded-full">

                            <Key className="h-5 w-5 text-blue-600" />

                          </div>

                          <div>

                            <h3 className="font-medium">

                              {settings.method === 'TOTP' ? 'Authenticator App' : settings.method}

                            </h3>

                            <p className="text-sm text-gray-600">

                              {settings.is_enabled ? 'Enabled' : 'Disabled'}

                            </p>

                          </div>

                        </div>

                        <div className="flex items-center space-x-2">

                          <Badge className={settings.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>

                            {settings.is_enabled ? 'Active' : 'Inactive'}

                          </Badge>

                          {settings.is_enabled && (

                            <Button

                              variant="outline"

                              size="sm"

                              onClick={() => handleDisable2FA(settings.method)}

                            >

                              Disable

                            </Button>

                          )}

                        </div>

                      </div>

                    ))}

                    <Button

                      onClick={() => setShow2FASetup(true)}

                      className="w-full"

                      variant="outline"

                    >

                      Add Another Method

                    </Button>

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>



          {/* API Keys Tab */}

          <TabsContent value="api" className="space-y-6">

            <Card>

              <CardHeader>

                <CardTitle>API Keys</CardTitle>

                <CardDescription>

                  Manage your API keys for programmatic access.

                </CardDescription>

              </CardHeader>

              <CardContent>

                {apiKeys.length === 0 ? (

                  <div className="text-center py-8">

                    <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />

                    <h3 className="text-lg font-medium text-gray-900 mb-2">

                      No API keys created

                    </h3>

                    <p className="text-gray-600 mb-4">

                      Create an API key to access our services programmatically.

                    </p>

                    <Button onClick={handleCreateAPIKey}>

                      Create API Key

                    </Button>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {apiKeys.map((key) => (

                      <div

                        key={key.id}

                        className="flex items-center justify-between p-4 border rounded-lg"

                      >

                        <div className="flex items-center space-x-3">

                          <div className="p-2 bg-purple-100 rounded-full">

                            <Key className="h-5 w-5 text-purple-600" />

                          </div>

                          <div>

                            <h3 className="font-medium">{key.name}</h3>

                            <p className="text-sm text-gray-600">

                              Created {new Date(key.created_at).toLocaleDateString()}

                            </p>

                            {key.last_used && (

                              <p className="text-xs text-gray-500">

                                Last used {new Date(key.last_used).toLocaleDateString()}

                              </p>

                            )}

                          </div>

                        </div>

                        <div className="flex items-center space-x-2">

                          <Badge className={key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>

                            {key.is_active ? 'Active' : 'Revoked'}

                          </Badge>

                          {key.is_active && (

                            <Button

                              variant="outline"

                              size="sm"

                              onClick={() => handleRevokeAPIKey(key.id)}

                            >

                              <Trash2 className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>

                    ))}

                    <Button

                      onClick={handleCreateAPIKey}

                      className="w-full"

                      variant="outline"

                    >

                      <Plus className="h-4 w-4 mr-2" />

                      Create New API Key

                    </Button>

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>



          {/* Activity Tab */}

          <TabsContent value="activity" className="space-y-6">

            <Card>

              <CardHeader>

                <CardTitle>Security Activity</CardTitle>

                <CardDescription>

                  Monitor your account's security events and activities.

                </CardDescription>

              </CardHeader>

              <CardContent>

                <div className="space-y-4">

                  {securityEvents.map((event) => (

                    <div

                      key={event.id}

                      className="flex items-center justify-between p-4 border rounded-lg"

                    >

                      <div className="flex items-center space-x-3">

                        <div className={`p-2 rounded-full ${

                          event.severity === 'CRITICAL' ? 'bg-red-100' :

                          event.severity === 'HIGH' ? 'bg-orange-100' :

                          event.severity === 'MEDIUM' ? 'bg-yellow-100' :

                          'bg-green-100'

                        }`}>

                          <AlertTriangle className={`h-4 w-4 ${

                            event.severity === 'CRITICAL' ? 'text-red-600' :

                            event.severity === 'HIGH' ? 'text-orange-600' :

                            event.severity === 'MEDIUM' ? 'text-yellow-600' :

                            'text-green-600'

                          }`} />

                        </div>

                        <div>

                          <h3 className="font-medium">{event.description}</h3>

                          <p className="text-sm text-gray-600">

                            {event.ip_address} • {new Date(event.created_at).toLocaleString()}

                          </p>

                        </div>

                      </div>

                      <Badge className={getSeverityColor(event.severity)}>

                        {event.severity}

                      </Badge>

                    </div>

                  ))}

                </div>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

    </div>

  );

}


