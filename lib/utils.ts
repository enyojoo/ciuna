import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  if (!firstName && !lastName) return '?'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function calculateDiscountPrice(originalPrice: number, discountPercentage: number): number {
  return Math.round(originalPrice * (1 - discountPercentage / 100))
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    'NEW': 'Новое',
    'LIKE_NEW': 'Как новое',
    'GOOD': 'Хорошее',
    'FAIR': 'Удовлетворительное'
  }
  return labels[condition] || condition
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'ACTIVE': 'Активно',
    'PAUSED': 'Приостановлено',
    'SOLD': 'Продано',
    'PENDING_REVIEW': 'На рассмотрении',
    'PENDING': 'Ожидает',
    'PAID': 'Оплачено',
    'FULFILLING': 'Выполняется',
    'DELIVERED': 'Доставлено',
    'CANCELLED': 'Отменено',
    'CONFIRMED': 'Подтверждено',
    'COMPLETED': 'Завершено',
    'HELD': 'Заблокировано',
    'RELEASED': 'Разблокировано',
    'REFUNDED': 'Возвращено'
  }
  return labels[status] || status
}

export function getServiceCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'LEGAL': 'Юридические услуги',
    'FINANCIAL': 'Финансовые услуги',
    'PERSONAL': 'Личные услуги',
    'EVENT': 'Организация мероприятий',
    'HEALTHCARE': 'Медицинские услуги'
  }
  return labels[category] || category
}