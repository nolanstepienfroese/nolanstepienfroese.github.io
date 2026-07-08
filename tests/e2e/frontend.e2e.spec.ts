import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Portfolio/)

    const heading = page.locator('h1').first()

    await expect(heading).toBeVisible()
  })

  test('projects page renders with filters', async ({ page }) => {
    await page.goto('http://localhost:3000/projects')

    await expect(page.locator('h1')).toHaveText('Projects')
    await expect(page.locator('.filter-chip').first()).toHaveText('All')
  })
})
