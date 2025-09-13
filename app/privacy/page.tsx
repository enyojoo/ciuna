'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Shield, Eye, Database, Settings, Download, Trash2 } from 'lucide-react';

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy & Data Protection
          </h1>
          <p className="text-gray-600">
            Manage your privacy settings and data preferences.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">My Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Data Protection
                  </CardTitle>
                  <CardDescription>
                    Your data is protected with industry-standard encryption
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    We use end-to-end encryption to protect your personal information and ensure your privacy is maintained at all times.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Transparency
                  </CardTitle>
                  <CardDescription>
                    Full transparency about how we use your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    We believe in complete transparency about what data we collect and how we use it to improve your experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Control
                  </CardTitle>
                  <CardDescription>
                    You have full control over your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    You can view, download, or delete your data at any time. Your privacy is in your hands.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
                <CardDescription>
                  Under GDPR and other privacy laws, you have the following rights:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">Right to Access</h3>
                    <p className="text-sm text-gray-600">
                      You have the right to request access to the personal data we hold about you.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">Right to Rectification</h3>
                    <p className="text-sm text-gray-600">
                      You have the right to have inaccurate personal data corrected and incomplete data completed.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">Right to Erasure</h3>
                    <p className="text-sm text-gray-600">
                      You have the right to request the deletion of your personal data in certain circumstances.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">Right to Portability</h3>
                    <p className="text-sm text-gray-600">
                      You have the right to receive your personal data in a structured, commonly used format.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Your Data
                </CardTitle>
                <CardDescription>
                  View and manage your personal data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Profile Information</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Your account details, preferences, and profile information.
                    </p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Data
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Activity Data</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Your listings, messages, and marketplace activity.
                    </p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your data is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Analytics</h3>
                      <p className="text-sm text-gray-600">Allow us to collect analytics data to improve our service</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Marketing</h3>
                      <p className="text-sm text-gray-600">Receive marketing emails and promotional content</p>
                    </div>
                    <Button variant="outline" size="sm">Disable</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Data Sharing</h3>
                      <p className="text-sm text-gray-600">Allow sharing of anonymized data with partners</p>
                    </div>
                    <Button variant="outline" size="sm">Disable</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Data Requests</CardTitle>
                <CardDescription>
                  Submit requests for your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Download My Data</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Request a copy of all your personal data.
                    </p>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Request Download
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Delete My Account</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}