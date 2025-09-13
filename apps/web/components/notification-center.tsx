'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@ciuna/ui';
import { NotificationType, NotificationStatus } from '@ciuna/types';

interface Notification {
  id: string;
  type: NotificationType;
  channel: string;
  status: NotificationStatus;
  subject?: string;
  title: string;
  content: string;
  data: Record<string, any>;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

interface NotificationCenterProps {
  userId: string;
}

const NOTIFICATION_ICONS: { [key in NotificationType]: string } = {
  ORDER_UPDATE: '📦',
  MESSAGE: '💬',
  BOOKING_CONFIRMATION: '📅',
  DEAL_CLOSED: '✅',
  ADMIN_ALERT: '⚠️',
  PROMOTION: '🎉',
  PAYMENT_RECEIVED: '💰',
  PAYMENT_SENT: '💸',
  SHIPPING_UPDATE: '🚚',
  REVIEW_REQUEST: '⭐',
  LISTING_APPROVED: '✅',
  LISTING_REJECTED: '❌',
  VENDOR_APPROVED: '🏪',
  VENDOR_REJECTED: '❌',
  SERVICE_BOOKING: '🔧',
  GROUP_BUY_UPDATE: '👥',
  SECURITY_ALERT: '🔒',
  WELCOME: '👋',
  PASSWORD_RESET: '🔑',
  EMAIL_VERIFICATION: '📧'
};

const NOTIFICATION_COLORS: { [key in NotificationType]: string } = {
  ORDER_UPDATE: 'bg-blue-100 text-blue-800',
  MESSAGE: 'bg-green-100 text-green-800',
  BOOKING_CONFIRMATION: 'bg-purple-100 text-purple-800',
  DEAL_CLOSED: 'bg-emerald-100 text-emerald-800',
  ADMIN_ALERT: 'bg-red-100 text-red-800',
  PROMOTION: 'bg-yellow-100 text-yellow-800',
  PAYMENT_RECEIVED: 'bg-green-100 text-green-800',
  PAYMENT_SENT: 'bg-blue-100 text-blue-800',
  SHIPPING_UPDATE: 'bg-orange-100 text-orange-800',
  REVIEW_REQUEST: 'bg-yellow-100 text-yellow-800',
  LISTING_APPROVED: 'bg-green-100 text-green-800',
  LISTING_REJECTED: 'bg-red-100 text-red-800',
  VENDOR_APPROVED: 'bg-green-100 text-green-800',
  VENDOR_REJECTED: 'bg-red-100 text-red-800',
  SERVICE_BOOKING: 'bg-purple-100 text-purple-800',
  GROUP_BUY_UPDATE: 'bg-indigo-100 text-indigo-800',
  SECURITY_ALERT: 'bg-red-100 text-red-800',
  WELCOME: 'bg-blue-100 text-blue-800',
  PASSWORD_RESET: 'bg-orange-100 text-orange-800',
  EMAIL_VERIFICATION: 'bg-blue-100 text-blue-800'
};

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [userId, filter]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(
        `/api/user/notifications?userId=${userId}&unreadOnly=${filter === 'unread'}`
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      await Promise.all(
        unreadNotifications.map(notif => markAsRead(notif.id))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Loading your notifications...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              {filter === 'all' 
                ? `${notifications.length} total notifications`
                : `${unreadCount} unread notifications`
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'You\'re all caught up!'
                : 'You\'ll see notifications here when you receive them.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                  notification.read_at 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {NOTIFICATION_ICONS[notification.type]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${NOTIFICATION_COLORS[notification.type]}`}
                        >
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTimeAgo(notification.created_at)}</span>
                        <span className="capitalize">{notification.channel.toLowerCase()}</span>
                        {notification.status && (
                          <span className="capitalize">{notification.status.toLowerCase()}</span>
                        )}
                      </div>
                    </div>
                    {!notification.read_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
