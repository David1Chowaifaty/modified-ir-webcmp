import { test, expect, Locator, Page, TestInfo } from '@playwright/test';
import moment from 'moment';
import { areResultsEqual, getAllRoomsTestCases, testData } from './data/hk-tasks';

const setupTestInfo = async ({ page }: { page: Page }, testInfo: TestInfo) => {
  testInfo['filtersComponent'] = page.locator('ir-tasks-filters');

  testInfo['period'] = page.getByTestId('period');
  const housekeepersLocator = page.getByTestId('housekeepers');
  testInfo['housekeepers'] = (await housekeepersLocator.count()) > 0 ? housekeepersLocator : null;
  // testInfo['cleaning_frequency'] = page.getByTestId('cleaning_frequency');
  testInfo['dusty_units'] = page.getByTestId('dusty_units');
  testInfo['highlight_check_ins'] = page.getByTestId('highlight_check_ins');

  testInfo['applyButton'] = page.getByTestId('apply');
  testInfo['resetButton'] = page.getByTestId('reset');
};

const applyHKFilters = async ({
  page,
  testInfo,
  params,
}: {
  page: Page;
  testInfo: TestInfo;
  params: {
    period: string;
    housekeepers: string;
    frequency: string;
    include_dusty_units: string;
    highlight_check_ins: string;
  };
}) => {
  const requestPromise = page.waitForRequest(request => request.url().includes('/Get_HK_Tasks') && request.method() === 'POST');

  const responsePromise = page.waitForResponse(response => response.url().includes('/Get_HK_Tasks') && response.status() === 200);

  // Apply the filters
  await (testInfo['period'] as Locator).selectOption({ value: params.period });
  if (testInfo['housekeepers']) {
    await (testInfo['housekeepers'] as Locator).selectOption({ value: params.housekeepers });
  }
  // await (testInfo['cleaning_frequency'] as Locator).selectOption({ value: params.frequency });
  await (testInfo['dusty_units'] as Locator).selectOption({ value: params.include_dusty_units });
  await (testInfo['highlight_check_ins'] as Locator).selectOption({ value: params.highlight_check_ins });

  // Click apply and wait for request/response
  await (testInfo['applyButton'] as Locator).click();

  const [request, response] = await Promise.all([requestPromise, responsePromise]);

  // Wait for loading indicators to disappear (if any)
  const loadingIndicator = page.locator('.loading, [data-loading="true"], .spinner');
  if ((await loadingIndicator.count()) > 0) {
    await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
  }

  // Wait for network idle
  await page.waitForLoadState('networkidle');

  // Wait for the table to be present and stable
  await expect(page.getByTestId('hk_task_row').first()).toBeVisible({ timeout: 10000 });

  // Final stability wait
  await page.waitForTimeout(300);

  return { request, response };
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Check task results', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const taskBtn = page.getByText('Tasks');
    await expect(taskBtn).toBeVisible();
    await taskBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('ir-hk-tasks')).toBeVisible();
    await setupTestInfo({ page }, testInfo);
  });
  testData.forEach(testCase => {
    test(testCase.case, async ({ page }, testInfo) => {
      const taskBtn = page.getByText('Tasks').first();
      await expect(taskBtn).toBeVisible();
      await taskBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('ir-hk-tasks')).toBeVisible();
      await setupTestInfo({ page }, testInfo);

      // Wait for initial data to load
      await page.waitForLoadState('networkidle');

      const { request, response } = await applyHKFilters({
        page,
        testInfo,
        params: testCase.params,
      });

      // Validate request/response
      expect(request.url()).toContain('/Get_HK_Tasks');
      expect(response.status()).toBe(200);

      // Wait for DOM to be fully updated
      await page.waitForFunction(
        () => {
          const rows = document.querySelectorAll('[data-testid="hk_task_row"]');
          return (
            rows.length > 0 &&
            Array.from(rows).every(row => {
              const cells = row.querySelectorAll('td');
              return cells.length >= 4 && cells[1].textContent?.trim() && cells[2].textContent?.trim();
            })
          );
        },
        { timeout: 10000 },
      );

      // Additional wait for any final updates
      await page.waitForTimeout(500);

      // Now get the results
      const tasksResults = await getAllRoomsTestCases(page);
      expect(areResultsEqual(testCase.results, tasksResults)).toBe(true);
    });
  });
});

//Testing filters
test.describe('IR Task Filters Component', () => {
  test.beforeEach(setupTestInfo);

  test('Check if the filters component renders properly', async ({ page }, testInfo) => {
    await expect(testInfo['filtersComponent']).toBeVisible();
  });

  test('Check if all filter dropdowns are visible', async ({ page }, testInfo) => {
    await expect(testInfo['period']).toBeVisible();
    await expect(testInfo['housekeepers']).toBeVisible();
    // await expect(testInfo['cleaning_frequency']).toBeVisible();
    await expect(testInfo['dusty_units']).toBeVisible();
    await expect(testInfo['highlight_check_ins']).toBeVisible();
  });

  test('Change Period dropdown and verify change', async ({ page }, testInfo) => {
    const value = await (testInfo['period'] as Locator).locator('option').nth(1).getAttribute('value');
    await (testInfo['period'] as Locator).selectOption({ value: value ?? '' });
    await expect(testInfo['period']).toHaveValue(value);
  });

  test('Change Housekeepers dropdown and verify change', async ({ page }, testInfo) => {
    testInfo['selectedHousekeeper'] = '000';
    await testInfo['housekeepers'].selectOption(testInfo['selectedHousekeeper']);
    await expect(testInfo['housekeepers']).toHaveValue(testInfo['selectedHousekeeper']);
  });

  test('Click Apply button emits "applyFilters" and triggers API call', async ({ page }, testInfo) => {
    const [request] = await Promise.all([page.waitForRequest(req => req.url().includes('/Get_HK_Tasks') && req.method() === 'POST'), (testInfo['applyButton'] as Locator).click()]);
    expect(request.url().includes('/Get_HK_Tasks')).toBeTruthy();
  });
  test('Click Apply button emits "applyFilters" and triggers API call with the period filter changed', async ({ page }, testInfo) => {
    const value = await (testInfo['period'] as Locator).locator('option').nth(1).getAttribute('value');
    await (testInfo['period'] as Locator).selectOption({ index: 1 });
    const [request] = await Promise.all([
      page.waitForRequest(req => {
        if (req.url().includes('/Get_HK_Tasks') && req.method() === 'POST') {
          const postData = req.postData();
          if (postData) {
            try {
              const data = JSON.parse(postData);
              return data.to_date === value;
            } catch (error) {
              console.error('Error parsing request body:', error);
              return false;
            }
          }
        }
        return false;
      }),
      (testInfo['applyButton'] as Locator).click(),
    ]);
    expect(request.url().includes('/Get_HK_Tasks')).toBeTruthy();
  });

  test('Click Reset button and verify reset behavior', async ({ page }, testInfo) => {
    const [request] = await Promise.all([page.waitForRequest(req => req.url().includes('/Get_HK_Tasks') && req.method() === 'POST'), (testInfo['resetButton'] as Locator).click()]);
    expect(request.url().includes('/Get_HK_Tasks')).toBeTruthy();
  });
  test('Click Reset button and verify reset behavior and check payload', async ({ page }, testInfo) => {
    //get dropdowns initial values
    const to_date = await (testInfo['period'] as Locator).locator('option').nth(0).getAttribute('value');
    // const daily_frequency = await (testInfo['cleaning_frequency'] as Locator).locator('option').nth(0).getAttribute('value');
    const dusty_units = await (testInfo['dusty_units'] as Locator).locator('option').nth(0).getAttribute('value');
    const highlight_check_ins = await (testInfo['highlight_check_ins'] as Locator).locator('option').nth(0).getAttribute('value');

    //select each dropdown first option
    await (testInfo['period'] as Locator).selectOption({ index: 1 });
    await (testInfo['housekeepers'] as Locator).selectOption({ index: 1 });
    // await (testInfo['cleaning_frequency'] as Locator).selectOption({ index: 1 });
    await (testInfo['dusty_units'] as Locator).selectOption({ index: 1 });
    await (testInfo['highlight_check_ins'] as Locator).selectOption({ index: 1 });

    const [request] = await Promise.all([
      page.waitForRequest(req => {
        if (req.url().includes('/Get_HK_Tasks') && req.method() === 'POST') {
          const postData = req.postData();
          if (postData) {
            try {
              const data = JSON.parse(postData);
              // return data.to_date === to_date && data.highlight_window === highlight_check_ins && data.dusty_units === dusty_units && data.cleaning_frequencies === daily_frequency;
            } catch (error) {
              console.error('Error parsing request body:', error);
              return false;
            }
          }
        }
        return false;
      }),
      (testInfo['resetButton'] as Locator).click(),
    ]);
    expect(request.url().includes('/Get_HK_Tasks')).toBeTruthy();
    await expect(testInfo['period'] as Locator).toHaveValue(to_date ?? '');
    // await expect(testInfo['cleaning_frequency'] as Locator).toHaveValue(daily_frequency ?? '');
    await expect(testInfo['dusty_units'] as Locator).toHaveValue(dusty_units ?? '');
    await expect(testInfo['highlight_check_ins'] as Locator).toHaveValue(highlight_check_ins ?? '');
    await expect(testInfo['housekeepers'] as Locator).toHaveValue('000');
  });
});
//Testing task table table
test.describe('IR Task Table Component', () => {
  test('checking table rows validity', async ({ page }) => {
    const table = page.getByTestId('hk_tasks_table');
    await expect(table).toBeVisible();
    const rows = table.getByTestId('hk_task_row');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const dataDate = await row.getAttribute('data-date');
      const isAssigned = await row.getAttribute('data-assigned');
      if (moment(dataDate ?? '', 'YYYY-MM-DD').isSameOrBefore(moment(), 'days')) {
        if (!JSON.parse(isAssigned ?? '')) {
          await expect(row.locator('ir-checkbox')).toHaveCount(0);
        } else {
          await expect(row.locator('ir-checkbox')).toHaveCount(1);
        }
      }
    }
  });
});
