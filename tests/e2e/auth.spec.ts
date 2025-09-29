import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display sign-in page', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    await expect(page).toHaveTitle(/Sign In/)
    await expect(page.locator('h1')).toContainText('Sign In')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display sign-up page', async ({ page }) => {
    await page.goto('/auth/sign-up')
    
    await expect(page).toHaveTitle(/Sign Up/)
    await expect(page.locator('h1')).toContainText('Sign Up')
    await expect(page.locator('input[name="first_name"]')).toBeVisible()
    await expect(page.locator('input[name="last_name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should navigate between auth pages', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Click on sign-up link
    await page.click('text=Don\'t have an account?')
    await expect(page).toHaveURL('/auth/sign-up')
    
    // Click on sign-in link
    await page.click('text=Already have an account?')
    await expect(page).toHaveURL('/auth/sign-in')
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Check for required field validation
    await expect(page.locator('input[type="email"]')).toHaveAttribute('required')
    await expect(page.locator('input[type="password"]')).toHaveAttribute('required')
  })
})
