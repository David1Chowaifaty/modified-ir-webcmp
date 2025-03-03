import { test, expect, Page } from '@playwright/test';
import { loadTestFile, selectDate } from './utils';

interface Payload {
  location: number;
  flight_details: string;
  due_upon_booking: number;
  number_of_vehicles: number;
  vehicle_type_code: string;
  currency: string;
  arrival_time: string;
  arrival_date: string;
}

interface TestData {
  new_pickup: Payload;
  update_pickup: Payload;
}

const pickupPayload = loadTestFile<TestData>('pickup.json');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new_pickup_btn').click();
  await expect(page.locator('ir-pickup')).toBeVisible();
});

test.describe('New Pickup', () => {
  test('do a new pickup', async ({ page }) => {
    const payload = pickupPayload.new_pickup;
    const location = page.getByTestId('pickup_location');
    const pickupArrivalDate = page.getByTestId('pickup_arrival_date');
    const pickupArrivalTime = page.getByTestId('pickup_arrival_time');
    const pickupFlightDetails = page.getByTestId('pickup_flight_details');

    location.selectOption({ value: payload.location.toString() });
    await expect(page.getByTestId('pickup_body')).toBeVisible();
    // Picking the date
    await pickupArrivalDate.click();
    await selectDate({ date: payload.arrival_date, page });
    // Adding the arrival time
    await pickupArrivalTime.pressSequentially(payload.arrival_time);
    // Adding flight details
    await pickupFlightDetails.fill(payload.flight_details);
    // Saving the pickup
    await page.getByText('Save').click();
    await expect(page.locator('ir-pickup')).toBeHidden();
  });

  test('edit pickup', async ({ page }) => {
    const payload = pickupPayload.update_pickup;
    const location = page.getByTestId('pickup_location');
    const pickupArrivalDate = page.getByTestId('pickup_arrival_date');
    const pickupArrivalTime = page.getByTestId('pickup_arrival_time');
    const pickupFlightDetails = page.getByTestId('pickup_flight_details');
    const pickupVehicleTypeCode = page.getByTestId('pickup_vehicle_type_code');

    location.selectOption({ value: payload.location.toString() });
    await pickupArrivalDate.click();
    await selectDate({ date: payload.arrival_date, page });
    await pickupArrivalTime.pressSequentially(payload.arrival_time);
    await pickupFlightDetails.fill(payload.flight_details);
    // Assume vehicle_type_code is editable in the edit form.
    await pickupVehicleTypeCode.selectOption({ value: payload.vehicle_type_code });
    await page.getByText('Save').click();
    await expect(page.locator('ir-pickup')).toBeHidden();
  });
});

test.describe('Pickup Validation Errors', () => {
  test('shows error for invalid arrival_date format', async ({ page }) => {
    const validPayload = pickupPayload.new_pickup;
    await page.getByTestId('pickup_location').selectOption({ value: validPayload.location.toString() });
    const pickupArrivalDate = page.getByTestId('pickup_arrival_date');
    await pickupArrivalDate.click();
    const selectedDate = page.locator('.-selected-');
    if (await selectedDate.isVisible()) {
      await selectedDate.click();
    }
    await page.getByText('Save').click();
    await expect(pickupArrivalDate).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows error for invalid arrival_time format', async ({ page }) => {
    const validPayload = pickupPayload.new_pickup;
    await page.getByTestId('pickup_location').selectOption({ value: validPayload.location.toString() });
    await selectPickupDate(validPayload.arrival_date, page);
    // Enter an invalid time (e.g., 25:00 does not exist)
    await page.getByTestId('pickup_arrival_time').fill('');
    await page.getByTestId('pickup_flight_details').fill(validPayload.flight_details);
    await page.getByText('Save').click();

    await expect(page.getByTestId('pickup_arrival_time')).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows error when flight_details is empty', async ({ page }) => {
    const validPayload = pickupPayload.new_pickup;
    await page.getByTestId('pickup_location').selectOption({ value: validPayload.location.toString() });
    await selectPickupDate(validPayload.arrival_date, page);
    await page.getByTestId('pickup_arrival_time').pressSequentially(validPayload.arrival_time);
    // Leave flight_details empty
    await page.getByTestId('pickup_flight_details').fill('');
    await page.getByText('Save').click();

    await expect(page.getByTestId('pickup_flight_details')).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows error when number_of_vehicles is less than 1', async ({ page }) => {
    const validPayload = pickupPayload.new_pickup;
    await page.getByTestId('pickup_location').selectOption({ value: validPayload.location.toString() });
    await selectPickupDate(validPayload.arrival_date, page);
    await page.getByTestId('pickup_arrival_time').pressSequentially(validPayload.arrival_time);
    await page.getByTestId('pickup_flight_details').fill(validPayload.flight_details);
    // Set number_of_vehicles to 0 (must be at least 1)
    await page.getByTestId('pickup_number_of_vehicles').selectOption({ index: 0 });
    await page.getByText('Save').click();

    await expect(page.getByTestId('pickup_number_of_vehicles')).toHaveAttribute('aria-invalid', 'true');
  });
});

async function selectPickupDate(date: string, page: Page) {
  const pickupArrivalDate = page.getByTestId('pickup_arrival_date');
  await pickupArrivalDate.click();
  console.log(date);
  await selectDate({ date, page });
}
