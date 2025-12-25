# ir-booking-editor



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description | Type                                                                                                                                                                    | Default          |
| ------------- | ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `blockedUnit` | --            |             | `{ RELEASE_AFTER_HOURS: string; ENTRY_DATE: string; ENTRY_HOUR: number; ENTRY_MINUTE: number; OPTIONAL_REASON: string; STATUS_CODE: string; OUT_OF_SERVICE: boolean; }` | `undefined`      |
| `booking`     | --            |             | `Booking`                                                                                                                                                               | `undefined`      |
| `checkIn`     | `check-in`    |             | `string`                                                                                                                                                                | `undefined`      |
| `checkOut`    | `check-out`   |             | `string`                                                                                                                                                                | `undefined`      |
| `identifier`  | `identifier`  |             | `string`                                                                                                                                                                | `undefined`      |
| `language`    | `language`    |             | `string`                                                                                                                                                                | `'en'`           |
| `mode`        | `mode`        |             | `"ADD_ROOM" \| "BAR_BOOKING" \| "EDIT_BOOKING" \| "PLUS_BOOKING" \| "SPLIT_BOOKING"`                                                                                    | `'PLUS_BOOKING'` |
| `propertyId`  | `property-id` |             | `number \| string`                                                                                                                                                      | `undefined`      |
| `roomTypeIds` | --            |             | `(string \| number)[]`                                                                                                                                                  | `[]`             |
| `step`        | `step`        |             | `"confirm" \| "details"`                                                                                                                                                | `undefined`      |
| `unitId`      | `unit-id`     |             | `string`                                                                                                                                                                | `undefined`      |


## Events

| Event               | Description | Type                              |
| ------------------- | ----------- | --------------------------------- |
| `adjustBlockedUnit` |             | `CustomEvent<any>`                |
| `loadingChanged`    |             | `CustomEvent<{ cause: string; }>` |
| `resetBookingEvt`   |             | `CustomEvent<void>`               |


## Dependencies

### Used by

 - [ir-booking-editor-drawer](ir-booking-editor-drawer)

### Depends on

- [ir-spinner](../../ui/ir-spinner)
- [ir-interceptor](../../ir-interceptor)
- [ir-booking-editor-header](ir-booking-editor-header)
- [igl-room-type](../igl-book-property/igl-booking-overview-page/igl-room-type)
- [ir-booking-editor-form](ir-booking-editor-form)

### Graph
```mermaid
graph TD;
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
  ir-booking-editor-drawer --> ir-booking-editor
  style ir-booking-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
