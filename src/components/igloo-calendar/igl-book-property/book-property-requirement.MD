# igl-book-property Requirements

This document captures how `igl-book-property` must behave, which services and child components it orchestrates, and the edge cases that need to be handled across its view states.

## 1. Component Purpose

`igl-book-property` renders the booking sheet used for:

- Creating new bookings (BAR booking flow and default flow).
- Editing an existing booking.
- Adding rooms to an existing reservation.
- Split-booking operations.
- Blocking dates for exposed units.

The component coordinates data fetched from `BookingService`, shared state from `booking_store`, and multiple child components (`igl-booking-overview-page`, `igl-booking-form`, `igl-block-dates-view`, `igl-book-property-footer`, header/buttons). It maintains UI state for the sliding sheet, manages reservations, and reacts to global events (date selection, button presses).

## 2. Primary Workflows

### 2.1 Page One (Overview / Selection)

- Render `igl-booking-overview-page`:
  - Header portion handles source selection, split booking search, occupancy selectors, date pickers, and CTA controls.
  - Room list uses `booking_store.roomTypes` (populated by `checkBookingAvailability`) and renders `igl-room-type` rows, each able to emit room/guest selection data via `roomsDataUpdate`.
  - The header, overview page, and nested components rely on `booking_store.bookingDraft` for occupancy, source, etc. They must respect adult/child constraints passed down.

### 2.2 Page Two (Form)

- Rendered via `igl-booking-form`, which captures payment/guest details. Receives:
  - `selectedGuestData`, `selectedRooms`, `bedPreferenceType`, `countries`, `bookedByInfoData`, etc.
  - `onDataUpdateEvent` is used to pass updates back; the parent distinguishes between property booked-by info and room guests.
  - Edit/add-room events set `isEditOrAddRoomEvent` so the form can lock or default fields accordingly.

### 2.3 Block Dates Page

- `igl-block-dates-view` renders when `event_type === 'BLOCK_DATES'`.
- Form data is collected via `handleBlockDateUpdate`, then `handleBlockDate` submits via `bookingService.blockUnit`.
- When closing the modal without completing a reservation for an initially blocked unit, `checkAndBlockDate` re-validates inventory to reapply the block if necessary.

### 2.4 Footer

- `igl-book-property-footer` drives navigation, book/save/cancel buttons, and emits `buttonClicked`.
- Buttons respect `isLoading` state to show spinners.
- In block-date mode, simple `<ir-button>`s are shown instead of the footer component.

## 3. Booking Operations

### 3.1 Availability Checks

- Triggered by:
  - Date selection on header/date picker.
  - Explicit "check" button via `handleButtonClicked`.
  - `initializeEditBookingData` automatically checks availability for edit flow.
- `checkBookingAvailability` resets the shared store, computes request payload (dates, property, occupancy, currency, agent mode derived from booking source), and updates `defaultData.roomsInfo`.
- When editing an existing booking, `room_type_ids_to_update` ensures only necessary room types refresh, and `updateBooking` rehydrates `booking_store` with the original guest/unit/reservation so page one reflects existing selections.

### 3.2 Booking/Submitting

- `bookUser(check_in: boolean)` handles save/book/book-and-check-in commands.
- Validations:
  - Booking guest info validated via `BookingGuestSchema`.
  - Each reserved guest in `booking_store.ratePlanSelections` validated via `RoomGuestSchema`. Errors from `zod` bubble up to the console (implementation should inform UI via toasts).
  - For split bookings, ensure a booking number is selected (`handleButtonClicked` on header).
  - For page-one "next" button, ensures occupancy has adults, rooms selected, rate plans chosen.
- After `BookingService.doReservation`, `adjustBlockedDatesAfterReservation` shortens/extends the original block if the new booking doesn’t cover original blocked range.
- On success: emit `resetBookingEvt`, call `resetLoadingState` (clears loading state and closes sheet after short delay).
- On failure: `isLoading` reset, log error, optionally surface via `toast`.

### 3.3 Close Window

- Triggered from cancel/back or overlay click.
- Resets booking store, unlocks body scroll, re-applies blocked dates for units if necessary, animates `.sideWindow` out, and emits `closeBookingWindow` after 300ms.
- Escape key also calls `closeWindow`.

## 4. Edge Cases

1. **Split Booking**

   - `showSplitBookingOption` toggled when `event_type === 'SPLIT_BOOKING'`.
   - Header uses async picker to fetch exposures; `spiltBookingSelected` populates `defaultData.booking`.
   - `inputCleared` resets the UI when the stored booking number is cleared.
   - Must block navigation until booking number selected (header toast).
   - `gotoSplitPageTwoEvent` transitions to form view once rooms selected.

2. **Edit Booking (`EDIT_BOOKING`)**

   - Pre-populate occupancy counts and `booking_store.guest`.
   - `initialRoomIds` used so `igl-room-type` can highlight the original room/rate plan.
   - `checkBookingAvailability` updates only necessary room type, and `updateBooking` reserves the previously selected room.
   - `handleButtonClicked('back')` should reset reserved rooms via `resetReserved`.

3. **Add Room (`ADD_ROOM`)**

   - Similar to edit booking but may use default date ranges derived from booking.
   - Guest data stored with `roomId` when referencing blocked units or split bookings.

4. **BAR Booking (`BAR_BOOKING`)**

   - Source dropdown filtered to agent-only options when all available rate plans require an agent.
   - `resetRoomsInfoAndMessage` skipped so initial `roomsInfo` persists until occupancy selection triggers `checkBookingAvailability`.

5. **Blocked Units**

   - `wasBlockedUnit` when `bookingData` contains `block_exposed_unit_props`.
   - On close without reservation, `checkAndBlockDate` ensures the original block is reapplied if inventory still permits.
   - After successful reservation, `adjustBlockedDatesAfterReservation` trims the original block to cover unused ranges.

6. **Date changes**

   - `dateSelectEvent` resets the booking store and logs history.
   - For add room/split booking events, selecting new dates clears `defaultData.roomsInfo`.
   - Booking history retains last two entries for potential undo/analytics use.

7. **Keyboard / Overlay**

   - Escape closes sheet; clicking `.background-overlay` does the same.

8. **Loading states**

   - `isLoading` holds string keys used by footer buttons to show spinners and to disable interactions.
   - `isRequestPending` from interceptor store toggles inline spinners for setup entries and availability calls.

9. **Animations & Body Overflow**
   - `handleBodyOverflow(true/false)` toggles `overflow:hidden` on body.
   - `.sideWindow--exit` animation must run before the component emits `closeBookingWindow`.

## 5. Child Components & Contracts

| Component                                                                     | Responsibilities                                                                                                                                                                                                                                                                  | Key Props/Events                                                                                                                                                   |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `igl-book-property-header`                                                    | Displays title, booking number picker, source selector (`wa-select`), adult/child selectors with validation, date picker, CTA buttons. Emits `buttonClicked`, `checkClicked`, `spiltBookingSelected`, `toast`. Must honor `adultChildConstraints`, `minDate`, `bookedByInfoData`. | Receives `bookingData`, `defaultDaterange`, `dateRangeData`, `propertyId`, `showSplitBookingOption`, etc. Must call `setBookingDraft` on occupancy/source changes. |
| `igl-booking-overview-page`                                                   | Wraps header and room listing, shows spinners during availability checks, passes guest/room events upstream.                                                                                                                                                                      | Props: `bookingData`, `selectedRooms`, `currency`, `ratePricingMode`, `bookedByInfoData`, `initialRoomIds`. Emits `roomsDataUpdate`.                               |
| `igl-room-type` (nested inside overview page)                                 | Presents a single room type with rate plans, handles selecting rooms, storing guests per rate plan. Must emit `dataUpdateEvent` containing adjustments for parent to merge into `selectedUnits`.                                                                                  | Receives `roomType`, `currency`, `dateDifference`, etc.                                                                                                            |
| `igl-booking-form`                                                            | Page two layout capturing guest/contact/payment info. Handles `onDataUpdateEvent` to inform parent whether guest data or booking-by data changed. Should honor `isEditOrAddRoomEvent`, `bedPreferenceType`, `countries`, `defaultGuestData`.                                      |
| `igl-block-dates-view`                                                        | Form to gather block-date inputs (`RELEASE_AFTER_HOURS`, `OPTIONAL_REASON`, `OUT_OF_SERVICE`, etc.) and emits `dataUpdateEvent`. Works with `handleBlockDate`.                                                                                                                    |
| `igl-book-property-footer`                                                    | Renders navigation/booking buttons, reflecting `isLoading` states. Emits `buttonClicked`. Accepts `page`, `eventType`, `dateRangeData`, `isEditOrAddRoomEvent`.                                                                                                                   |
| Shared atoms (`ir-spinner`, `ir-custom-button`, `ir-button`, `wa-icon`, etc.) | Provide UI affordances. Their interfaces are standard and not customized by this parent, so no extra requirements beyond props used.                                                                                                                                              |

## 6. Validation & Error Handling

- Adult/child selectors wrap `ir-validator` + zod to enforce at least 1 adult.
- `RoomGuestSchema` and `BookingGuestSchema` enforce data integrity before posting.
- `animateIrSelect` and `animateIrButton` events highlight UI controls when the user attempts actions with missing prerequisites.
- Toast notifications must be emitted when:
  - user tries to continue without selecting rate plan,
  - split booking without booking number,
  - other validation failures from child components.
