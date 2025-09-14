'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  MapPin, 
  Calendar,
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Truck,
  Navigation
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { useState } from 'react'

export default function CourierAvailability() {
  const role: UserRole = 'COURIER'
  const [isOnline, setIsOnline] = useState(true)
  const [autoAccept, setAutoAccept] = useState(false)
  const [maxDistance, setMaxDistance] = useState(20)
  const [maxDeliveries, setMaxDeliveries] = useState(10)

  // Mock data - in real app, this would come from Supabase
  const availabilitySchedule = [
    {
      id: 1,
      day: 'Monday',
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      maxDeliveries: 8
    },
    {
      id: 2,
      day: 'Tuesday',
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      maxDeliveries: 8
    },
    {
      id: 3,
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      maxDeliveries: 8
    },
    {
      id: 4,
      day: 'Thursday',
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      maxDeliveries: 8
    },
    {
      id: 5,
      day: 'Friday',
      startTime: '09:00',
      endTime: '20:00',
      isActive: true,
      maxDeliveries: 10
    },
    {
      id: 6,
      day: 'Saturday',
      startTime: '10:00',
      endTime: '16:00',
      isActive: true,
      maxDeliveries: 6
    },
    {
      id: 7,
      day: 'Sunday',
      startTime: '10:00',
      endTime: '16:00',
      isActive: false,
      maxDeliveries: 0
    }
  ]

  const serviceAreas = [
    {
      id: 1,
      name: 'Central Moscow',
      center: { lat: 55.7558, lng: 37.6176 },
      radius: 10,
      isActive: true,
      deliveryCount: 45
    },
    {
      id: 2,
      name: 'North Moscow',
      center: { lat: 55.8500, lng: 37.6000 },
      radius: 8,
      isActive: true,
      deliveryCount: 23
    },
    {
      id: 3,
      name: 'South Moscow',
      center: { lat: 55.6500, lng: 37.6000 },
      radius: 12,
      isActive: false,
      deliveryCount: 0
    }
  ]

  const currentStatus = {
    isOnline: isOnline,
    currentLocation: 'Moscow, Russia',
    lastSeen: '2 minutes ago',
    todayDeliveries: 3,
    todayEarnings: 2400,
    nextAvailableSlot: '14:30'
  }

  const handleSaveSchedule = () => {
    // In real app, this would save to Supabase
    console.log('Saving availability schedule...')
  }

  const handleToggleDay = (dayId: number) => {
    // In real app, this would update in Supabase
    console.log('Toggling day:', dayId)
  }

  const handleSaveSettings = () => {
    // In real app, this would save to Supabase
    console.log('Saving availability settings...')
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Availability</h1>
            <p className="text-muted-foreground">
              Manage your working hours and service areas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              View Map
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">{isOnline ? 'Online' : 'Offline'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? 'Available for deliveries' : 'Not accepting jobs'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{currentStatus.currentLocation}</p>
                <p className="text-sm text-muted-foreground">Last seen: {currentStatus.lastSeen}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Deliveries</p>
                <p className="font-medium">{currentStatus.todayDeliveries}</p>
                <p className="text-sm text-muted-foreground">
                  Earnings: ₽{currentStatus.todayEarnings}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Next Available</p>
                <p className="font-medium">{currentStatus.nextAvailableSlot}</p>
                <p className="text-sm text-muted-foreground">Estimated time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Settings</CardTitle>
            <CardDescription>Configure your availability preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="online-status">Go Online</Label>
                    <p className="text-sm text-muted-foreground">
                      Make yourself available for delivery jobs
                    </p>
                  </div>
                  <Switch
                    id="online-status"
                    checked={isOnline}
                    onCheckedChange={setIsOnline}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-accept">Auto-Accept Jobs</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically accept available delivery jobs
                    </p>
                  </div>
                  <Switch
                    id="auto-accept"
                    checked={autoAccept}
                    onCheckedChange={setAutoAccept}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="max-distance">Max Distance (km)</Label>
                  <input
                    id="max-distance"
                    type="range"
                    min="5"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum delivery distance: {maxDistance} km
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="max-deliveries">Max Deliveries per Day</Label>
                  <input
                    id="max-deliveries"
                    type="range"
                    min="1"
                    max="20"
                    value={maxDeliveries}
                    onChange={(e) => setMaxDeliveries(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum deliveries: {maxDeliveries} per day
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              Set your working hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availabilitySchedule.map((day) => (
                <div key={day.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-20 font-medium">{day.day}</div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {day.startTime} - {day.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Max {day.maxDeliveries} deliveries
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={day.isActive ? 'default' : 'outline'}>
                      {day.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={day.isActive}
                      onCheckedChange={() => handleToggleDay(day.id)}
                    />
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveSchedule}>
                <Save className="h-4 w-4 mr-2" />
                Save Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Areas
            </CardTitle>
            <CardDescription>
              Define the areas where you&apos;re willing to make deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceAreas.map((area) => (
                <div key={area.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{area.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Radius: {area.radius} km • {area.deliveryCount} deliveries
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={area.isActive ? 'default' : 'outline'}>
                      {area.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={area.isActive}
                      onCheckedChange={(checked) => {
                        // In real app, this would update in Supabase
                        console.log('Toggling area:', area.id, checked)
                      }}
                    />
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Service Area
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Availability Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Tips for Better Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Peak Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Work during lunch (11:30-14:00) and dinner (18:00-21:00) for more jobs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Weekend Availability</p>
                    <p className="text-sm text-muted-foreground">
                      Weekends often have higher demand and better pay rates
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Consistent Schedule</p>
                    <p className="text-sm text-muted-foreground">
                      Maintain regular hours to build customer relationships
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Multiple Areas</p>
                    <p className="text-sm text-muted-foreground">
                      Cover multiple service areas to increase job opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  )
}
