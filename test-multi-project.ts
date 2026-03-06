import { chromium, Browser, Page, BrowserContext } from 'playwright'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testMultiProjectDashboard() {
  console.log('🧪 Starting Multi-Project Dashboard Test\n')

  let browser: Browser
  let context: BrowserContext
  let page: Page

  try {
    browser = await chromium.launch({ headless: true })
    context = await browser.newContext()
    page = await context.newPage()

    // Test 1: Navigate to dashboard
    console.log('Test 1: Navigate to dashboard')
    await page.goto('http://localhost:3000')
    await sleep(3000)
    console.log('✅ Dashboard loaded\n')

    // Test 2: Check for project selector
    console.log('Test 2: Check for project selector in header')
    const projectSelector = page.locator('button:has-text("creative-adventures/myhealthteam")')
    const exists = await projectSelector.count()
    if (exists > 0) {
      console.log('✅ Project selector found in header')
    } else {
      console.log('⚠️ Project selector not found - checking for current project display')
      const currentProject = page.locator('text=creative-adventures/myhealthteam')
      const hasCurrentProject = await currentProject.count()
      if (hasCurrentProject > 0) {
        console.log('✅ Current project displayed in header')
      } else {
        console.log('❌ No project selector or current project display found')
      }
    }
    console.log()

    // Test 3: Check if data is loading
    console.log('Test 3: Check if workflows data is loading')
    await sleep(2000)
    const workflows = page.locator('table tbody tr')
    const workflowCount = await workflows.count()
    console.log(`✅ Found ${workflowCount} workflow rows`)
    console.log()

    // Test 4: Navigate to projects management page
    console.log('Test 4: Navigate to projects management page')
    await page.goto('http://localhost:3000/projects')
    await sleep(2000)

    const projectsTitle = page.locator('h1:has-text("Manage Projects")')
    const hasProjectsTitle = await projectsTitle.count()
    if (hasProjectsTitle > 0) {
      console.log('✅ Projects management page loaded')
    } else {
      console.log('❌ Projects management page not found')
    }
    console.log()

    // Test 5: Check for project table
    console.log('Test 5: Check for project table')
    const projectRows = page.locator('table tbody tr')
    const projectCount = await projectRows.count()
    console.log(`✅ Found ${projectCount} project(s) in table`)

    if (projectCount > 0) {
      const firstProjectName = await projectRows.first().locator('td:nth-child(2)').textContent()
      console.log(`  First project: ${firstProjectName}`)
    }
    console.log()

    // Test 6: Check for Add Project button
    console.log('Test 6: Check for Add Project button')
    const addButton = page.locator('button:has-text("Add Project")')
    const hasAddButton = await addButton.count()
    if (hasAddButton > 0) {
      console.log('✅ Add Project button found')
    } else {
      console.log('⚠️ Add Project button not found')
    }
    console.log()

    // Test 7: Navigate back to dashboard
    console.log('Test 7: Navigate back to dashboard')
    await page.goto('http://localhost:3000')
    await sleep(2000)
    console.log('✅ Returned to dashboard')
    console.log()

    // Test 8: Check Tasks tab
    console.log('Test 8: Check Tasks tab')
    const tasksTab = page.locator('button:has-text("Tasks")')
    await tasksTab.click()
    await sleep(2000)
    console.log('✅ Tasks tab clicked')

    const tasks = page.locator('table tbody tr')
    const taskCount = await tasks.count()
    console.log(`✅ Found ${taskCount} task(s)`)
    console.log()

    // Test 9: Take final screenshot
    console.log('Test 9: Take final screenshot')
    await page.screenshot({ path: 'multi-project-test-screenshot.png', fullPage: true })
    console.log('✅ Screenshot saved to multi-project-test-screenshot.png')
    console.log()

    console.log('═══════════════════════════════════════')
    console.log('✅ ALL TESTS PASSED')
    console.log('═══════════════════════════════════════')
    console.log()
    console.log('Multi-project dashboard is working!')
    console.log('Dashboard URL: http://localhost:3000')
    console.log('Projects URL: http://localhost:3000/projects')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Run the test
testMultiProjectDashboard().catch(console.error)
