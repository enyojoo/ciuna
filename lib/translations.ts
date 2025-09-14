// Client-side translation hook that works with Vercel deployment
import { useState, useEffect } from 'react'

interface Translations {
  [key: string]: string | Translations
}

// English translations
const enTranslations: Translations = {
  home: {
    hero_title: "Welcome to Ciuna",
    hero_description: "The marketplace for foreigners living in Russia. Buy, sell, and find services in your community.",
    features: {
      marketplace: "Marketplace",
      marketplace_desc: "Buy and sell items with other expats in your community",
      vendors: "Vendors", 
      vendors_desc: "Connect with local and international vendors",
      services: "Services",
      services_desc: "Find and book services from verified providers",
      community: "Community",
      community_desc: "Chat with sellers and get support in multiple languages"
    },
    stats: {
      users: "Active Users",
      listings: "Listings", 
      countries: "Countries",
      languages: "Languages"
    },
    cta: {
      get_started: "Get Started",
      learn_more: "Learn More"
    }
  },
  auth: {
    sign_in: "Sign In",
    sign_up: "Sign Up",
    email: "Email",
    password: "Password",
    remember_me: "Remember me",
    forgot_password: "Forgot password?",
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    first_name: "First Name",
    last_name: "Last Name",
    phone: "Phone",
    country: "Country",
    city: "City",
    role: "Role",
    user: "User",
    vendor: "Vendor",
    courier: "Courier"
  },
  listings: {
    title: "Browse Listings",
    search_placeholder: "Search listings...",
    filter_by: "Filter by",
    category: "Category",
    condition: "Condition",
    price_range: "Price Range",
    sort_by: "Sort by",
    newest: "Newest",
    oldest: "Oldest",
    price_low: "Price: Low to High",
    price_high: "Price: High to Low"
  },
  inbox: {
    title: "Messages",
    search_placeholder: "Search conversations...",
    no_conversations: "No conversations yet",
    type_message: "Type a message...",
    send: "Send"
  },
  orders: {
    title: "My Orders",
    all_orders: "All Orders",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled"
  },
  vendors: {
    title: "Vendors",
    search_placeholder: "Search vendors...",
    verified: "Verified",
    rating: "Rating",
    products: "Products"
  },
  services: {
    title: "Services",
    search_placeholder: "Search services...",
    book_now: "Book Now",
    category: "Category"
  },
  admin: {
    title: "Admin Dashboard",
    pending_approvals: "Pending Approvals"
  }
}

// Russian translations
const ruTranslations: Translations = {
  home: {
    hero_title: "Добро пожаловать в Ciuna",
    hero_description: "Маркетплейс для иностранцев, живущих в России. Покупайте, продавайте и находите услуги в своем сообществе.",
    features: {
      marketplace: "Маркетплейс",
      marketplace_desc: "Покупайте и продавайте товары с другими экспатами в вашем сообществе",
      vendors: "Продавцы",
      vendors_desc: "Связывайтесь с местными и международными продавцами",
      services: "Услуги",
      services_desc: "Находите и бронируйте услуги от проверенных поставщиков",
      community: "Сообщество",
      community_desc: "Общайтесь с продавцами и получайте поддержку на нескольких языках"
    },
    stats: {
      users: "Активные пользователи",
      listings: "Объявления",
      countries: "Страны",
      languages: "Языки"
    },
    cta: {
      get_started: "Начать",
      learn_more: "Узнать больше"
    }
  },
  auth: {
    sign_in: "Войти",
    sign_up: "Регистрация",
    email: "Email",
    password: "Пароль",
    remember_me: "Запомнить меня",
    forgot_password: "Забыли пароль?",
    no_account: "Нет аккаунта?",
    have_account: "Уже есть аккаунт?",
    first_name: "Имя",
    last_name: "Фамилия",
    phone: "Телефон",
    country: "Страна",
    city: "Город",
    role: "Роль",
    user: "Пользователь",
    vendor: "Продавец",
    courier: "Курьер"
  },
  listings: {
    title: "Просмотр объявлений",
    search_placeholder: "Поиск объявлений...",
    filter_by: "Фильтр по",
    category: "Категория",
    condition: "Состояние",
    price_range: "Ценовой диапазон",
    sort_by: "Сортировать по",
    newest: "Новейшие",
    oldest: "Старейшие",
    price_low: "Цена: от низкой к высокой",
    price_high: "Цена: от высокой к низкой"
  },
  inbox: {
    title: "Сообщения",
    search_placeholder: "Поиск разговоров...",
    no_conversations: "Пока нет разговоров",
    type_message: "Введите сообщение...",
    send: "Отправить"
  },
  orders: {
    title: "Мои заказы",
    all_orders: "Все заказы",
    pending: "В ожидании",
    completed: "Завершено",
    cancelled: "Отменено"
  },
  vendors: {
    title: "Продавцы",
    search_placeholder: "Поиск продавцов...",
    verified: "Проверен",
    rating: "Рейтинг",
    products: "Товары"
  },
  services: {
    title: "Услуги",
    search_placeholder: "Поиск услуг...",
    book_now: "Забронировать",
    category: "Категория"
  },
  admin: {
    title: "Панель администратора",
    pending_approvals: "Ожидающие одобрения"
  }
}

const translations = {
  en: enTranslations,
  ru: ruTranslations
}

export function useTranslations(namespace: string) {
  const [locale, setLocale] = useState('en')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') || 'en'
    setLocale(savedLocale)
    setIsLoaded(true)
  }, [])

  const t = (key: string): string => {
    if (!isLoaded) return key
    
    const keys = key.split('.')
    let value: any = translations[locale as keyof typeof translations] || translations.en
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        // Fallback to English if translation not found
        value = translations.en
        for (const k of keys) {
          value = value?.[k]
        }
        break
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return t
}
