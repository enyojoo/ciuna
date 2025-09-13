'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Avatar, Badge } from '@ciuna/ui';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  User,
  LogOut,
  Settings,
  Package,
  Store,
  Wrench,
  BarChart3,
  Calendar,
  CreditCard,
  Shield,
  Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import LanguageSelector from './language-selector';
import CurrencySelector from './currency-selector';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Listings', href: '/listings', icon: Package },
    { name: 'Vendors', href: '/vendors', icon: Store },
    { name: 'Services', href: '/services', icon: Wrench },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Inbox', href: '/inbox', icon: MessageCircle },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Settings', href: '/settings', icon: User },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Security', href: '/security', icon: Shield },
    { name: 'Privacy', href: '/privacy', icon: Eye },
  ];

  const vendorNavigation = [
    { name: 'Dashboard', href: '/vendor-dashboard', icon: BarChart3 },
    { name: 'Products', href: '/vendor-dashboard/products', icon: Package },
    { name: 'Orders', href: '/vendor-dashboard/orders', icon: ShoppingCart },
  ];

  const providerNavigation = [
    { name: 'Dashboard', href: '/provider-dashboard', icon: BarChart3 },
    { name: 'Services', href: '/provider-dashboard/services', icon: Wrench },
    { name: 'Bookings', href: '/provider-dashboard/bookings', icon: Calendar },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Ciuna</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products, services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language & Currency Selectors */}
            <div className="hidden lg:flex items-center space-x-2">
              <LanguageSelector variant="button" showFlag={true} showNativeName={false} />
              <CurrencySelector variant="button" showSymbol={true} />
            </div>

            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                {/* User Navigation */}
                <div className="hidden md:flex items-center space-x-2">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Vendor/Provider Navigation */}
                {profile?.role === 'VENDOR' && (
                  <div className="hidden lg:flex items-center space-x-2">
                    {vendorNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive(item.href)
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {profile?.role === 'USER' && profile?.verified_expat && (
                  <div className="hidden lg:flex items-center space-x-2">
                    {providerNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive(item.href)
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* User Menu */}
                <div className="relative">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar
                      src={profile?.avatar_url || undefined}
                      fallback={profile?.email?.charAt(0) || 'U'}
                      size="sm"
                    />
                  </Button>
                </div>

                {/* Sell Button */}
                <Button asChild>
                  <Link href="/sell/new">
                    Sell
                  </Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium',
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium',
                          isActive(item.href)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
