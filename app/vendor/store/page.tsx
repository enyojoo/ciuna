'use client'

import Image from 'next/image'
import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Edit, 
  Save, 
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Eye
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { useState } from 'react'

export default function VendorStore() {
  const role: UserRole = 'VENDOR'
  const [isEditing, setIsEditing] = useState(false)

  // Mock data - in real app, this would come from Supabase
  const storeData = {
    name: 'Tech Store Moscow',
    description: 'Premium electronics and gadgets store in Moscow. We offer the latest technology with competitive prices and excellent customer service.',
    logo: '/placeholder-store-logo.jpg',
    coverImage: '/placeholder-store-cover.jpg',
    rating: 4.8,
    totalReviews: 156,
    establishedDate: '2023-01-15',
    location: 'Moscow, Russia',
    phone: '+7 (495) 123-4567',
    email: 'info@techstoremoscow.ru',
    website: 'https://techstoremoscow.ru',
    categories: ['Electronics', 'Computers', 'Mobile Phones', 'Accessories'],
    socialMedia: {
      instagram: '@techstoremoscow',
      telegram: '@techstoremoscow',
      vk: 'techstoremoscow'
    }
  }

  const [formData, setFormData] = useState(storeData)

  const handleSave = () => {
    // In real app, this would save to Supabase
    console.log('Saving store data:', formData)
    setIsEditing(false)
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Store Management</h1>
            <p className="text-muted-foreground">
              Manage your store information and branding
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview Store
            </Button>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Store
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Store Overview */}
        <Card>
          <div className="relative">
            <div className="h-48 bg-muted relative">
              <Image
                src={formData.coverImage}
                alt="Store cover"
                fill
                className="object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button variant="secondary">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Cover Image
                  </Button>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
              <div className="h-24 w-24 rounded-full border-4 border-background bg-muted overflow-hidden">
                <Image
                  src={formData.logo}
                  alt="Store logo"
                  fill
                  className="object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <CardContent className="pt-12">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold border-none p-0 h-auto"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{formData.name}</h2>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{formData.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({formData.totalReviews} reviews)</span>
                    <Badge variant="outline">Est. {new Date(formData.establishedDate).getFullYear()}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Store Description</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">{formData.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {formData.location}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {formData.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {formData.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  {isEditing ? (
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {formData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Store Categories</CardTitle>
            <CardDescription>
              Categories your store specializes in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>
              Connect your social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Instagram</Label>
                {isEditing ? (
                  <Input
                    value={formData.socialMedia.instagram}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    placeholder="@username"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {formData.socialMedia.instagram}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Telegram</Label>
                {isEditing ? (
                  <Input
                    value={formData.socialMedia.telegram}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, telegram: e.target.value }
                    }))}
                    placeholder="@username"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {formData.socialMedia.telegram}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>VKontakte</Label>
                {isEditing ? (
                  <Input
                    value={formData.socialMedia.vk}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, vk: e.target.value }
                    }))}
                    placeholder="username"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {formData.socialMedia.vk}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-muted-foreground">Orders</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </RoleLayout>
  )
}
