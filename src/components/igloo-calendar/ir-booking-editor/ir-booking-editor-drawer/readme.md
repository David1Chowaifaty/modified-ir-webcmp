# ir-booking-editor-drawer



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                    | Type                                                                                                                                                                    | Default          |
| ---------------- | ----------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `blockedUnit`    | --                | Payload for blocked unit dates.                | `{ RELEASE_AFTER_HOURS: string; ENTRY_DATE: string; ENTRY_HOUR: number; ENTRY_MINUTE: number; OPTIONAL_REASON: string; STATUS_CODE: string; OUT_OF_SERVICE: boolean; }` | `undefined`      |
| `booking`        | --                | Booking being created or edited.               | `Booking`                                                                                                                                                               | `undefined`      |
| `checkIn`        | `check-in`        | Check-in date (ISO string).                    | `string`                                                                                                                                                                | `undefined`      |
| `checkOut`       | `check-out`       | Check-out date (ISO string).                   | `string`                                                                                                                                                                | `undefined`      |
| `label`          | `label`           | Optional drawer title override.                | `string`                                                                                                                                                                | `undefined`      |
| `language`       | `language`        | UI language code (default: `en`).              | `string`                                                                                                                                                                | `'en'`           |
| `mode`           | `mode`            | Current booking editor mode.                   | `"ADD_ROOM" \| "BAR_BOOKING" \| "EDIT_BOOKING" \| "PLUS_BOOKING" \| "SPLIT_BOOKING"`                                                                                    | `'PLUS_BOOKING'` |
| `open`           | `open`            | Controls drawer visibility (reflected to DOM). | `boolean`                                                                                                                                                               | `undefined`      |
| `propertyid`     | `propertyid`      | Property identifier.                           | `string`                                                                                                                                                                | `undefined`      |
| `roomIdentifier` | `room-identifier` | Room identifier used by the editor.            | `string`                                                                                                                                                                | `undefined`      |
| `roomTypeIds`    | --                | Allowed room type identifiers.                 | `(string \| number)[]`                                                                                                                                                  | `[]`             |
| `ticket`         | `ticket`          | Auth token used for API requests.              | `string`                                                                                                                                                                | `undefined`      |
| `unitId`         | `unit-id`         | Selected unit identifier.                      | `string`                                                                                                                                                                | `undefined`      |


## Events

| Event                 | Description                                       | Type                |
| --------------------- | ------------------------------------------------- | ------------------- |
| `bookingEditorClosed` | Emitted when the booking editor drawer is closed. | `CustomEvent<void>` |


## Dependencies

### Used by

 - [igloo-calendar](../..)
 - [ir-booking-details](../../../ir-booking-details)

### Depends on

- [ir-custom-button](../../../ui/ir-custom-button)
- [ir-drawer](../../../ir-drawer)
- [ir-booking-editor](..)

### Graph
```mermaid
graph TD;
  ir-booking-editor-drawer --> ir-custom-button
  ir-booking-editor-drawer --> ir-drawer
  ir-booking-editor-drawer --> ir-booking-editor
  ir-booking-editor --> ir-spinner
  ir-booking-editor --> ir-interceptor
  ir-booking-editor --> ir-booking-editor-header
  ir-booking-editor --> igl-room-type
  ir-booking-editor --> ir-booking-editor-form
  ir-interceptor --> ir-spinner
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-booking-editor-header --> ir-validator
  ir-booking-editor-header --> ir-picker
  ir-booking-editor-header --> ir-picker-item
  ir-booking-editor-header --> igl-date-range
  ir-booking-editor-header --> ir-custom-button
  igl-date-range --> ir-custom-date-picker
  ir-custom-date-picker --> ir-input
  igl-room-type --> igl-rate-plan
  igl-rate-plan --> ir-input
  igl-rate-plan --> ir-custom-button
  ir-booking-editor-form --> ir-date-view
  ir-booking-editor-form --> igl-application-info
  ir-booking-editor-form --> ir-picker
  ir-booking-editor-form --> ir-picker-item
  ir-booking-editor-form --> ir-custom-button
  ir-booking-editor-form --> ir-booking-editor-guest-form
  igl-application-info --> ir-validator
  igl-application-info --> ir-input
  ir-booking-editor-guest-form --> ir-input
  ir-booking-editor-guest-form --> ir-validator
  ir-booking-editor-guest-form --> ir-country-picker
  ir-booking-editor-guest-form --> ir-mobile-input
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  ir-mobile-input --> ir-input
  igloo-calendar --> ir-booking-editor-drawer
  ir-booking-details --> ir-booking-editor-drawer
  style ir-booking-editor-drawer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
