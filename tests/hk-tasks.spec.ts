import { test, expect, Locator } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
test.describe('IR Task Filters Component', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo['filtersComponent'] = page.locator('ir-tasks-filters');

    testInfo['period'] = page.getByTestId('period');
    testInfo['housekeepers'] = page.getByTestId('housekeepers');
    testInfo['cleaning_frequency'] = page.getByTestId('cleaning_frequency');
    testInfo['dusty_units'] = page.getByTestId('dusty_units');
    testInfo['highlight_check_ins'] = page.getByTestId('highlight_check_ins');

    testInfo['applyButton'] = page.getByTestId('apply');
    testInfo['resetButton'] = page.getByTestId('reset');
  });

  test('Check if the filters component renders properly', async ({ page }, testInfo) => {
    await expect(testInfo['filtersComponent']).toBeVisible();
  });

  test('Check if all filter dropdowns are visible', async ({ page }, testInfo) => {
    await expect(testInfo['period']).toBeVisible();
    await expect(testInfo['housekeepers']).toBeVisible();
    await expect(testInfo['cleaning_frequency']).toBeVisible();
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
              console.log(data);
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
    const daily_frequency = await (testInfo['cleaning_frequency'] as Locator).locator('option').nth(0).getAttribute('value');
    const dusty_units = await (testInfo['dusty_units'] as Locator).locator('option').nth(0).getAttribute('value');
    const highlight_check_ins = await (testInfo['highlight_check_ins'] as Locator).locator('option').nth(0).getAttribute('value');

    //select each dropdown first option
    await (testInfo['period'] as Locator).selectOption({ index: 1 });
    await (testInfo['housekeepers'] as Locator).selectOption({ index: 1 });
    await (testInfo['cleaning_frequency'] as Locator).selectOption({ index: 1 });
    await (testInfo['dusty_units'] as Locator).selectOption({ index: 1 });
    await (testInfo['highlight_check_ins'] as Locator).selectOption({ index: 1 });

    const [request] = await Promise.all([
      page.waitForRequest(req => {
        if (req.url().includes('/Get_HK_Tasks') && req.method() === 'POST') {
          const postData = req.postData();
          if (postData) {
            try {
              const data = JSON.parse(postData);
              return data.to_date === to_date && data.highlight_window === highlight_check_ins && data.dusty_units === dusty_units && data.cleaning_frequencies === daily_frequency;
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
    await expect(testInfo['cleaning_frequency'] as Locator).toHaveValue(daily_frequency ?? '');
    await expect(testInfo['dusty_units'] as Locator).toHaveValue(dusty_units ?? '');
    await expect(testInfo['highlight_check_ins'] as Locator).toHaveValue(highlight_check_ins ?? '');
    await expect(testInfo['housekeepers'] as Locator).toHaveValue('000');
  });
});
