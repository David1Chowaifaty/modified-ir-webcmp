import { expect, Page } from '@playwright/test';
import moment from 'moment';
type StatusType = 'INHOUSE' | 'VACANT' | 'TURNOVER' | 'CHECKIN' | 'CHECKOUT' | 'BLOCKED';

type StatusSummary = {
  count: number;
  period: string;
};

type StatusesResult = {
  total: number;
  room: string;
  statuses: Record<StatusType, StatusSummary[]>;
};

// export async function getAllRoomsTestCases(page: Page): Promise<StatusesResult[]> {
//   const rows = page.getByTestId('hk_task_row');
//   const rowCount = await rows.count();

//   const roomMap = new Map<string, StatusesResult>();

//   for (let i = 0; i < rowCount; i++) {
//     const row = rows.nth(i);
//     const cells = row.locator('td');

//     const period = (await cells.nth(1).textContent())?.trim() || '';
//     const room = (await cells.nth(2).textContent())?.trim() || '';
//     const statusText = (await cells.nth(3).textContent())?.trim().toUpperCase() as StatusType;

//     if (!period || !room || !statusText) continue;

//     // Ignore unknown status
//     const validStatuses: StatusType[] = ['INHOUSE', 'VACANT', 'TURNOVER', 'CHECKIN', 'CHECKOUT', 'BLOCKED'];
//     if (!validStatuses.includes(statusText)) continue;

//     if (!roomMap.has(room)) {
//       roomMap.set(room, {
//         total: 0,
//         room,
//         statuses: {
//           INHOUSE: [],
//           VACANT: [],
//           TURNOVER: [],
//           CHECKIN: [],
//           CHECKOUT: [],
//           BLOCKED: [],
//         },
//       });
//     }

//     const roomData = roomMap.get(room)!;
//     roomData.total++;

//     roomData.statuses[statusText].push({
//       count: 1,
//       period,
//     });
//   }
//   return Array.from(roomMap.values());
// }
export async function getAllRoomsTestCases(page: Page): Promise<StatusesResult[]> {
  // Wait for the loading state to complete and new data to be rendered
  await page.waitForLoadState('networkidle');

  // Wait for the table to be visible and stable
  const tableLocator = page.getByTestId('hk_task_row');
  await expect(tableLocator.first()).toBeVisible({ timeout: 10000 });

  // Wait a bit more for any potential re-renders
  await page.waitForTimeout(500);

  // Get fresh locator after waiting
  const rows = page.getByTestId('hk_task_row');
  const rowCount = await rows.count();

  const roomMap = new Map<string, StatusesResult>();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');

    // Wait for cells to be visible before extracting text
    await expect(cells.first()).toBeVisible();

    const period = (await cells.nth(1).textContent())?.trim() || '';
    const room = (await cells.nth(2).textContent())?.trim() || '';
    const statusText = (await cells.nth(3).textContent())?.trim().toUpperCase() as StatusType;

    if (!period || !room || !statusText) continue;

    // Ignore unknown status
    const validStatuses: StatusType[] = ['INHOUSE', 'VACANT', 'TURNOVER', 'CHECKIN', 'CHECKOUT', 'BLOCKED'];
    if (!validStatuses.includes(statusText)) continue;

    if (!roomMap.has(room)) {
      roomMap.set(room, {
        total: 0,
        room,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      });
    }

    const roomData = roomMap.get(room)!;
    roomData.total++;

    roomData.statuses[statusText].push({
      count: 1,
      period,
    });
  }
  return Array.from(roomMap.values());
}

// Alternative approach: Wait for specific content changes
export async function getAllRoomsTestCasesWithContentWait(page: Page, expectedMinRows = 1): Promise<StatusesResult[]> {
  // Wait for the API response to complete
  await page.waitForLoadState('networkidle');

  // Wait for the table to have the expected number of rows
  await page.waitForFunction(
    minRows => {
      const rows = document.querySelectorAll('[data-testid="hk_task_row"]');
      return rows.length >= minRows;
    },
    expectedMinRows,
    { timeout: 10000 },
  );

  // Additional wait for any animations or delayed updates
  await page.waitForTimeout(300);

  const rows = page.getByTestId('hk_task_row');
  const rowCount = await rows.count();

  const roomMap = new Map<string, StatusesResult>();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');

    // Ensure each cell is loaded
    await expect(cells.nth(1)).toBeVisible();
    await expect(cells.nth(2)).toBeVisible();
    await expect(cells.nth(3)).toBeVisible();

    const period = (await cells.nth(1).textContent())?.trim() || '';
    const room = (await cells.nth(2).textContent())?.trim() || '';
    const statusText = (await cells.nth(3).textContent())?.trim().toUpperCase() as StatusType;

    if (!period || !room || !statusText) continue;

    const validStatuses: StatusType[] = ['INHOUSE', 'VACANT', 'TURNOVER', 'CHECKIN', 'CHECKOUT', 'BLOCKED'];
    if (!validStatuses.includes(statusText)) continue;

    if (!roomMap.has(room)) {
      roomMap.set(room, {
        total: 0,
        room,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      });
    }

    const roomData = roomMap.get(room)!;
    roomData.total++;

    roomData.statuses[statusText].push({
      count: 1,
      period,
    });
  }
  return Array.from(roomMap.values());
}

// Most robust approach: Wait for data attribute changes
export async function getAllRoomsTestCasesWithDataWait(page: Page, previousCount = 0): Promise<StatusesResult[]> {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');

  // Wait for the row count to change (if we expect it to change)
  if (previousCount > 0) {
    await page.waitForFunction(
      prevCount => {
        const rows = document.querySelectorAll('[data-testid="hk_task_row"]');
        return rows.length !== prevCount;
      },
      previousCount,
      { timeout: 10000 },
    );
  }

  // Wait for the table container to be stable
  const tableContainer = page.locator('ir-hk-tasks');
  await expect(tableContainer).toBeVisible();

  // Wait for at least one row to be visible
  const firstRow = page.getByTestId('hk_task_row').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });

  // Additional stability wait
  await page.waitForTimeout(500);

  const rows = page.getByTestId('hk_task_row');
  const rowCount = await rows.count();

  const roomMap = new Map<string, StatusesResult>();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    // Wait for the row to be stable
    await expect(row).toBeVisible();

    const cells = row.locator('td');

    // Wait for all required cells to be present
    await expect(cells.nth(1)).toBeVisible();
    await expect(cells.nth(2)).toBeVisible();
    await expect(cells.nth(3)).toBeVisible();

    const period = (await cells.nth(1).textContent())?.trim() || '';
    const room = (await cells.nth(2).textContent())?.trim() || '';
    const statusText = (await cells.nth(3).textContent())?.trim().toUpperCase() as StatusType;

    if (!period || !room || !statusText) continue;

    const validStatuses: StatusType[] = ['INHOUSE', 'VACANT', 'TURNOVER', 'CHECKIN', 'CHECKOUT', 'BLOCKED'];
    if (!validStatuses.includes(statusText)) continue;

    if (!roomMap.has(room)) {
      roomMap.set(room, {
        total: 0,
        room,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      });
    }

    const roomData = roomMap.get(room)!;
    roomData.total++;

    roomData.statuses[statusText].push({
      count: 1,
      period,
    });
  }
  return Array.from(roomMap.values());
}
export function areResultsEqual(expected: StatusesResult[], actual: StatusesResult[]): boolean {
  const filteredExpected = expected.filter(entry => entry.total >= 1);

  const normalize = (data: StatusesResult[]) => {
    const map = new Map<string, StatusesResult>();

    for (const entry of data) {
      const statuses: Record<StatusType, Record<string, number>> = {
        INHOUSE: {},
        VACANT: {},
        TURNOVER: {},
        CHECKIN: {},
        CHECKOUT: {},
        BLOCKED: {},
      };

      for (const status in entry.statuses) {
        for (const s of entry.statuses[status as StatusType]) {
          statuses[status as StatusType][s.period] = (statuses[status as StatusType][s.period] || 0) + s.count;
        }
      }

      map.set(entry.room.trim(), {
        total: entry.total,
        room: entry.room.trim(),
        statuses: Object.fromEntries(Object.entries(statuses).map(([key, value]) => [key, Object.entries(value).map(([period, count]) => ({ period, count }))])) as Record<
          StatusType,
          StatusSummary[]
        >,
      });
    }

    return map;
  };

  const eMap = normalize(filteredExpected);
  const aMap = normalize(actual);

  for (const [room, eEntry] of eMap.entries()) {
    const aEntry = aMap.get(room);
    if (!aEntry) {
      console.log(`[Mismatch] Missing room: "${room}" in actual results`);
      return false;
    }

    if (eEntry.total !== aEntry.total) {
      console.log(`[Mismatch] Room: "${room}" has different totals. Expected: ${eEntry.total}, Actual: ${aEntry.total}`);
      return false;
    }

    for (const status of Object.keys(eEntry.statuses) as StatusType[]) {
      const eStatus = eEntry.statuses[status];
      const aStatus = aEntry.statuses[status];

      const eByPeriod = new Map(eStatus.map(({ period, count }) => [period, count]));
      const aByPeriod = new Map(aStatus.map(({ period, count }) => [period, count]));

      const allPeriods = new Set([...eByPeriod.keys(), ...aByPeriod.keys()]);

      for (const period of allPeriods) {
        const expectedCount = eByPeriod.get(period) || 0;
        const actualCount = aByPeriod.get(period) || 0;

        if (expectedCount !== actualCount) {
          console.log(`[Mismatch] Room: "${room}", Status: "${status}", Period: "${period}" — Expected: ${expectedCount}, Actual: ${actualCount}`);
          return false;
        }
      }
    }
  }

  return true;
}

export const testData = [
  {
    case: 'Every day',
    params: {
      period: moment().format('YYYY-MM-DD'),
      housekeepers: '000',
      frequency: '001',
      include_dusty_units: '000',
      highlight_check_ins: '000',
    },
    results: [
      {
        room: '01. Quince Deluxe Studio',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '02. Peach Deluxe Studio',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '03. Loquat Superior Studio',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '04. Grapes Deluxe Studio',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '05. Lemon Deluxe Studio',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
        },
      },
      {
        room: '06. Pomegranate Room (2 adults - 1 child)',
        total: 1,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '07. Orange Quadruple Split Level Family Room',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '08. Tangerine Deluxe Studio',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
        },
      },
      {
        room: '09. Blueberry Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '10. Hawthorn Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '11. Bitter Orange Double Room',
        total: 1,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '12. Fig Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '13. Lime Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '14. Prickly Pear Double Room',
        total: 1,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
    ],
  },
  {
    case: `Every day until ${moment().add(2, 'days').format('YYYY-MM-DD')}`,
    params: {
      period: moment().add(2, 'days').format('YYYY-MM-DD'),
      housekeepers: '000',
      frequency: '001',
      include_dusty_units: '000',
      highlight_check_ins: '000',
    },
    results: [
      {
        room: '01. Quince Deluxe Studio',
        total: 3,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          CHECKIN: [
            {
              period: '9 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '02. Peach Deluxe Studio',
        total: 3,
        statuses: {
          INHOUSE: [
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '03. Loquat Superior Studio',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '04. Grapes Deluxe Studio',
        total: 2,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '9 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '05. Lemon Deluxe Studio',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
        },
      },
      {
        room: '06. Pomegranate Room (2 adults - 1 child)',
        total: 2,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [
            {
              period: '9 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '07. Orange Quadruple Split Level Family Room',
        total: 2,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '08. Tangerine Deluxe Studio',
        total: 3,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [
            {
              period: '8 Jul',
              count: 1,
            },
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
          ],
        },
      },
      {
        room: '09. Blueberry Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '10. Hawthorn Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '11. Bitter Orange Double Room',
        total: 3,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '12. Fig Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '13. Lime Double Room',
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '14. Prickly Pear Double Room',
        total: 3,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
    ],
  },
  {
    case: `Every day until ${moment().add(4, 'days').format('YYYY-MM-DD')}`,
    params: {
      period: moment().add(4, 'days').format('YYYY-MM-DD'),
      housekeepers: '000',
      frequency: '001',
      include_dusty_units: '000',
      highlight_check_ins: '000',
    },
    results: [
      {
        room: '01. Quince Deluxe Studio',
        total: 5,
        statuses: {
          INHOUSE: [
            {
              period: '11 Jul',
              count: 1,
            },
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          CHECKIN: [
            {
              period: '9 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '02. Peach Deluxe Studio',
        total: 5,
        statuses: {
          INHOUSE: [
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [
            {
              period: '8 Jul',
              count: 1,
            },
            {
              period: '11 Jul',
              count: 1,
            },
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '03. Loquat Superior Studio',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '04. Grapes Deluxe Studio',
        total: 3,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '9 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          BLOCKED: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
        },
      },
      {
        room: '05. Lemon Deluxe Studio',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
        },
      },
      {
        room: '06. Pomegranate Room (2 adults - 1 child)',
        total: 4,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          CHECKIN: [
            {
              period: '11 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [
            {
              period: '9 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '07. Orange Quadruple Split Level Family Room',
        total: 4,
        statuses: {
          INHOUSE: [
            {
              period: '11 Jul',
              count: 1,
            },
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '10 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [
            {
              period: '8 Jul',
              count: 1,
            },
          ],
          BLOCKED: [],
        },
      },
      {
        room: '08. Tangerine Deluxe Studio',
        total: 5,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [],
          BLOCKED: [
            {
              period: '8 Jul',
              count: 1,
            },
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
            {
              period: '11 Jul',
              count: 1,
            },
          ],
        },
      },
      {
        room: '09. Blueberry Double Room',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '10. Hawthorn Double Room',
        total: 2,
        statuses: {
          INHOUSE: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '11 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '11. Bitter Orange Double Room',
        total: 5,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [
            {
              period: '11 Jul',
              count: 1,
            },
          ],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '12. Fig Double Room',
        total: 1,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '13. Lime Double Room',
        total: 2,
        statuses: {
          INHOUSE: [
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [
            {
              period: '11 Jul',
              count: 1,
            },
          ],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
      {
        room: '14. Prickly Pear Double Room',
        total: 5,
        statuses: {
          INHOUSE: [
            {
              period: '8 Jul',
              count: 1,
            },
            {
              period: '9 Jul',
              count: 1,
            },
            {
              period: '10 Jul',
              count: 1,
            },
            {
              period: '11 Jul',
              count: 1,
            },
            {
              period: '12 Jul',
              count: 1,
            },
          ],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      },
    ],
  },
];
