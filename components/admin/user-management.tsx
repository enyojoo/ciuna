'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Users, 
  Search, 
  Edit, 
  Save, 
  X,
  MapPin,
  DollarSign,
  Shield,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { UserLocation } from '@/lib/location'
import { SupportedCurrency } from '@/lib/currency'
import { UserRole } from '@/lib/auth/access-control'

interface UserManagementProps {
  className?: string
}

export function UserManagement({ className = '' }: UserManagementProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editingUser, setEditingUser] = useState<Profile | null>(null)

  const supabase = createClient()

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const updateUser = async (userId: string, updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        )
      )
      setEditingUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = locationFilter === 'all' || user.location === locationFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesLocation && matchesRole
  })

  const getLocationName = (location: string) => {
    const names: Record<string, string> = {
      russia: '🇷🇺 Russia',
      uk: '🇬🇧 UK',
      us: '🇺🇸 US',
      germany: '🇩🇪 Germany',
      france: '🇫🇷 France',
      canada: '🇨🇦 Canada',
      australia: '🇦🇺 Australia',
      other: '🌍 Other'
    }
    return names[location] || location
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      RUB: '₽',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      JPY: '¥'
    }
    return symbols[currency] || currency
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage users, their locations, currencies, and permissions
          </p>
        </div>
        <Button onClick={loadUsers}>
          <Users className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter by Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="russia">🇷🇺 Russia</SelectItem>
                  <SelectItem value="uk">🇬🇧 UK</SelectItem>
                  <SelectItem value="us">🇺🇸 US</SelectItem>
                  <SelectItem value="germany">🇩🇪 Germany</SelectItem>
                  <SelectItem value="france">🇫🇷 France</SelectItem>
                  <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                  <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                  <SelectItem value="other">🌍 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                  <SelectItem value="COURIER">Courier</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Results</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                <span className="text-sm text-muted-foreground">
                  {filteredUsers.length} users found
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.role}</Badge>
                      {user.verified_expat && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Location & Currency */}
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{getLocationName(user.location || 'other')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>{getCurrencySymbol(user.base_currency || 'USD')} {user.base_currency}</span>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4" />
                      <Badge 
                        variant={
                          user.verification_status === 'APPROVED' ? 'default' :
                          user.verification_status === 'REJECTED' ? 'destructive' : 'secondary'
                        }
                      >
                        {user.verification_status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {editingUser?.id === user.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            updateUser(user.id, editingUser)
                          }}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {editingUser?.id === user.id && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-4">Edit User Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select
                        value={editingUser.location || 'other'}
                        onValueChange={(value) => 
                          setEditingUser(prev => prev ? { ...prev, location: value as UserLocation } : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="russia">🇷🇺 Russia</SelectItem>
                          <SelectItem value="uk">🇬🇧 UK</SelectItem>
                          <SelectItem value="us">🇺🇸 US</SelectItem>
                          <SelectItem value="germany">🇩🇪 Germany</SelectItem>
                          <SelectItem value="france">🇫🇷 France</SelectItem>
                          <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                          <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                          <SelectItem value="other">🌍 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={editingUser.base_currency || 'USD'}
                        onValueChange={(value) => 
                          setEditingUser(prev => prev ? { ...prev, base_currency: value as SupportedCurrency } : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                          <SelectItem value="GBP">£ GBP</SelectItem>
                          <SelectItem value="RUB">₽ RUB</SelectItem>
                          <SelectItem value="CAD">C$ CAD</SelectItem>
                          <SelectItem value="AUD">A$ AUD</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                          <SelectItem value="JPY">¥ JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={editingUser.role}
                        onValueChange={(value) => 
                          setEditingUser(prev => prev ? { ...prev, role: value as UserRole } : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="VENDOR">Vendor</SelectItem>
                          <SelectItem value="COURIER">Courier</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="verified"
                        checked={editingUser.verified_expat}
                        onCheckedChange={(checked) => 
                          setEditingUser(prev => prev ? { ...prev, verified_expat: checked } : null)
                        }
                      />
                      <Label htmlFor="verified">Verified Expat</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label>Verification Status</Label>
                      <Select
                        value={editingUser.verification_status}
                        onValueChange={(value) => 
                          setEditingUser(prev => prev ? { ...prev, verification_status: value as 'PENDING' | 'APPROVED' | 'REJECTED' } : null)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
