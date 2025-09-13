'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';

interface DashboardData {
  total_users: number;
  total_sessions: number;
  total_page_views: number;
  total_conversions: number;
  conversion_rate: number;
  avg_session_duration: number;
  bounce_rate: number;
  top_pages: Array<{ page: string; views: number }>;
  top_events: Array<{ event: string; count: number }>;
  device_breakdown: Array<{ device: string; count: number }>;
  country_breakdown: Array<{ country: string; count: number }>;
}

interface AnalyticsDashboardProps {
  isAdmin?: boolean;
}

export default function AnalyticsDashboard({ isAdmin = false }: AnalyticsDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [realTimeData, setRealTimeData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadRealTimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1h':
          startDate.setHours(endDate.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
      }

      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      if (response.ok) {
        const data = await response.json();
        setRealTimeData(data);
      }
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    }
    return `${Math.round(seconds / 3600)}h`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const data = realTimeData || dashboardData;

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Unable to load analytics data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">
            {timeRange === '1h' ? 'Last hour' : 
             timeRange === '24h' ? 'Last 24 hours' :
             timeRange === '7d' ? 'Last 7 days' : 'Last 30 days'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range as any)}
            >
              {range}
            </Button>
          ))}
          {realTimeData && (
            <Badge variant="secondary" className="animate-pulse">
              Live
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.total_users)}</div>
            <p className="text-xs text-gray-500">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.total_sessions)}</div>
            <p className="text-xs text-gray-500">User sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.total_page_views)}</div>
            <p className="text-xs text-gray-500">Total page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.total_conversions)}</div>
            <p className="text-xs text-gray-500">{data.conversion_rate.toFixed(1)}% conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Session Metrics</CardTitle>
                <CardDescription>User engagement statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Session Duration</span>
                  <span className="text-sm font-bold">
                    {data.avg_session_duration ? formatDuration(data.avg_session_duration) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bounce Rate</span>
                  <span className="text-sm font-bold">{data.bounce_rate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-sm font-bold">{data.conversion_rate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>User device distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.device_breakdown.map((device, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{device.device || 'Unknown'}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(device.count / Math.max(...data.device_breakdown.map(d => d.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{device.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.top_pages.slice(0, 10).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate">{page.page}</span>
                      <Badge variant="secondary">{page.views}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Events */}
            <Card>
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
                <CardDescription>Most triggered events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.top_events.slice(0, 10).map((event, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{event.event}</span>
                      <Badge variant="secondary">{event.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User conversion journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.total_conversions}</div>
                  <div className="text-sm text-gray-600">Total Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{data.conversion_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Monitoring</h3>
                <p className="text-gray-600">
                  Real-time performance metrics will be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
