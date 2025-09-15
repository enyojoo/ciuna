"use client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingBag,
  Users,
  Wrench,
  ArrowRight,
  MessageCircle,
  Smartphone,
  Sofa,
  Shirt,
  BookOpen,
  Dumbbell,
  Car,
  Star,
  TrendingUp,
  Shield,
  Globe,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const features = [
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Buy and sell items with other expats in your community",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Users,
      title: "Vendors",
      description: "Connect with local and international vendors",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: Wrench,
      title: "Services",
      description: "Find and book services from verified providers",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: MessageCircle,
      title: "Community",
      description: "Chat with sellers and get support in multiple languages",
      color: "bg-orange-500/10 text-orange-600",
    },
  ]

  const stats = [
    { label: "Active Users", value: "10,000+", icon: Users },
    { label: "Listings", value: "50,000+", icon: ShoppingBag },
    { label: "Countries", value: "50+", icon: Globe },
    { label: "Languages", value: "6", icon: MessageCircle },
  ]

  const categories = [
    { name: "Electronics", icon: Smartphone, color: "text-blue-600" },
    { name: "Furniture", icon: Sofa, color: "text-green-600" },
    { name: "Clothing", icon: Shirt, color: "text-purple-600" },
    { name: "Books", icon: BookOpen, color: "text-orange-600" },
    { name: "Sports", icon: Dumbbell, color: "text-red-600" },
    { name: "Automotive", icon: Car, color: "text-indigo-600" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10,000+ expats
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-balance">
              Welcome to <span className="text-primary">Ciuna</span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto text-balance">
              The marketplace for foreigners living in Russia. Buy, sell, and find services in your community with
              confidence and ease.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="px-8 py-6 text-lg hover-lift">
                <Link href="/listings">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="px-8 py-6 text-lg hover-lift bg-transparent">
                <Link href="/vendors">Featured Vendors</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center hover-lift border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Everything you need
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-balance">All-in-one expat marketplace</h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              From buying and selling to finding services, we've got everything covered for your expat journey
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center hover-lift border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div
                    className={`mx-auto h-16 w-16 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Browse safely
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-balance">Browse Categories</h2>
            <p className="mt-6 text-xl text-muted-foreground text-balance">
              Find exactly what you're looking for in our curated categories
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Card key={category.name} className="cursor-pointer hover-lift border-0 shadow-sm group">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                      <category.icon
                        className={`h-8 w-8 ${category.color} group-hover:text-primary transition-colors`}
                      />
                    </div>
                  </div>
                  <div className="font-semibold text-lg">{category.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <ArrowRight className="w-4 h-4 mr-2" />
            Join the community
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-balance">Ready to get started?</h2>
          <p className="mt-6 text-xl text-muted-foreground text-balance">
            Join thousands of expats who are already using Ciuna to buy, sell, and connect with their community
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="px-8 py-6 text-lg hover-lift">
              <Link href="/auth/sign-up">
                Create your account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="px-8 py-6 text-lg hover-lift bg-transparent">
              <Link href="/listings">Browse listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-16 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">Ciuna</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The trusted marketplace for expats in Russia. Connect, buy, sell, and thrive in your new community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-lg">Marketplace</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/listings" className="hover:text-foreground transition-colors">
                    Browse Listings
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="hover:text-foreground transition-colors">
                    Sell Items
                  </Link>
                </li>
                <li>
                  <Link href="/vendors" className="hover:text-foreground transition-colors">
                    Vendors
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-foreground transition-colors">
                    Services
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-foreground transition-colors">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Languages</h3>
              <div className="flex flex-wrap gap-3">
                {["EN", "RU", "FR", "ZH", "AR", "ES"].map((lang) => (
                  <Badge key={lang} variant="secondary" className="px-3 py-1 hover-lift cursor-pointer">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2024 Ciuna. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
