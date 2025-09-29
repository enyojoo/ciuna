'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Truck, 
  Settings, 
  Save,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Clock,
  User,
  FileText
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { useState } from 'react'

export default function CourierSettings() {
  const role: UserRole = 'COURIER'
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Personal Information
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+7 (999) 123-4567',
    address: 'Arbat Street 15, Moscow, Russia',
    
    // Courier Information
    vehicleType: 'Car',
    licenseNumber: 'DL123456789',
    licenseExpiry: '2025-12-31',
    insuranceNumber: 'INS987654321',
    insuranceExpiry: '2025-06-30',
    
    // Payment Settings
    paymentMethod: 'bank_transfer',
    bankAccount: '****1234',
    payoutSchedule: 'weekly',
    payoutDay: 'friday',
    
    // Availability Settings
    maxDistance: 20,
    maxDeliveries: 10,
    autoAccept: false,
    workingHours: {
      monday: { start: '09:00', end: '18:00', active: true },
      tuesday: { start: '09:00', end: '18:00', active: true },
      wednesday: { start: '09:00', end: '18:00', active: true },
      thursday: { start: '09:00', end: '18:00', active: true },
      friday: { start: '09:00', end: '20:00', active: true },
      saturday: { start: '10:00', end: '16:00', active: true },
      sunday: { start: '10:00', end: '16:00', active: false }
    },
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    orderNotifications: true,
    earningsNotifications: true,
    maintenanceAlerts: true,
    marketingEmails: false,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    locationSharing: true,
    
    // Preferences
    language: 'ru',
    timezone: 'Europe/Moscow',
    currency: 'RUB'
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success message
  }

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value
        }
      }
    }))
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your courier profile and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={settings.firstName}
                  onChange={(e) => setSettings(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={settings.lastName}
                  onChange={(e) => setSettings(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Courier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Courier Information
            </CardTitle>
            <CardDescription>
              Your vehicle and license details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={settings.vehicleType}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, vehicleType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bicycle">Bicycle</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Walking">Walking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={settings.licenseNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, licenseNumber: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">License Expiry</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={settings.licenseExpiry}
                  onChange={(e) => setSettings(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Insurance Number</Label>
                <Input
                  id="insuranceNumber"
                  value={settings.insuranceNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
              <Input
                id="insuranceExpiry"
                type="date"
                value={settings.insuranceExpiry}
                onChange={(e) => setSettings(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>
              Configure your payment method and payout schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={settings.paymentMethod}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="yoomoney">YooMoney</SelectItem>
                    <SelectItem value="qiwi">QIWI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Account Details</Label>
                <Input
                  id="bankAccount"
                  value={settings.bankAccount}
                  onChange={(e) => setSettings(prev => ({ ...prev, bankAccount: e.target.value }))}
                  placeholder="Enter account details"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                <Select
                  value={settings.payoutSchedule}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, payoutSchedule: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payoutDay">Payout Day</Label>
                <Select
                  value={settings.payoutDay}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, payoutDay: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Working Hours
            </CardTitle>
            <CardDescription>
              Set your availability for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(settings.workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-20 font-medium capitalize">{day}</div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {hours.start} - {hours.end}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={hours.active}
                      onCheckedChange={(checked) => handleWorkingHoursChange(day, 'active', checked)}
                    />
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Availability Settings
            </CardTitle>
            <CardDescription>
              Configure your delivery preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxDistance">Max Distance (km)</Label>
                <Input
                  id="maxDistance"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxDistance}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxDeliveries">Max Deliveries per Day</Label>
                <Input
                  id="maxDeliveries"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxDeliveries}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxDeliveries: Number(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoAccept">Auto-Accept Jobs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically accept available delivery jobs
                </p>
              </div>
              <Switch
                id="autoAccept"
                checked={settings.autoAccept}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAccept: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderNotifications">Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new delivery jobs
                  </p>
                </div>
                <Switch
                  id="orderNotifications"
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, orderNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="earningsNotifications">Earnings Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about earnings updates
                  </p>
                </div>
                <Switch
                  id="earningsNotifications"
                  checked={settings.earningsNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, earningsNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about app maintenance
                  </p>
                </div>
                <Switch
                  id="maintenanceAlerts"
                  checked={settings.maintenanceAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceAlerts: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="loginAlerts">Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <Switch
                  id="loginAlerts"
                  checked={settings.loginAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, loginAlerts: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="locationSharing">Location Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share your location for better job matching
                  </p>
                </div>
                <Switch
                  id="locationSharing"
                  checked={settings.locationSharing}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, locationSharing: checked }))}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Configure your app preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">Russian Ruble (₽)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  )
}
