'use client'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  Users, 
  Wrench, 
  ArrowRight,
  MessageCircle,
  Star,
  Shield,
  Globe,
  Zap,
  Heart,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {

  const features = [
    {
      icon: ShoppingBag,
      title: 'Smart Marketplace',
      description: 'AI-powered recommendations help you discover exactly what you need',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Trusted Vendors',
      description: 'Connect with verified local and international sellers',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Wrench,
      title: 'Premium Services',
      description: 'Book verified professionals for all your needs',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: MessageCircle,
      title: 'Global Community',
      description: 'Chat in 6 languages with instant translation',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Listings', value: '50,000+', icon: ShoppingBag },
    { label: 'Countries', value: '50+', icon: Globe },
    { label: 'Languages', value: '6', icon: MessageCircle }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Expat from USA",
      content: "Ciuna made finding furniture for my new apartment so easy! The community is amazing.",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Marco Rossi",
      role: "Expat from Italy", 
      content: "I've sold over 20 items through Ciuna. The platform is incredibly user-friendly.",
      avatar: "MR",
      rating: 5
    },
    {
      name: "Yuki Tanaka",
      role: "Expat from Japan",
      content: "The translation feature is a game-changer. I can communicate with anyone easily.",
      avatar: "YT",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative container section-padding-lg">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Trusted by 10,000+ expats worldwide
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              Your <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Expat</span> Marketplace
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-200 text-balance">
              Buy, sell, and connect with fellow expats in Russia. Everything you need, all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
              <Button asChild size="lg" className="btn-modern h-14 px-8 text-lg gradient-primary hover:shadow-xl">
                <Link href="/listings">
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="btn-modern h-14 px-8 text-lg hover:bg-primary hover:text-primary-foreground">
                <Link href="/sell/new">
                  Sell Your Items
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in delay-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Instant Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>6 Languages</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-to-r from-muted/30 to-muted/60">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything you need in one place
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              From smart shopping to community connections, we&apos;ve built the ultimate platform for expats
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="card-elevated group hover-lift animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Loved by Expats
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              What our community says
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of satisfied expats who have found their perfect marketplace
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="card-elevated animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg leading-relaxed mb-6 text-muted-foreground">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <ShoppingBag className="w-4 h-4" />
              Explore Categories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Find exactly what you&apos;re looking for
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Browse through thousands of items across all categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Electronics', icon: '📱', color: 'from-blue-500 to-cyan-500' },
              { name: 'Furniture', icon: '🪑', color: 'from-amber-500 to-orange-500' },
              { name: 'Clothing', icon: '👕', color: 'from-pink-500 to-rose-500' },
              { name: 'Books', icon: '📚', color: 'from-green-500 to-emerald-500' },
              { name: 'Sports', icon: '⚽', color: 'from-purple-500 to-violet-500' },
              { name: 'Automotive', icon: '🚗', color: 'from-red-500 to-pink-500' }
            ].map((category, index) => (
              <Card key={category.name} className="card-modern group hover-lift cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <div className="font-semibold text-foreground">{category.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-lg bg-gradient-to-br from-primary via-primary to-cyan-600 text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Join the Community
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
              Ready to get started?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-200">
              Join thousands of expats who are already using Ciuna to buy, sell, and connect in Russia
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up delay-300">
              <Button asChild size="lg" className="btn-modern h-14 px-8 text-lg bg-white text-primary hover:bg-white/90 hover:shadow-2xl">
                <Link href="/auth/sign-up">
                  Create your account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="btn-modern h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10">
                <Link href="/listings">
                  Browse listings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 section-padding">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-2xl font-bold text-foreground">Ciuna</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The ultimate marketplace for expats in Russia. Buy, sell, and connect with your community.
              </p>
              <div className="flex gap-4">
                {['EN', 'RU', 'FR', 'ZH', 'AR', 'ES'].map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs px-3 py-1">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-6 text-lg">Marketplace</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/listings" className="hover:text-foreground transition-colors">Browse Listings</Link></li>
                <li><Link href="/sell" className="hover:text-foreground transition-colors">Sell Items</Link></li>
                <li><Link href="/vendors" className="hover:text-foreground transition-colors">Vendors</Link></li>
                <li><Link href="/services" className="hover:text-foreground transition-colors">Services</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link href="/safety" className="hover:text-foreground transition-colors">Safety</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-6 text-lg">Community</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-foreground transition-colors">Press</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                &copy; 2024 Ciuna. All rights reserved. Made with ❤️ for the expat community.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}