import { test, expect } from '@playwright/test'

test.describe('Marketplace', () => {
  test('should display listings page', async ({ page }) => {
    await page.goto('/listings')
    
    await expect(page).toHaveTitle(/Marketplace/)
    await expect(page.locator('h1')).toContainText('Marketplace')
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
  })

  test('should display individual listing', async ({ page }) => {
    await page.goto('/listings/1')
    
    await expect(page).toHaveTitle(/Listing Details/)
    await expect(page.locator('h1')).toContainText('MacBook Pro')
    await expect(page.locator('text=120,000₽')).toBeVisible()
  })

  test('should display create listing page', async ({ page }) => {
    await page.goto('/sell/new')
    
    await expect(page).toHaveTitle(/Create New Listing/)
    await expect(page.locator('h1')).toContainText('Create New Listing')
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('textarea[name="description"]')).toBeVisible()
  })

  test('should display vendors page', async ({ page }) => {
    await page.goto('/vendors')
    
    await expect(page).toHaveTitle(/Vendors/)
    await expect(page.locator('h1')).toContainText('Vendors')
    await expect(page.locator('text=Expat Electronics Store')).toBeVisible()
  })

  test('should filter listings by category', async ({ page }) => {
    await page.goto('/listings')
    
    // Click on category filter
    await page.click('[role="combobox"]')
    await page.click('text=Electronics')
    
    // Check if filter is applied
    await expect(page.locator('text=Electronics ×')).toBeVisible()
  })

  test('should search listings', async ({ page }) => {
    await page.goto('/listings')
    
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'MacBook')
    await page.press('input[placeholder*="Search"]', 'Enter')
    
    // Check if search results are displayed
    await expect(page.locator('text=MacBook Pro')).toBeVisible()
  })
})
