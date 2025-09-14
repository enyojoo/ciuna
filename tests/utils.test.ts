import { describe, it, expect } from 'vitest'
import { 
  formatPrice, 
  formatDate, 
  getInitials, 
  slugify, 
  truncateText,
  getConditionLabel,
  getStatusLabel,
  calculateDiscountPrice
} from '@/lib/utils'

describe('Utils', () => {
  describe('formatPrice', () => {
    it('should format price in rubles by default', () => {
      expect(formatPrice(1000)).toBe('1 000 ₽')
      expect(formatPrice(50000)).toBe('50 000 ₽')
    })

    it('should format price in different currencies', () => {
      expect(formatPrice(100, 'USD')).toBe('$100')
      expect(formatPrice(100, 'EUR')).toBe('100 €')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toContain('15')
      expect(formatDate(date)).toContain('января')
    })
  })

  describe('getInitials', () => {
    it('should generate initials from first and last name', () => {
      expect(getInitials('John', 'Smith')).toBe('JS')
      expect(getInitials('Maria', 'Garcia')).toBe('MG')
    })

    it('should handle missing names', () => {
      expect(getInitials('John', null)).toBe('J')
      expect(getInitials(null, 'Smith')).toBe('S')
      expect(getInitials(null, null)).toBe('?')
    })
  })

  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Electronics & Gadgets')).toBe('electronics-gadgets')
      expect(slugify('Café & Restaurant')).toBe('caf-restaurant')
    })
  })

  describe('truncateText', () => {
    it('should truncate text to specified length', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
      expect(truncateText('Short', 10)).toBe('Short')
    })
  })

  describe('getConditionLabel', () => {
    it('should return correct condition labels', () => {
      expect(getConditionLabel('NEW')).toBe('Новое')
      expect(getConditionLabel('LIKE_NEW')).toBe('Как новое')
      expect(getConditionLabel('GOOD')).toBe('Хорошее')
      expect(getConditionLabel('FAIR')).toBe('Удовлетворительное')
    })
  })

  describe('getStatusLabel', () => {
    it('should return correct status labels', () => {
      expect(getStatusLabel('ACTIVE')).toBe('Активно')
      expect(getStatusLabel('PENDING')).toBe('Ожидает')
      expect(getStatusLabel('COMPLETED')).toBe('Завершено')
    })
  })

  describe('calculateDiscountPrice', () => {
    it('should calculate discounted price correctly', () => {
      expect(calculateDiscountPrice(1000, 10)).toBe(900)
      expect(calculateDiscountPrice(1000, 25)).toBe(750)
      expect(calculateDiscountPrice(1000, 50)).toBe(500)
    })
  })
})
