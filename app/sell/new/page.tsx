'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  ArrowLeft,
  MapPin,
  DollarSign,
  Tag,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const categories = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Furniture", slug: "furniture" },
  { id: 3, name: "Clothing", slug: "clothing" },
  { id: 4, name: "Books", slug: "books" },
  { id: 5, name: "Sports", slug: "sports" },
  { id: 6, name: "Automotive", slug: "automotive" },
  { id: 7, name: "Home & Garden", slug: "home-garden" },
  { id: 8, name: "Toys & Games", slug: "toys-games" }
]

const conditions = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" }
]

export default function CreateListingPage() {
  const t = useTranslations('create_listing')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    city: '',
    district: ''
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsUploading(true)
    // In real app, upload to Supabase Storage
    setTimeout(() => {
      const newPhotos = Array.from(files).map((_, index) => 
        `/api/placeholder/400/300?text=Photo+${photos.length + index + 1}`
      )
      setPhotos(prev => [...prev, ...newPhotos])
      setIsUploading(false)
    }, 1000)
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, submit to Supabase
    console.log('Submitting listing:', { ...formData, photos })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/listings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to listings
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">
              Create a new listing to sell your items to the expat community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  {t('basic_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('title_label')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('title_placeholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('description_label')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('description_placeholder')}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t('category_label')}</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('select_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">{t('condition_label')}</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  {t('price_label')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="price">Price in Russian Rubles</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder={t('price_placeholder')}
                      className="pl-8"
                      required
                    />
                    <span className="absolute left-3 top-3 text-muted-foreground">₽</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the price in Russian rubles. You can also accept other currencies.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {t('location_label')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder={t('city_placeholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District (Optional)</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder={t('district_placeholder')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  {t('photos_label')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('photos_description')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                      disabled={isUploading || photos.length >= 8}
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`cursor-pointer ${isUploading || photos.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        {isUploading ? 'Uploading...' : 'Click to upload photos'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {photos.length >= 8 ? 'Maximum 8 photos reached' : 'PNG, JPG up to 10MB each'}
                      </p>
                    </label>
                  </div>

                  {/* Photo Grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square group">
                          <Image
                            src={photo}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2">
                              Main photo
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href="/listings">
                  Cancel
                </Link>
              </Button>
              <Button type="button" variant="outline">
                {t('save_draft')}
              </Button>
              <Button type="submit" disabled={!formData.title || !formData.description || !formData.price}>
                {t('publish')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
