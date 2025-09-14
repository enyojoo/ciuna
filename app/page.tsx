'use client'

import { useTranslations } from 'next-intl'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  Users, 
  Wrench, 
  ArrowRight,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('home')

  const features = [
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Buy and sell items with other expats in your community'
    },
    {
      icon: Users,
      title: 'Vendors',
      description: 'Connect with local and international vendors'
    },
    {
      icon: Wrench,
      title: 'Services',
      description: 'Find and book services from verified providers'
    },
    {
      icon: MessageCircle,
      title: 'Community',
      description: 'Chat with sellers and get support in multiple languages'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Listings', value: '50,000+' },
    { label: 'Countries', value: '50+' },
    { label: 'Languages', value: '6' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/listings">
                  {t('get_started')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/vendors">
                  {t('featured_vendors')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need in one place
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From buying and selling to finding services, we&apos;ve got you covered
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('browse_categories')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find exactly what you&apos;re looking for
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              'Electronics',
              'Furniture',
              'Clothing',
              'Books',
              'Sports',
              'Automotive'
            ].map((category) => (
              <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-medium">{category}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of expats who are already using Ciuna to buy, sell, and connect
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/listings">
                Browse listings
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 rounded bg-primary" />
                <span className="text-lg font-bold">Ciuna</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The marketplace for expats in Russia
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/listings" className="hover:text-foreground">Browse Listings</Link></li>
                <li><Link href="/sell" className="hover:text-foreground">Sell Items</Link></li>
                <li><Link href="/vendors" className="hover:text-foreground">Vendors</Link></li>
                <li><Link href="/services" className="hover:text-foreground">Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/safety" className="hover:text-foreground">Safety</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {['EN', 'RU', 'FR', 'ZH', 'AR', 'ES'].map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Ciuna. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}