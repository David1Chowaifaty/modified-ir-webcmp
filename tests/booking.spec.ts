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
  unit?: string;
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
});

async function bookRooms({ page, mode }: { page: Page; mode: BookingMode }) {
  const { guests } = payload.booking;
  switch (mode) {
    case 'plus':
      if (guests.every(g => g.rp_id === guests[0].rp_id)) {
        const ratePlan = page.getByTestId(`rp-${guests[0].rp_id}`);
        await expect(ratePlan).toBeVisible();
        await ratePlan.getByTestId('inventory_select').selectOption({ index: guests.length });
        await expect(ratePlan.getByTestId('inventory_select')).toHaveValue(guests.length.toString());
      } else {
        for (const guest of guests) {
          const ratePlan = page.getByTestId(`rp-${guest.rp_id}`);
          await expect(ratePlan).toBeVisible();
          await ratePlan.getByTestId('inventory_select').selectOption({ index: 1 });
          await expect(ratePlan.getByTestId('inventory_select')).toHaveValue('1');
        }
      }
      break;
    case 'bar':
      const ratePlan = page.getByTestId(`rp-${guests[0].rp_id}`);
      await expect(ratePlan).toBeVisible();
      await ratePlan.getByTestId('book').click();
      break;
    case 'edit':
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

  const roomsInfo = await page.getByTestId('room_info').all();
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
