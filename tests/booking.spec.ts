import { test, expect, Page, Locator } from '@playwright/test';
import moment from 'moment';
import { loadTestFile } from './utils';
import { RatePlan, RoomType } from '../src/models/property';
interface CheckAvailability {
  from_date: string;
  to_date: string;
  propertyid: number;
  language: string;
  room_type_ids: any[];
  agent_id: null;
  is_in_agent_mode: boolean;
  room_type_ids_to_update: number[];
  adult_nbr: string;
  child_nbr: number;
  currency_ref: string;
  skip_getting_assignable_units: boolean;
  is_backend: boolean;
}
interface Guest {
  first_name: string;
  last_name: string;
  unit?: string | null;
  bed_configuration?: number;
  rp_id: number;
}
interface MainGuest {
  first_name: string;
  last_name: string;
  mobile: string;
  email: string;
  country_id: number;
  cci?: {
    card_holder_name: string;
    card_holder_number: string;
    card_expiry_date: string;
  };
}
interface Booking {
  rp_id: number;
  room_name: string;
  total_rooms: number;
  guests: Guest[];
  main_guest: MainGuest;
  arrival_time?: string;
  note?: string;
}
interface TestData {
  check_availability: CheckAvailability;
  booking: Booking;
}
type BookingMode = 'bar' | 'plus' | 'edit';
const payload = loadTestFile<TestData>('new_booking.json');
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('ir-calendar')).toBeVisible();
});

let AvailabilityResults: RoomType[] = [];
const allGuestsInSameRoom = payload.booking.guests.every(g => g.rp_id === payload.booking.guests[0].rp_id);

test.describe('New Booking', () => {
  test('check new booking btn', async ({ page }) => {
    const btn = page.getByTestId('new_booking_btn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByTestId('book_property_sheet')).toBeVisible();
    const date_picker = page.getByTestId('date_picker');

    date_picker.click();
    await selectAdultAndChildren({ page });
    await selectDates({ fromDate: payload.check_availability.from_date, toDate: payload.check_availability.to_date, page });
    await checkAvailability({ page, mode: 'plus' });
    await bookRooms({ page, mode: 'plus' });
    await page.getByText('Next').click();
    await fillGuestsRooms({ guests: payload.booking.guests, page });
    await fillMainGuest({ page });
    //Do reservation
    // await page.getByText('Book').click();
    // await expect(page.getByTestId('book_property_sheet')).toBeHidden();
  });

  test('bar booking', async ({ page }) => {
    //select the room
    await page.locator(`//div[@data-date='${payload.check_availability.from_date}' and @data-room-name='${payload.booking.room_name}']`).click();
    await page.locator(`//div[@data-date='${payload.check_availability.to_date}' and @data-room-name='${payload.booking.room_name}']`).click();

    await page.getByTestId('bar_booking_btn').click();

    await expect(page.getByTestId('book_property_sheet')).toBeVisible();
    await selectAdultAndChildren({ page });
    await checkAvailability({ page, mode: 'bar' });
    await bookRooms({ page, mode: 'bar' });

    await fillGuestsRooms({ guests: [payload.booking.guests[0]], page });
  });
  test('stretch', async ({ page }) => {
    const booking_number = 38645546310;
    const roomName = '105';
    const toDate = '2025-03-10';
    const booking = page.locator(`igl-booking-event[data-testid="booking_${booking_number}"][data-room-name="${roomName}"]`);
    await expect(booking).toBeVisible();
    const rightSideHandle = booking.locator("//div[contains(@class, 'bookingEventDragHandle') and contains(@class, 'rightSide')]");
    await expect(rightSideHandle).toBeVisible();
    const targetColumn = page.locator(`//div[@data-date='${toDate}' and @data-room-name='${roomName}']`);
    await expect(targetColumn).toBeVisible();

    const handleBox = await rightSideHandle.boundingBox();
    const targetBox = await targetColumn.boundingBox();

    if (handleBox && targetBox) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x + targetBox.width / 2, handleBox.y + handleBox.height / 2, { steps: 15 });
      await page.mouse.up();
    }
    await page.waitForTimeout(1000);
  });

  test('multiple guests with room selection', async ({ page }) => {
    const btn = page.getByTestId('new_booking_btn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByTestId('book_property_sheet')).toBeVisible();
    const date_picker = page.getByTestId('date_picker');

    date_picker.click();
    await selectAdultAndChildren({ page });
    await selectDates({ fromDate: payload.check_availability.from_date, toDate: payload.check_availability.to_date, page });
    await checkAvailability({ page, mode: 'plus' });
    await bookRooms({ page, mode: 'plus' });
    await page.getByText('Next').click();

    // Test the room selection functionality
    await testRoomSelectionForMultipleGuests({ page, guests: payload.booking.guests });

    await fillMainGuest({ page });
  });
});

test.describe('igl-application-info component', () => {
  test('room selection behavior with multiple guests', async ({ page }) => {
    // Start a new booking
    const btn = page.getByTestId('new_booking_btn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByTestId('book_property_sheet')).toBeVisible();

    // Select dates and check availability
    const date_picker = page.getByTestId('date_picker');
    date_picker.click();
    await selectAdultAndChildren({ page });
    await selectDates({ fromDate: payload.check_availability.from_date, toDate: payload.check_availability.to_date, page });
    await checkAvailability({ page, mode: 'plus' });

    // Book rooms for multiple guests with different rate plans
    await bookRooms({ page, mode: 'plus' });
    await page.getByText('Next').click();

    // Verify the correct number of application info components are rendered
    const applicationInfos = await page.locator('igl-application-info').all();
    expect(applicationInfos.length).toBe(payload.booking.guests.length);

    // Find guests with the same rate plan (we know the first two guests have the same rate plan)
    const sameRatePlanGuests = payload.booking.guests.filter(g => g.rp_id === payload.booking.guests[0].rp_id);

    // We need at least 2 guests with the same rate plan for this test
    if (sameRatePlanGuests.length >= 2) {
      // Get the indices of the guests with the same rate plan
      const indices: number[] = [];
      for (let i = 0; i < payload.booking.guests.length; i++) {
        if (payload.booking.guests[i].rp_id === sameRatePlanGuests[0].rp_id) {
          indices.push(i);
        }
      }

      // Fill in guest information for the first guest
      const firstGuestIndex = indices[0];
      const firstGuest = payload.booking.guests[firstGuestIndex];
      const firstAppInfo = applicationInfos[firstGuestIndex];

      await firstAppInfo.getByTestId('guest_first_name').fill(firstGuest.first_name);
      await firstAppInfo.getByTestId('guest_last_name').fill(firstGuest.last_name);

      // Check if room dropdown exists for the first guest
      const firstRoomDropdown = firstAppInfo.locator('select[data-testid="unit"]');
      if (await firstRoomDropdown.isVisible()) {
        // Get all available options for the first guest
        const firstOptions = await firstRoomDropdown.locator('option').all();
        const firstOptionCount = firstOptions.length;

        // Should have at least the placeholder option
        expect(firstOptionCount).toBeGreaterThan(0);

        if (firstOptionCount > 1) {
          // Select the first available room for the first guest
          await firstRoomDropdown.selectOption({ index: 1 });

          // Get the selected room ID
          const selectedRoomId = await firstRoomDropdown.evaluate(el => (el as HTMLSelectElement).value);

          // Now check the second guest's dropdown
          const secondGuestIndex = indices[1];
          const secondAppInfo = applicationInfos[secondGuestIndex];

          // Fill in guest information for the second guest
          const secondGuest = payload.booking.guests[secondGuestIndex];
          await secondAppInfo.getByTestId('guest_first_name').fill(secondGuest.first_name);
          await secondAppInfo.getByTestId('guest_last_name').fill(secondGuest.last_name);

          // Check if room dropdown exists for the second guest
          const secondRoomDropdown = secondAppInfo.locator('select[data-testid="unit"]');
          if (await secondRoomDropdown.isVisible()) {
            // Get all available options for the second guest
            const secondOptions = await secondRoomDropdown.locator('option').all();

            // Check if the room selected for the first guest is available or disabled for the second guest
            let roomAvailableForSecondGuest = false;
            for (const option of secondOptions) {
              const optionValue = await option.getAttribute('value');
              if (optionValue === selectedRoomId) {
                const isDisabled = await option.isDisabled();
                // If the room is available and not disabled, that's an issue
                if (!isDisabled) {
                  roomAvailableForSecondGuest = true;
                }
              }
            }

            // The room should not be available for the second guest
            expect(roomAvailableForSecondGuest).toBe(false);

            // Now select a different room for the second guest
            if (secondOptions.length > 1) {
              // Find an option that's not the same as the first guest's selection
              let differentOptionIndex = -1;
              for (let i = 1; i < secondOptions.length; i++) {
                const optionValue = await secondOptions[i].getAttribute('value');
                if (optionValue !== selectedRoomId && !(await secondOptions[i].isDisabled())) {
                  differentOptionIndex = i;
                  break;
                }
              }

              if (differentOptionIndex > 0) {
                await secondRoomDropdown.selectOption({ index: differentOptionIndex });

                // Get the selected room ID for the second guest
                const secondSelectedRoomId = await secondRoomDropdown.evaluate(el => (el as HTMLSelectElement).value);

                // Verify the two selected rooms are different
                expect(secondSelectedRoomId).not.toBe(selectedRoomId);
              }
            }
          }
        }
      }
    }
  });

  test('filterRooms method excludes already selected rooms', async ({ page }) => {
    // Start a new booking
    const btn = page.getByTestId('new_booking_btn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByTestId('book_property_sheet')).toBeVisible();

    // Select dates and check availability
    const date_picker = page.getByTestId('date_picker');
    date_picker.click();
    await selectAdultAndChildren({ page });
    await selectDates({ fromDate: payload.check_availability.from_date, toDate: payload.check_availability.to_date, page });
    await checkAvailability({ page, mode: 'plus' });

    // Book rooms for multiple guests with different rate plans
    await bookRooms({ page, mode: 'plus' });
    await page.getByText('Next').click();

    // Get all application info components
    const applicationInfos = await page.locator('igl-application-info').all();

    // Find the rate plan that has multiple guests (we know it's the first rate plan)
    const targetRatePlanId = payload.booking.guests[0].rp_id;

    // Get all application info components for this rate plan
    const targetAppInfos: Locator[] = [];
    const targetIndices: number[] = [];

    for (let i = 0; i < payload.booking.guests.length; i++) {
      if (payload.booking.guests[i].rp_id === targetRatePlanId) {
        targetAppInfos.push(applicationInfos[i]);
        targetIndices.push(i);
      }
    }

    // We need at least 2 guests with the same rate plan
    if (targetAppInfos.length >= 2) {
      // Fill in guest information for all guests with this rate plan
      for (let i = 0; i < targetIndices.length; i++) {
        const index = targetIndices[i];
        const guest = payload.booking.guests[index];
        const appInfo = applicationInfos[index];

        await appInfo.getByTestId('guest_first_name').fill(guest.first_name);
        await appInfo.getByTestId('guest_last_name').fill(guest.last_name);
      }

      // Get the room dropdown for the first guest
      const firstDropdown = targetAppInfos[0].locator('select[data-testid="unit"]');

      if (await firstDropdown.isVisible()) {
        // Get all available options before any selection
        const initialOptions = await firstDropdown.locator('option').all();
        const initialOptionCount = initialOptions.length;

        // Should have at least the placeholder option
        expect(initialOptionCount).toBeGreaterThan(0);

        if (initialOptionCount > 1) {
          // Get all room IDs available in the first dropdown
          const initialRoomIds: string[] = [];
          for (let i = 1; i < initialOptions.length; i++) {
            const value = await initialOptions[i].getAttribute('value');
            if (value) initialRoomIds.push(value);
          }

          // Select the first available room for the first guest
          await firstDropdown.selectOption({ index: 1 });

          // Get the selected room ID
          const selectedRoomId = await firstDropdown.evaluate(el => (el as HTMLSelectElement).value);

          // Now check the second guest's dropdown
          const secondDropdown = targetAppInfos[1].locator('select[data-testid="unit"]');

          if (await secondDropdown.isVisible()) {
            // Get all available options for the second guest
            const secondOptions = await secondDropdown.locator('option').all();
            const secondOptionCount = secondOptions.length;

            // The second dropdown should have one less option than the initial count
            // (minus the selected room)
            expect(secondOptionCount).toBe(initialOptionCount - 1);

            // The selected room should not be available in the second dropdown
            for (const option of secondOptions) {
              const value = await option.getAttribute('value');
              expect(value).not.toBe(selectedRoomId);
            }

            // If there are more available rooms, select one for the second guest
            if (secondOptionCount > 1) {
              await secondDropdown.selectOption({ index: 1 });

              // Get the selected room ID for the second guest
              const secondSelectedRoomId = await secondDropdown.evaluate(el => (el as HTMLSelectElement).value);

              // Verify the two selected rooms are different
              expect(secondSelectedRoomId).not.toBe(selectedRoomId);

              // If we have a third guest with the same rate plan, check their dropdown
              if (targetAppInfos.length >= 3) {
                const thirdDropdown = targetAppInfos[2].locator('select[data-testid="unit"]');

                if (await thirdDropdown.isVisible()) {
                  // Get all available options for the third guest
                  const thirdOptions = await thirdDropdown.locator('option').all();
                  const thirdOptionCount = thirdOptions.length;

                  // The third dropdown should have two less options than the initial count
                  // (minus both selected rooms)
                  expect(thirdOptionCount).toBe(initialOptionCount - 2);

                  // Neither of the selected rooms should be available in the third dropdown
                  for (const option of thirdOptions) {
                    const value = await option.getAttribute('value');
                    expect(value).not.toBe(selectedRoomId);
                    expect(value).not.toBe(secondSelectedRoomId);
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  test('all available rooms can be selected across multiple guests', async ({ page }) => {
    // Start a new booking
    const btn = page.getByTestId('new_booking_btn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByTestId('book_property_sheet')).toBeVisible();

    // Select dates and check availability
    const date_picker = page.getByTestId('date_picker');
    date_picker.click();
    await selectAdultAndChildren({ page });
    await selectDates({ fromDate: payload.check_availability.from_date, toDate: payload.check_availability.to_date, page });
    await checkAvailability({ page, mode: 'plus' });

    // Book rooms for multiple guests with different rate plans
    await bookRooms({ page, mode: 'plus' });
    await page.getByText('Next').click();

    // Get all application info components
    const applicationInfos = await page.locator('igl-application-info').all();

    // Find the rate plan that has multiple guests (we know it's the first rate plan)
    const targetRatePlanId = payload.booking.guests[0].rp_id;

    // Get all application info components for this rate plan
    const targetAppInfos: Locator[] = [];
    const targetIndices: number[] = [];

    for (let i = 0; i < payload.booking.guests.length; i++) {
      if (payload.booking.guests[i].rp_id === targetRatePlanId) {
        targetAppInfos.push(applicationInfos[i]);
        targetIndices.push(i);
      }
    }

    // We need at least 2 guests with the same rate plan
    if (targetAppInfos.length >= 2) {
      // Fill in guest information for all guests with this rate plan
      for (let i = 0; i < targetIndices.length; i++) {
        const index = targetIndices[i];
        const guest = payload.booking.guests[index];
        const appInfo = applicationInfos[index];

        await appInfo.getByTestId('guest_first_name').fill(guest.first_name);
        await appInfo.getByTestId('guest_last_name').fill(guest.last_name);
      }

      // Get the room dropdown for the first guest
      const firstDropdown = targetAppInfos[0].locator('select[data-testid="unit"]');

      if (await firstDropdown.isVisible()) {
        // Get all available options before any selection
        const initialOptions = await firstDropdown.locator('option').all();
        const initialOptionCount = initialOptions.length;

        // Should have at least the placeholder option
        expect(initialOptionCount).toBeGreaterThan(0);

        // If we have exactly enough rooms for all guests
        if (initialOptionCount > 1 && initialOptionCount - 1 === targetAppInfos.length) {
          // Select rooms for each guest
          for (let i = 0; i < targetAppInfos.length; i++) {
            const dropdown = targetAppInfos[i].locator('select[data-testid="unit"]');

            if (await dropdown.isVisible()) {
              // There should be exactly one option available (plus the placeholder)
              const options = await dropdown.locator('option').all();

              // The number of options should decrease with each selection
              // First guest has all options, second has one less, etc.
              expect(options.length).toBe(initialOptionCount - i);

              if (options.length > 1) {
                // Select the first available room
                await dropdown.selectOption({ index: 1 });

                // Verify the selection was successful
                const selectedValue = await dropdown.evaluate(el => (el as HTMLSelectElement).value);
                expect(selectedValue).not.toBe('');
              }
            }
          }

          // After selecting all rooms, verify that all dropdowns have a selected value
          for (let i = 0; i < targetAppInfos.length; i++) {
            const dropdown = targetAppInfos[i].locator('select[data-testid="unit"]');

            if (await dropdown.isVisible()) {
              const selectedValue = await dropdown.evaluate(el => (el as HTMLSelectElement).value);
              expect(selectedValue).not.toBe('');
            }
          }

          // Verify that all selected rooms are different
          const selectedRooms: string[] = [];
          for (let i = 0; i < targetAppInfos.length; i++) {
            const dropdown = targetAppInfos[i].locator('select[data-testid="unit"]');

            if (await dropdown.isVisible()) {
              const selectedValue = await dropdown.evaluate(el => (el as HTMLSelectElement).value);
              if (selectedValue) {
                // Each room should be unique
                expect(selectedRooms).not.toContain(selectedValue);
                selectedRooms.push(selectedValue);
              }
            }
          }

          // The number of selected rooms should match the number of guests
          expect(selectedRooms.length).toBe(targetAppInfos.length);
        }
      }
    }
  });
});

async function bookRooms({ page, mode }: { page: Page; mode: BookingMode }) {
  const { guests } = payload.booking;

  // Group guests by rate plan ID to count how many rooms we need for each rate plan
  const guestCountByRatePlan = {};
  guests.forEach(guest => {
    guestCountByRatePlan[guest.rp_id] = (guestCountByRatePlan[guest.rp_id] || 0) + 1;
  });

  switch (mode) {
    case 'plus':
      // For each unique rate plan, select the appropriate number of rooms
      for (const ratePlanId in guestCountByRatePlan) {
        const count = guestCountByRatePlan[ratePlanId];
        const ratePlan = page.getByTestId(`rp-${ratePlanId}`);
        await expect(ratePlan).toBeVisible();
        await ratePlan.getByTestId('inventory_select').selectOption({ index: count });
        await expect(ratePlan.getByTestId('inventory_select')).toHaveValue(count.toString());
      }
      break;
    case 'bar':
      // For bar booking, we just need to click the book button for each rate plan
      const uniqueRatePlans = [...new Set(guests.map(g => g.rp_id))];
      for (const ratePlanId of uniqueRatePlans) {
        const ratePlan = page.getByTestId(`rp-${ratePlanId}`);
        await expect(ratePlan).toBeVisible();
        await ratePlan.getByTestId('book').click();
      }
      break;
    case 'edit':
      // Handle edit mode if needed
      break;
  }
}
async function selectAdultAndChildren({ page }: { page: Page }) {
  const adult_dropdown = page.getByTestId('adult_number');
  adult_dropdown.selectOption({ label: payload.check_availability.adult_nbr });
  await expect(adult_dropdown).toHaveValue(payload.check_availability.adult_nbr?.toString());

  if (payload.check_availability.child_nbr > 0) {
    const children_dropdown = page.getByTestId('child_number');
    children_dropdown.selectOption({ label: payload.check_availability.child_nbr.toString() });
    await expect(children_dropdown).toHaveValue(payload.check_availability.child_nbr?.toString());
  }
}

export async function testRooms({ availabilityResponse, page, mode }: { availabilityResponse: RoomType[]; page: Page; mode: BookingMode }) {
  for (const room of availabilityResponse) {
    const roomLocator = page.getByTestId(`room_type_${room.id}`);
    await expect(roomLocator).toBeVisible();

    //Get all rateplans and check if they all of them are rendered
    const ratePlanLocators = await roomLocator.locator('igl-rate-plan').all();
    expect(ratePlanLocators.length).toBe(room.rateplans.length);

    if (!room.is_available_to_book) {
      for (const rpLocator of ratePlanLocators) {
        await expect(rpLocator).toContainText('Not available');
      }
    } else {
      for (const ratePlan of room.rateplans) {
        const rpLocator = roomLocator.getByTestId(`rp-${ratePlan.id}`);
        await expect(rpLocator).toBeVisible();
        if (!ratePlan.is_available_to_book) {
          await expect(rpLocator).toContainText('Not available');
        } else {
          if (ratePlan.variations) {
            const baseVariation =
              ratePlan.variations.find(v => v.adult_nbr === Number(payload.check_availability.adult_nbr) && v.child_nbr === payload.check_availability.child_nbr) ??
              ratePlan.variations[ratePlan.variations?.length - 1];
            const formattedVariation = formatVariation(baseVariation);
            await changeRPVariation({ ratePlan, locator: rpLocator, option: formattedVariation, mode: 'check' });
            for (const v of ratePlan.variations) {
              await changeRPVariation({ ratePlan, locator: rpLocator, option: formatVariation(v) });
            }
            await changeRPVariation({ ratePlan, locator: rpLocator, option: formattedVariation });
            await changeRPVariation({ ratePlan, locator: rpLocator, option: formattedVariation, mode: 'check' });
          }
          if (mode === 'plus') {
            const inventorySelect = rpLocator.getByTestId('inventory_select');
            await expect(inventorySelect).toBeVisible();

            const optionsCount = await inventorySelect.locator('option').count();
            expect(optionsCount).toBe(room.inventory + 1);
          }
        }
      }
    }
  }
}

async function fillMainGuest({ page }: { page: Page }) {
  const mainGuest = payload.booking.main_guest;
  await page.getByTestId('main_guest_email').pressSequentially(mainGuest.email, { delay: 300 });
  const fetchedGuestInfoResponse = await page.waitForResponse(resp => {
    if (resp.url().includes('Fetch_Exposed_Guests') && resp.request().method() === 'POST') {
      const postData = resp.request().postData();
      try {
        if (!postData) {
          return false;
        }
        const requestData = JSON.parse(postData);
        return requestData.email && requestData.email.toLowerCase() === mainGuest.email.toLowerCase();
      } catch (error) {
        return false;
      }
    }
    return false;
  });
  const selectedUser = (await fetchedGuestInfoResponse.json()).My_Result?.find(u => u.email.toLowerCase() === mainGuest.email.toLowerCase());

  const drpdownMail = page.locator(`//p[@role="button" and contains(@class, 'dropdown-item') and .//p[contains(., '${mainGuest.email}')]]`).nth(0);
  await expect(drpdownMail).toBeVisible();
  await drpdownMail.click();
  await expect(page.getByTestId('main_guest_first_name')).toHaveValue(selectedUser.first_name);
  await expect(page.getByTestId('main_guest_last_name')).toHaveValue(selectedUser.last_name);
  await expect(page.getByTestId('main_guest_phone')).toHaveValue(selectedUser.mobile_without_prefix);
  // const countryPicker = page.locator("ir-country-picker");
  // await countryPicker.click();
  // await page.locator(`//button[contains(@class, 'dropdown-item')][.//p[text()='American Samoa']]`).click()
}
async function validateGuestsRooms({ page, mode }: { page: Page; mode: BookingMode }) {
  const iglApplicationInfos = await page.locator('igl-application-info').all();

  // Check if we have the correct number of application info components
  if (mode === 'bar') {
    expect(iglApplicationInfos.length).toBe(payload.booking.guests.length);
    if (allGuestsInSameRoom) {
      const selectedRt = AvailabilityResults.find(rt => !!rt.rateplans.map(rp => rp.id === payload.booking.guests[0].rp_id));
      if (!selectedRt) {
        return false;
      }
      const selectedRp = selectedRt.rateplans.find(rp => rp.id === payload.booking.guests[0].rp_id);
      if (!selectedRp) {
        return false;
      }
      for (let i = 0; i < iglApplicationInfos.length; i++) {
        await expect(iglApplicationInfos[i].locator('.rate_amount')).toContainText(selectedRp.variations[selectedRp.variations.length - 1].discounted_gross_amount.toString());
      }
    }
    return;
  }

  // For plus or edit booking modes
  expect(iglApplicationInfos.length).toBe(payload.booking.guests.length);

  // Group guests by rate plan ID
  const guestsByRatePlan = {};
  payload.booking.guests.forEach(guest => {
    if (!guestsByRatePlan[guest.rp_id]) {
      guestsByRatePlan[guest.rp_id] = [];
    }
    guestsByRatePlan[guest.rp_id].push(guest);
  });

  // Test room assignment dropdown for each application info component
  for (let i = 0; i < iglApplicationInfos.length; i++) {
    const appInfo = iglApplicationInfos[i];
    const guest = payload.booking.guests[i];
    const ratePlanId = guest.rp_id;

    // Find the room type for this rate plan
    const roomType = AvailabilityResults.find(rt => rt.rateplans.some(rp => rp.id === ratePlanId));
    if (!roomType) continue;

    // Find the rate plan
    const ratePlan = roomType.rateplans.find(rp => rp.id === ratePlanId);
    if (!ratePlan) continue;

    // Check if room dropdown exists (should exist if is_frontdesk_enabled and not a single unit)
    const roomDropdown = appInfo.locator('select[data-testid="unit"]');
    const isDropdownVisible = await roomDropdown.isVisible();

    if (isDropdownVisible) {
      // Get all available rooms in the dropdown
      const roomOptions = await roomDropdown.locator('option').all();
      const roomOptionCount = roomOptions.length;

      // Should have at least one option (the placeholder) plus available rooms
      expect(roomOptionCount).toBeGreaterThan(0);

      // Check if assignable units are available in the dropdown
      if (ratePlan.assignable_units && ratePlan.assignable_units.length > 0) {
        // Count fully available units
        const fullyAvailableUnits = ratePlan.assignable_units.filter(unit => unit.Is_Fully_Available);

        // The dropdown should have options for each available unit plus the placeholder
        // But we need to account for units already selected by other guests with the same rate plan
        const expectedOptionCount =
          1 + fullyAvailableUnits.length - (guestsByRatePlan[ratePlanId].findIndex(g => g === guest) > 0 ? guestsByRatePlan[ratePlanId].findIndex(g => g === guest) : 0);

        expect(roomOptionCount).toBeLessThanOrEqual(expectedOptionCount);

        // Test selecting a room
        if (roomOptionCount > 1) {
          // Select the first available room
          await roomDropdown.selectOption({ index: 1 });

          // Get the selected room ID
          const selectedRoomId = await roomDropdown.evaluate(el => (el as HTMLSelectElement).value);

          // Now check that this room is not available in other dropdowns for the same rate plan
          for (let j = i + 1; j < iglApplicationInfos.length; j++) {
            const otherGuest = payload.booking.guests[j];
            if (otherGuest.rp_id === ratePlanId) {
              const otherDropdown = iglApplicationInfos[j].locator('select[data-testid="unit"]');
              if (await otherDropdown.isVisible()) {
                const otherOptions = await otherDropdown.locator('option').all();
                for (const option of otherOptions) {
                  const optionValue = await option.getAttribute('value');
                  if (optionValue === selectedRoomId) {
                    const isDisabled = await option.isDisabled();
                    expect(isDisabled).toBe(true);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Verify the rate amount is displayed correctly
    const variation = ratePlan.variations[ratePlan.variations.length - 1];
    await expect(appInfo.locator('.rate_amount')).toContainText(variation.discounted_gross_amount.toString());
  }
}
async function changeRPVariation({ locator, mode = 'update', ratePlan, option }: { locator: Locator; mode?: 'check' | 'update'; ratePlan: RatePlan; option: string }) {
  const adultChildOfferingSelect = locator.getByTestId('adult-child-offering');
  const value = await adultChildOfferingSelect.inputValue();
  if (mode === 'check') {
    await expect(adultChildOfferingSelect).toHaveValue(option);
    const offering_result = ratePlan.variations.find(v => formatVariation(v) === value);
    if (offering_result) {
      await expect(locator.getByTestId('amount_input')).toHaveValue(offering_result.discounted_amount.toString());
    }
  } else {
    await adultChildOfferingSelect.selectOption({ label: option });
    const adValue = await adultChildOfferingSelect.inputValue();
    const offering_result = ratePlan.variations.find(v => formatVariation(v) === adValue);
    if (offering_result) {
      await expect(locator.getByTestId('amount_input')).toHaveValue(offering_result.discounted_amount.toString());
    }
  }
}

async function fillGuestsRooms({ guests, page }: { guests: Guest[]; page: Page }) {
  await expect(page.locator('igl-booking-form')).toBeVisible();

  const roomsInfo = await page.locator('igl-application-info').all();
  expect(roomsInfo.length).toBe(guests.length);

  for (let i = 0; i < roomsInfo.length; i++) {
    const room = roomsInfo[i];
    const guest = guests[i];

    await expect(room.getByTestId('guest_first_name')).toBeVisible();
    await room.getByTestId('guest_first_name').fill(guest.first_name);
    await expect(room.getByTestId('guest_first_name')).toHaveValue(guest.first_name);

    await room.getByTestId('guest_last_name').fill(guest.last_name);
    await expect(room.getByTestId('guest_last_name')).toHaveValue(guest.last_name);

    if (guest.unit) {
      await room.getByTestId('unit').selectOption({ label: guest.unit });
    }

    if (guest.bed_configuration) {
      await room.getByTestId('bed_configuration').selectOption({ value: guest.bed_configuration.toString() });
    }
  }
}

async function selectDates({ fromDate, toDate, page }: { fromDate: string; toDate: string; page: Page }) {
  const datePickerCalendar = page.locator('.daterangepicker');
  await expect(datePickerCalendar).toBeVisible();

  const calMonths = datePickerCalendar.locator('.month');
  const prevBtn = datePickerCalendar.locator('.prev');
  const nextBtn = datePickerCalendar.locator('.next');

  const fromDateLabel = moment(fromDate, 'YYYY-MM-DD').format('MMMM YYYY');
  const toDateLabel = moment(toDate, 'YYYY-MM-DD').format('MMMM YYYY');

  while ((await calMonths.nth(0).textContent()) !== fromDateLabel) {
    if (moment(fromDateLabel, 'MMMM YYYY').isBefore(moment(await calMonths.nth(0).textContent(), 'MMMM YYYY'), 'months')) {
      await prevBtn.click();
    } else {
      await nextBtn.click();
    }
  }
  await page.locator(`//div[contains(@class, 'drp-calendar left')]//td[@class='available' and text()=${moment(fromDate, 'YYYY-MM-DD').date().toString()}]`).click();

  while ((await calMonths.nth(1).textContent()) !== toDateLabel) {
    if (moment(toDateLabel, 'MMMM YYYY').isBefore(moment(await calMonths.nth(1).textContent(), 'MMMM YYYY'), 'months')) {
      await prevBtn.click();
    } else {
      await nextBtn.click();
    }
  }
  await page.locator(`//div[contains(@class, 'drp-calendar right')]//td[@class='available' and text()=${moment(toDate, 'YYYY-MM-DD').date().toString()}]`).click();

  await expect(datePickerCalendar).toBeHidden();

  await expect(page.locator("(//span[@class='sc-igl-date-range'])[1]")).toHaveText(moment(fromDate, 'YYYY-MM-DD').format('MMM DD, YYYY'));
  await expect(page.locator("(//span[@class='sc-igl-date-range'])[2]")).toHaveText(moment(toDate, 'YYYY-MM-DD').format('MMM DD, YYYY'));
}

async function checkAvailability({ page, mode }: { page: Page; mode: BookingMode }) {
  let availabilityResponse: RoomType[] = [];
  const [checkAvailabilityResponse] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('Check_Availability') && resp.request().method() === 'POST'),
    page.getByText('Check').click(),
  ]);

  const res = await checkAvailabilityResponse.json();
  availabilityResponse = res.My_Result;
  AvailabilityResults = availabilityResponse;
  if (availabilityResponse.length > 0) await testRooms({ availabilityResponse, page, mode });
}

//HELPER FUNCTIONS
function formatVariation(variation): string {
  if (!variation) return '';
  const adults = `${variation.adult_nbr} ${variation.adult_nbr === 1 ? 'adult' : 'adults'}`;
  const children = variation.child_nbr > 0 ? `${variation.child_nbr} ${variation.child_nbr > 1 ? 'children' : 'child'}` : '';
  return children ? `${adults} ${children}` : adults;
}

async function testRoomSelectionForMultipleGuests({ page, guests }: { page: Page; guests: Guest[] }) {
  await expect(page.locator('igl-booking-form')).toBeVisible();

  // Get all application info components
  const applicationInfos = await page.locator('igl-application-info').all();
  expect(applicationInfos.length).toBe(guests.length);

  // Group guests by rate plan
  const guestsByRatePlan = {};
  guests.forEach(guest => {
    if (!guestsByRatePlan[guest.rp_id]) {
      guestsByRatePlan[guest.rp_id] = [];
    }
    guestsByRatePlan[guest.rp_id].push(guest);
  });

  // For each application info component
  for (let i = 0; i < applicationInfos.length; i++) {
    const appInfo = applicationInfos[i];
    const guest = guests[i];

    // Fill in guest name
    await appInfo.getByTestId('guest_first_name').fill(guest.first_name);
    await appInfo.getByTestId('guest_last_name').fill(guest.last_name);

    // Check if room dropdown exists
    const roomDropdown = appInfo.locator('select[data-testid="unit"]');
    const isRoomDropdownVisible = await roomDropdown.isVisible();

    if (isRoomDropdownVisible) {
      // Get all available options
      const options = await roomDropdown.locator('option').all();
      const optionCount = options.length;

      // Should have at least the placeholder option
      expect(optionCount).toBeGreaterThan(0);

      if (optionCount > 1) {
        // Select the first available room
        await roomDropdown.selectOption({ index: 1 });

        // Get the selected room ID
        const selectedRoomId = await roomDropdown.evaluate(el => (el as HTMLSelectElement).value);

        // For guests with the same rate plan, verify this room is no longer available
        for (let j = i + 1; j < applicationInfos.length; j++) {
          const nextGuest = guests[j];

          // Only check guests with the same rate plan
          if (nextGuest.rp_id === guest.rp_id) {
            const nextRoomDropdown = applicationInfos[j].locator('select[data-testid="unit"]');

            if (await nextRoomDropdown.isVisible()) {
              // Check all options in the next dropdown
              const nextOptions = await nextRoomDropdown.locator('option').all();

              // Verify the selected room is not available or is disabled
              for (const option of nextOptions) {
                const optionValue = await option.getAttribute('value');

                if (optionValue === selectedRoomId) {
                  // The option should either be disabled or not present
                  const isDisabled = await option.isDisabled();
                  expect(isDisabled).toBe(true);
                }
              }
            }
          }
        }
      }
    }
  }

  // Verify that all required fields are filled
  for (let i = 0; i < applicationInfos.length; i++) {
    const appInfo = applicationInfos[i];

    // Verify guest names are filled
    await expect(appInfo.getByTestId('guest_first_name')).not.toBeEmpty();
    await expect(appInfo.getByTestId('guest_last_name')).not.toBeEmpty();

    // If room selection is required, verify it's selected
    const roomDropdown = appInfo.locator('select[data-testid="unit"]');
    if (await roomDropdown.isVisible()) {
      const isRequired = await roomDropdown.evaluate(el => el.hasAttribute('required'));

      if (isRequired) {
        await expect(roomDropdown).not.toHaveValue('');
      }
    }
  }
}
