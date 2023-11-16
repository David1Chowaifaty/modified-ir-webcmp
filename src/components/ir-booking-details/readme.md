# ir-booking-details



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description | Type             | Default |
| ------------------------- | --------------------------- | ----------- | ---------------- | ------- |
| `baseurl`                 | `baseurl`                   |             | `string`         | `''`    |
| `bookingDetails`          | `booking-details`           |             | `any`            | `null`  |
| `bookingNumber`           | `booking-number`            |             | `string`         | `''`    |
| `dropdownStatuses`        | `dropdown-statuses`         |             | `any`            | `[]`    |
| `hasCheckIn`              | `has-check-in`              |             | `boolean`        | `false` |
| `hasCheckOut`             | `has-check-out`             |             | `boolean`        | `false` |
| `hasDelete`               | `has-delete`                |             | `boolean`        | `false` |
| `hasMenu`                 | `has-menu`                  |             | `boolean`        | `false` |
| `hasPrint`                | `has-print`                 |             | `boolean`        | `false` |
| `hasReceipt`              | `has-receipt`               |             | `boolean`        | `false` |
| `hasRoomAdd`              | `has-room-add`              |             | `boolean`        | `false` |
| `hasRoomDelete`           | `has-room-delete`           |             | `boolean`        | `false` |
| `hasRoomEdit`             | `has-room-edit`             |             | `boolean`        | `false` |
| `language`                | `language`                  |             | `string`         | `''`    |
| `languageAbreviation`     | `language-abreviation`      |             | `string`         | `''`    |
| `paymentDetailsUrl`       | `payment-details-url`       |             | `string`         | `''`    |
| `paymentExceptionMessage` | `payment-exception-message` |             | `string`         | `''`    |
| `setupDataCountries`      | --                          |             | `selectOption[]` | `null`  |
| `setupDataCountriesCode`  | --                          |             | `selectOption[]` | `null`  |
| `statusCodes`             | `status-codes`              |             | `any`            | `[]`    |
| `ticket`                  | `ticket`                    |             | `string`         | `''`    |


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

### Depends on

- [ir-common](../ir-common)
- [ir-select](../ir-select)
- [ir-button](../ir-button)
- [ir-icon](../ir-icon)
- [ir-label](../ir-label)
- [ir-room](ir-room)
- [ir-sidebar](../ir-sidebar)
- [ir-guest-info](../ir-guest-info)

### Graph
```mermaid
graph TD;
  ir-booking-details --> ir-common
  ir-booking-details --> ir-select
  ir-booking-details --> ir-button
  ir-booking-details --> ir-icon
  ir-booking-details --> ir-label
  ir-booking-details --> ir-room
  ir-booking-details --> ir-sidebar
  ir-booking-details --> ir-guest-info
  ir-label --> ir-icon
  ir-room --> ir-icon
  ir-room --> ir-button
  ir-room --> ir-label
  ir-sidebar --> ir-icon
  ir-guest-info --> ir-select
  ir-guest-info --> ir-input-text
  ir-guest-info --> ir-checkbox
  ir-guest-info --> ir-button
  style ir-booking-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
