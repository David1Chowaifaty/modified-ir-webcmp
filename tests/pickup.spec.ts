import { test, expect } from '@playwright/test';
import { loadTestFile, selectDate } from './utils';

interface TestData {
  location: number;
  flight_details: string;
  due_upon_booking: number;
  number_of_vehicles: number;
  vehicle_type_code: string;
  currency: null;
  arrival_time: string;
  arrival_date: string;
}
const pickupPayload = loadTestFile<TestData>('pickup.json');
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('New Pickup', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByTestId('new_pickup_btn').click();
    await expect(page.locator('ir-pickup')).toBeVisible();
  });
  test('do a new pickup', async ({ page }) => {
    const location = page.getByTestId('pickup_location');
    const pickupArrivalDate = page.getByTestId('pickup_arrival_date');
    const pickupArrivalTime = page.getByTestId('pickup_arrival_time');
    const pickupFlightDetails = page.getByTestId('pickup_flight_details');
    location.selectOption({ value: pickupPayload.location.toString() });
    await pickupArrivalDate.click();
    await selectDate({ date: pickupPayload.arrival_date, page });
    await pickupArrivalTime.pressSequentially(pickupPayload.arrival_time);
    await pickupFlightDetails.fill(pickupPayload.flight_details);
    await page.getByText('Save').click();
    await expect(page.locator('ir-pickup')).toBeHidden();
  });
  test('testing datepicker', async ({ page }) => {
    const pickupArrivalDate = page.getByTestId('pickup_arrival_date');
    await pickupArrivalDate.click();
    await selectDate({ date: pickupPayload.arrival_date, page });
  });
});
