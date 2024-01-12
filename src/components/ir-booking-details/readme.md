# ir-booking-details



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description | Type             | Default     |
| ------------------------- | --------------------------- | ----------- | ---------------- | ----------- |
| `baseurl`                 | `baseurl`                   |             | `string`         | `''`        |
| `bookingDetails`          | `booking-details`           |             | `any`            | `null`      |
| `bookingNumber`           | `booking-number`            |             | `string`         | `''`        |
| `dropdownStatuses`        | `dropdown-statuses`         |             | `any`            | `[]`        |
| `editBookingItem`         | `edit-booking-item`         |             | `any`            | `undefined` |
| `hasCheckIn`              | `has-check-in`              |             | `boolean`        | `false`     |
| `hasCheckOut`             | `has-check-out`             |             | `boolean`        | `false`     |
| `hasDelete`               | `has-delete`                |             | `boolean`        | `false`     |
| `hasMenu`                 | `has-menu`                  |             | `boolean`        | `false`     |
| `hasPrint`                | `has-print`                 |             | `boolean`        | `false`     |
| `hasReceipt`              | `has-receipt`               |             | `boolean`        | `false`     |
| `hasRoomAdd`              | `has-room-add`              |             | `boolean`        | `false`     |
| `hasRoomDelete`           | `has-room-delete`           |             | `boolean`        | `false`     |
| `hasRoomEdit`             | `has-room-edit`             |             | `boolean`        | `false`     |
| `language`                | `language`                  |             | `string`         | `''`        |
| `languageAbreviation`     | `language-abreviation`      |             | `string`         | `''`        |
| `paymentDetailsUrl`       | `payment-details-url`       |             | `string`         | `''`        |
| `paymentExceptionMessage` | `payment-exception-message` |             | `string`         | `''`        |
| `propertyid`              | `propertyid`                |             | `number`         | `undefined` |
| `setupDataCountries`      | --                          |             | `selectOption[]` | `null`      |
| `setupDataCountriesCode`  | --                          |             | `selectOption[]` | `null`      |
| `statusCodes`             | `status-codes`              |             | `any`            | `[]`        |
| `ticket`                  | `ticket`                    |             | `string`         | `''`        |


## Events

| Event                | Description | Type                     |
| -------------------- | ----------- | ------------------------ |
| `handleAddPayment`   |             | `CustomEvent<any>`       |
| `handleDeleteClick`  |             | `CustomEvent<any>`       |
| `handleMenuClick`    |             | `CustomEvent<any>`       |
| `handlePrintClick`   |             | `CustomEvent<any>`       |
| `handleReceiptClick` |             | `CustomEvent<any>`       |
| `handleRoomAdd`      |             | `CustomEvent<any>`       |
| `handleRoomDelete`   |             | `CustomEvent<any>`       |
| `handleRoomEdit`     |             | `CustomEvent<any>`       |
| `sendDataToServer`   |             | `CustomEvent<guestInfo>` |


## Dependencies

### Used by

 - [igloo-calendar](../igloo-calendar)

### Depends on

- [ir-common](../ir-common)
- [ir-label](../ir-label)
- [ir-icon](../ir-icon)
- [ir-room](ir-room)
- [ir-payment-details](ir-payment-details)
- [ir-sidebar](../ir-sidebar)
- [ir-guest-info](../ir-guest-info)
- [igl-book-property](../igloo-calendar/igl-book-property)

### Graph
```mermaid
graph TD;
  ir-booking-details --> ir-common
  ir-booking-details --> ir-label
  ir-booking-details --> ir-icon
  ir-booking-details --> ir-room
  ir-booking-details --> ir-payment-details
  ir-booking-details --> ir-sidebar
  ir-booking-details --> ir-guest-info
  ir-booking-details --> igl-book-property
  ir-label --> ir-icon
  ir-room --> ir-icon
  ir-room --> ir-button
  ir-room --> ir-label
  ir-room --> ir-modal
  ir-modal --> ir-icon
  ir-modal --> ir-button
  ir-payment-details --> ir-date-picker
  ir-payment-details --> ir-icon
  ir-payment-details --> ir-modal
  ir-sidebar --> ir-icon
  ir-guest-info --> ir-input-text
  ir-guest-info --> ir-select
  ir-guest-info --> ir-checkbox
  ir-guest-info --> ir-button
  igl-book-property --> igl-block-dates-view
  igl-book-property --> igl-booking-overview-page
  igl-book-property --> igl-pagetwo
  igl-booking-overview-page --> igl-book-property-header
  igl-booking-overview-page --> igl-booking-rooms
  igl-booking-overview-page --> igl-book-property-footer
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-picker
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-pagetwo --> igl-application-info
  igl-pagetwo --> igl-property-booked-by
  igl-application-info --> ir-tooltip
  igl-property-booked-by --> ir-autocomplete
  igloo-calendar --> ir-booking-details
  style ir-booking-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
