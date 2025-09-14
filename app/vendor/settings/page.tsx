'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Store, 
  Settings, 
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Truck,
  Bell,
  Shield,
  DollarSign,
  Package
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { useState } from 'react'

export default function VendorSettings() {
  const role: UserRole = 'VENDOR'
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Store Information
    storeName: 'Tech Store Moscow',
    storeDescription: 'Premium electronics and gadgets store in Moscow. We offer the latest technology with competitive prices and excellent customer service.',
    storeCategory: 'Electronics',
    storeWebsite: 'https://techstoremoscow.ru',
    storePhone: '+7 (495) 123-4567',
    storeEmail: 'info@techstoremoscow.ru',
    storeAddress: 'Tverskaya Street 10, Moscow, Russia',
    
    // Business Information
    businessType: 'LLC',
    taxId: '1234567890',
    businessLicense: 'LIC-2024-001',
    
    // Payment Settings
    paymentMethods: ['stripe', 'yoomoney', 'bank_transfer'],
    payoutSchedule: 'weekly',
    payoutDay: 'friday',
    bankAccount: '****1234',
    
    // Shipping Settings
    shippingProviders: ['russian_post', 'cdek', 'local_courier'],
    freeShippingThreshold: 5000,
    shippingZones: ['moscow', 'russia', 'international'],
    
    // Notification Settings
    emailNotifications: true,
    orderNotifications: true,
    inventoryAlerts: true,
    customerMessages: true,
    marketingEmails: false,
    
    // Store Preferences
    currency: 'RUB',
    language: 'ru',
    timezone: 'Europe/Moscow',
    autoAcceptOrders: false,
    requireApproval: false,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    apiAccess: false
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success message
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Store Settings</h1>
            <p className="text-muted-foreground">
              Manage your store configuration and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>
              Basic information about your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeCategory">Store Category</Label>
                <Select
                  value={settings.storeCategory}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, storeCategory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={settings.storeDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, storeDescription: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeWebsite">Website</Label>
                <Input
                  id="storeWebsite"
                  value={settings.storeWebsite}
                  onChange={(e) => setSettings(prev => ({ ...prev, storeWebsite: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storePhone">Phone</Label>
                <Input
                  id="storePhone"
                  value={settings.storePhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, storePhone: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeAddress">Address</Label>
              <Input
                id="storeAddress"
                value={settings.storeAddress}
                onChange={(e) => setSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Legal and business details for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={settings.businessType}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LLC">LLC</SelectItem>
                    <SelectItem value="Corporation">Corporation</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={settings.taxId}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxId: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessLicense">Business License</Label>
              <Input
                id="businessLicense"
                value={settings.businessLicense}
                onChange={(e) => setSettings(prev => ({ ...prev, businessLicense: e.target.value }))}
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
              Configure payment methods and payout settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Methods</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['stripe', 'yoomoney', 'bank_transfer', 'paypal'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={method}
                      checked={settings.paymentMethods.includes(method)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings(prev => ({
                            ...prev,
                            paymentMethods: [...prev.paymentMethods, method]
                          }))
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            paymentMethods: prev.paymentMethods.filter(m => m !== method)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={method} className="text-sm capitalize">
                      {method.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
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
            
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Input
                id="bankAccount"
                value={settings.bankAccount}
                onChange={(e) => setSettings(prev => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="Enter bank account details"
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Settings
            </CardTitle>
            <CardDescription>
              Configure shipping options and zones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Shipping Providers</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['russian_post', 'cdek', 'local_courier', 'dhl'].map((provider) => (
                  <div key={provider} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={provider}
                      checked={settings.shippingProviders.includes(provider)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings(prev => ({
                            ...prev,
                            shippingProviders: [...prev.shippingProviders, provider]
                          }))
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            shippingProviders: prev.shippingProviders.filter(p => p !== provider)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={provider} className="text-sm capitalize">
                      {provider.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Shipping Zones</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['moscow', 'russia', 'international'].map((zone) => (
                  <div key={zone} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={zone}
                      checked={settings.shippingZones.includes(zone)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings(prev => ({
                            ...prev,
                            shippingZones: [...prev.shippingZones, zone]
                          }))
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            shippingZones: prev.shippingZones.filter(z => z !== zone)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={zone} className="text-sm capitalize">
                      {zone}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₽)</Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
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
                  <Label htmlFor="orderNotifications">Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new orders
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
                  <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when inventory is low
                  </p>
                </div>
                <Switch
                  id="inventoryAlerts"
                  checked={settings.inventoryAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, inventoryAlerts: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="customerMessages">Customer Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about customer messages
                  </p>
                </div>
                <Switch
                  id="customerMessages"
                  checked={settings.customerMessages}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, customerMessages: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Store Preferences
            </CardTitle>
            <CardDescription>
              Configure your store's default settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAcceptOrders">Auto-Accept Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically accept new orders
                  </p>
                </div>
                <Switch
                  id="autoAcceptOrders"
                  checked={settings.autoAcceptOrders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAcceptOrders: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireApproval">Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Require admin approval for new products
                  </p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireApproval: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  )
}
