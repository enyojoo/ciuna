import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Ciuna
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The ultimate marketplace for expats in Russia
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Browse Listings</Button>
            <Button variant="outline" size="lg">Sell Something</Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Buy & Sell</CardTitle>
              <CardDescription>
                Find great deals on products from fellow expats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Browse through thousands of listings from expats in your area.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Discover local services and professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Find trusted service providers in your community.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Connect with other expats in Russia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Join a vibrant community of expats sharing experiences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
