# igl-to-be-assigned requirements

## Purpose
The `igl-to-be-assigned` component (`src/components/igloo-calendar/igl-to-be-assigned/igl-to-be-assigned.tsx`) is the right-hand assignment panel of the Igloo calendar. It shows every date that still has bookings awaiting unit assignment, lets the user inspect the bookings grouped by room type, and triggers downstream flows (highlighting, booking popups, and assignment actions).

## Inputs and Dependencies
- **Props:**
  - `unassignedDatesProp`: external push of unassigned-date data covering a date range. Used to reconcile the local cache when other parts of the app assign/clear units.
  - `propertyid`, `from_date`, `to_date`: contextual filters that scope API calls for unassigned inventory.
  - `calendarData`: mutable prop containing the main calendar payload (room definitions, roomsInfo, legend data). The component updates it when assignment actions return fresh data.
- **Services/Stores:**
  - `ToBeAssignedService`: fetches missing per-date room/category data on demand.
  - `getUnassignedDates()` store: shared cache of unassigned dates populated elsewhere; acts as the component’s baseline dataset.
  - `locales.entries`: provides localized UI strings.

## State & Derived Structures
- `data`: working copy of unassigned-date records keyed by midnight timestamp (`{ categories, dateStr }`).
- `orderedDatesList`: sorted timestamps to drive date dropdown and navigation order.
- `selectedDate`: currently focused timestamp; `null` when nothing is available.
- `showDatesList`, `noScroll`, `isGotoToBeAssignedDate`, `isLoading`: control UI affordances and async UX.
- `categoriesData`: metadata extracted from `calendarData.roomsInfo` for child components.
- `loadingMessage`: defaults to "Fetching unassigned units" (localized) and can later be reused for alternative copy if needed.

## Lifecycle and Synchronization
1. **`componentWillLoad`**
   - Calls `reArrangeData()` to pull the current shared store snapshot, normalize categories metadata, and seed `selectedDate`.
   - Sets the initial loading copy.
2. **`componentDidLoad`**
   - After a short delay, auto-selects the first available date (unless an external goto request is in progress) so the user immediately sees actionable content.
3. **`@Watch('unassignedDatesProp')`**
   - Responds to batched changes by iterating each day in the provided `[fromDate, toDate]` interval.
   - Removes dates that no longer have pending assignments and updates those with new details.
   - Ensures `selectedDate` still exists and re-renders the corresponding categories by calling `showForDate`.

## Interaction Flows
- **Assignment handling (`handleAssignUnit`)**
  - Triggers when children fire `assignUnit`. It guards against stale references before mutating local state.
  - When the last category for a date is being processed, sets `isLoading` and `noScroll` before the next refresh to avoid flickers.
  - Filters out the just-assigned booking from the relevant category list and replaces `calendarData` if newer data is supplied.
  - Forces a re-render so any empty-state messaging can show immediately.
- **Category hydration (`showForDate` + `updateCategories`)**
  - `showForDate` sets UX flags, optionally closes the date-picker, fetches per-category booking lists for that date, and notifies the rest of the app (via `addToBeAssignedEvent` + `showBookingPopup`).
  - `updateCategories` requests `/Get_Aggregated_UnAssigned_Rooms`, groups rooms by `RT_ID`, and attaches them to `this.unassignedDates[date]`. The parent ensures `calendarData` supplies `roomsInfo` and `formattedLegendData` so that each booking carries enough metadata for downstream components.
- **Navigation**
  - `gotoToBeAssignedDate` listener sets `isGotoToBeAssignedDate`, selects the requested timestamp, and collapses the dropdown.
  - Selecting a date from the dropdown simply calls `showForDate` with that timestamp.
- **Event Bus Integration**
  - Emits `optionEvent` for actions such as closing the side menu.
  - Emits `showBookingPopup`, `addToBeAssignedEvent`, and `highlightToBeAssignedBookingEvent` to synchronize the rest of the calendar UI.

## Rendering and UX States
- Sticky header always displays the title, close button, and a dropdown list of dates (hidden when empty).
- Loading state displays a three-dot animation alongside the localized fetching message whenever `isLoading` is true.
- Empty states:
  - No unassigned data at all → "All bookings are assigned" message.
  - Selected date has no remaining categories → "All assignments for this day" message.
- Once data is available, the content area renders one `igl-tba-category-view` per room type for the selected date, supplying calendar context, category metadata, and an event handler for assignment actions.

## Edge Cases & Defensive Logic
1. **Missing or removed dates**: When incoming data removes a date, the watcher deletes the entry and revalidates `selectedDate`, preventing stale selections (`handleUnassignedDatesToBeAssignedChange`).
2. **Null-safe assignment updates**: `handleAssignUnit` checks every nested property (`categories`, `data.RT_ID`, `assignEvent.ID`) before filtering arrays, avoiding runtime errors when events arrive out of order.
3. **Single-category throttling**: If a date only has one category left, assignment triggers `isLoading` + `noScroll` to freeze the UI while the backend refresh propagates, ensuring the dropdown does not auto-scroll away from the pending date.
4. **Dropdown visibility & selection**: `showForDate` hides the dropdown if it was open, resets `isGotoToBeAssignedDate`, and only updates `selectedDate` after data fetching succeeds, so users never see a date selected without its category data.
5. **Graceful empty states**: Every render branch guards against missing `data[this.selectedDate]` or empty category maps before attempting to iterate, preventing React/StenciI runtime errors and surfacing user-friendly copy.
6. **Time normalization**: All timestamps are normalized to midnight to avoid off-by-one issues when comparing dates from different time zones (`reArrangeData`, `handleUnassignedDatesToBeAssignedChange`, and the service converter).
7. **External highlight requests**: `handleToBeAssignedDate` subtracts one day (`86400000` ms) before emitting to align with the calendar grid that expects the day prior, ensuring highlights land on the intended cell even if target components offset dates differently.

## Required Supporting Data
- `calendarData.roomsInfo` must contain each room type, its name, id, and associated physical rooms so that `categoriesData` can populate child components.
- `calendarData.formattedLegendData` is necessary because `updateCategories` injects it into each booking’s payload for consistent badge styling.
- The shared `unassigned_dates` store should already be populated (e.g., during calendar bootstrap). If it is empty, the component shows only the empty-state copy until data arrives via props or store mutations.

## Failure Handling Expectations
- Service calls log to `console.error` but do not surface toast notifications inside this component; upstream callers should handle user-visible error messaging.
- When any async call fails, the component simply leaves `isLoading` true until further updates arrive. Future enhancements may include retry affordances or explicit error states.
