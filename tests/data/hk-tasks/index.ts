import { expect, Page } from '@playwright/test';
import { freq002 } from './frequency-002';
// import { freq001 } from './frequency-001';
// import { freq003 } from './frequency-003';

type StatusType = 'INHOUSE' | 'VACANT' | 'TURNOVER' | 'CHECKIN' | 'CHECKOUT';

type StatusSummary = string;

export type StatusesResult = {
  total: number;
  room: string;
  statuses: Record<StatusType, StatusSummary[]>;
};
export type HouseKeepingTasksSchema = {
  case: string;
  params: {
    period: string;
    housekeepers: string;
    frequency: string;
    include_dusty_units: string;
    highlight_check_ins: string;
  };
  results: StatusesResult[];
}[];
export async function getAllRoomsTestCases(page: Page): Promise<StatusesResult[]> {
  await page.waitForLoadState('networkidle');

  const tableLocator = page.getByTestId('hk_task_row');
  await expect(tableLocator.first()).toBeVisible({ timeout: 10000 });

  await page.waitForTimeout(500);

  const rows = page.getByTestId('hk_task_row');
  const rowCount = await rows.count();

  const roomMap = new Map<string, StatusesResult>();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');

    await expect(cells.first()).toBeVisible();

    const period = (await cells.nth(1).textContent())?.trim() || '';
    const room = (await cells.nth(2).textContent())?.trim() || '';
    let statusText = (await cells.nth(3).textContent())?.trim().toUpperCase();

    if (!period || !room || !statusText) continue;
    if (statusText === 'NOT CLEAN TODAY') {
      statusText = 'INHOUSE';
    }

    const validStatuses: StatusType[] = ['INHOUSE', 'VACANT', 'TURNOVER', 'CHECKIN', 'CHECKOUT'];
    if (!validStatuses.includes(statusText as StatusType)) continue;

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
        },
      });
    }

    const roomData = roomMap.get(room)!;
    roomData.total++;

    // Push the period as a string (matching StatusSummary type)
    roomData.statuses[statusText].push(period);
  }
  return Array.from(roomMap.values());
}

export function areResultsEqual(expected: StatusesResult[], actual: StatusesResult[]): boolean {
  function normalize(data: StatusesResult[]): Map<string, { total: number; statuses: Record<StatusType, Map<string, number>> }> {
    const map = new Map<string, { total: number; statuses: Record<StatusType, Map<string, number>> }>();

    for (const entry of data) {
      const statuses: Record<StatusType, Map<string, number>> = {
        INHOUSE: new Map(),
        VACANT: new Map(),
        TURNOVER: new Map(),
        CHECKIN: new Map(),
        CHECKOUT: new Map(),
      };

      for (const status of Object.keys(entry.statuses) as StatusType[]) {
        const arr = entry.statuses[status];

        for (const period of arr) {
          if (typeof period === 'string' && period.trim()) {
            const trimmedPeriod = period.trim();
            statuses[status].set(trimmedPeriod, (statuses[status].get(trimmedPeriod) || 0) + 1);
          }
        }
      }

      map.set(entry.room.trim(), { total: entry.total, statuses });
    }
    return map;
  }
  function getMissingRooms(eMap: Map<string, any>, aMap: Map<string, any>): { missingInActual: string[]; extraInActual: string[] } {
    const missingInActual: string[] = [];
    const extraInActual: string[] = [];

    for (const room of eMap.keys()) {
      if (!aMap.has(room)) missingInActual.push(room);
    }
    for (const room of aMap.keys()) {
      if (!eMap.has(room)) extraInActual.push(room);
    }

    if (missingInActual.length) {
      console.log(`Missing rooms in actual (present in expected): ${missingInActual.join(', ')}`);
    }
    if (extraInActual.length) {
      console.log(`Unexpected rooms in actual (not in expected): ${extraInActual.join(', ')}`);
    }
    if (!missingInActual.length && !extraInActual.length) {
      console.log('No room differences between expected and actual.');
    }

    return { missingInActual, extraInActual };
  }
  // Detailed logging
  console.log('=== COMPARISON DETAILS ===');
  console.log('Expected rooms:', expected.map(e => e.room).join(', '));
  console.log('Actual rooms:', actual.map(a => a.room).join(', '));

  const filteredExpected = expected.filter(entry => entry.total >= 1);
  const eMap = normalize(filteredExpected);
  const aMap = normalize(actual);

  if (eMap.size !== aMap.size) {
    console.log('Difference in size between the actual size and the expected room size');
    console.log(`Expected size ${eMap.size} but got ${aMap.size}`);
    getMissingRooms(eMap, aMap);
    return false;
  }

  console.log('Filtered expected rooms:', Array.from(eMap.keys()).join(', '));
  console.log('Actual rooms after normalization:', Array.from(aMap.keys()).join(', '));
  for (const [room, eEntry] of eMap.entries()) {
    const aEntry = aMap.get(room);
    if (!aEntry) {
      console.log(`[Mismatch] Missing room: "${room}" in actual results`);
      return false;
    }

    console.log(`Comparing room: "${room}"`);
    console.log(`  Expected total: ${eEntry.total}, Actual total: ${aEntry.total}`);

    if (eEntry.total !== aEntry.total) {
      console.log(`[Mismatch] Room: "${room}" has different totals. Expected: ${eEntry.total}, Actual: ${aEntry.total}`);
      return false;
    }

    for (const status of Object.keys(eEntry.statuses) as StatusType[]) {
      const eStatus = eEntry.statuses[status];
      const aStatus = aEntry.statuses[status];
      const allPeriods = new Set([...eStatus.keys(), ...aStatus.keys()]);

      if (allPeriods.size > 0) {
        console.log(`  Status: ${status}`);
        for (const period of allPeriods) {
          const expectedCount = eStatus.get(period) || 0;
          const actualCount = aStatus.get(period) || 0;

          console.log(`    Period: "${period}" - Expected: ${expectedCount}, Actual: ${actualCount}`);

          if (expectedCount !== actualCount) {
            console.log(`[Mismatch] Room: "${room}", Status: "${status}", Period: "${period}" — Expected: ${expectedCount}, Actual: ${actualCount}`);
            return false;
          }
        }
      }
    }
  }

  console.log('=== COMPARISON COMPLETE - ALL MATCHES ===');
  return true;
}
// export const testData = [...freq001, ...freq002, ...freq003];
export const testData = [...freq002];
