'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Truck, 
  ArrowLeft, 
  Mail, 
  Lock, 
  MapPin,
  DollarSign,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SupportedCurrency } from '@/lib/currency'
import { UserLocation } from '@/lib/location'

const locations: { value: UserLocation; label: string }[] = [
  { value: 'russia', label: 'Russia' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'germany', label: 'Germany' },
  { value: 'other', label: 'Other' }
]

const currencies: { value: SupportedCurrency; label: string; symbol: string }[] = [
  { value: 'RUB', label: 'Russian Ruble', symbol: '₽' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' }
]

const vehicleTypes = [
  'Bicycle',
  'Motorcycle',
  'Car',
  'Van',
  'Truck',
  'Walking'
]

export default function CourierSignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    vehicleType: '',
    licenseNumber: '',
    location: 'russia' as UserLocation,
    currency: 'RUB' as SupportedCurrency,
    agreeToTerms: false,
    agreeToCourierTerms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!formData.agreeToTerms || !formData.agreeToCourierTerms) {
      alert('Please agree to all terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'COURIER'
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Create courier profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'COURIER',
            location: formData.location,
            base_currency: formData.currency,
            currency_preferences: [formData.currency],
            feature_access: {
              canBuy: true,
              canList: false,
              canSell: false,
              canCourier: true,
              canAdmin: false
            },
            phone: formData.phone,
            vehicle_type: formData.vehicleType,
            license_number: formData.licenseNumber
          })

        if (profileError) {
          throw profileError
        }

        // Redirect to courier dashboard
        router.push('/courier/dashboard')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      alert('An error occurred during sign up. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 w-fit">
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Courier Account Setup</CardTitle>
            <CardDescription>
              Complete your courier account setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              {/* Vehicle Information */}
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number (if applicable)</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="Enter license number"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Service Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value as UserLocation }))}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as SupportedCurrency }))}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.symbol} {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <a href="/terms" className="text-orange-600 hover:underline">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-orange-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="courierTerms"
                    checked={formData.agreeToCourierTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToCourierTerms: !!checked }))}
                  />
                  <Label htmlFor="courierTerms" className="text-sm">
                    I agree to the{' '}
                    <a href="/courier-terms" className="text-orange-600 hover:underline">
                      Courier Terms and Conditions
                    </a>
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Courier Account...' : 'Create Courier Account'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Courier Benefits */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              Courier Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                Accept delivery jobs on your schedule
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                Track your earnings in real-time
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                Set your availability and working hours
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                Manage delivery routes efficiently
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                Build your courier profile and ratings
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
