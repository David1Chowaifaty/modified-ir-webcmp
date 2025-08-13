import { expect, Page } from '@playwright/test';
import { freq002 } from './frequency-002';
import { freq001 } from './frequency-001';
import { freq003 } from './frequency-003';

type StatusType = 'INHOUSE' | 'VACANT' | 'TURNOVER' | 'CHECKIN' | 'CHECKOUT' | 'BLOCKED';

type StatusSummary = string;

export type StatusesResult = {
  total: number;
  room: string;
  statuses: Record<StatusType, StatusSummary[]>;
};

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
        BLOCKED: new Map(),
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

  // Detailed logging
  console.log('=== COMPARISON DETAILS ===');
  console.log('Expected rooms:', expected.map(e => e.room).join(', '));
  console.log('Actual rooms:', actual.map(a => a.room).join(', '));

  const filteredExpected = expected.filter(entry => entry.total >= 1);
  const eMap = normalize(filteredExpected);
  const aMap = normalize(actual);

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
export const testData = [...freq001, ...freq002, ...freq003];
