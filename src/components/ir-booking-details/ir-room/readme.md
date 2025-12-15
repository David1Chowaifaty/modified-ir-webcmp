# ir-room



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description | Type         | Default     |
| ---------------------- | ------------------------ | ----------- | ------------ | ----------- |
| `bedPreferences`       | --                       |             | `IEntries[]` | `undefined` |
| `booking`              | --                       |             | `Booking`    | `undefined` |
| `bookingIndex`         | `booking-index`          |             | `number`     | `undefined` |
| `currency`             | `currency`               |             | `string`     | `'USD'`     |
| `departureTime`        | --                       |             | `IEntries[]` | `undefined` |
| `hasCheckIn`           | `has-check-in`           |             | `boolean`    | `false`     |
| `hasCheckOut`          | `has-check-out`          |             | `boolean`    | `false`     |
| `hasRoomAdd`           | `has-room-add`           |             | `boolean`    | `false`     |
| `hasRoomDelete`        | `has-room-delete`        |             | `boolean`    | `false`     |
| `hasRoomEdit`          | `has-room-edit`          |             | `boolean`    | `false`     |
| `includeDepartureTime` | `include-departure-time` |             | `boolean`    | `undefined` |
| `isEditable`           | `is-editable`            |             | `boolean`    | `undefined` |
| `language`             | `language`               |             | `string`     | `'en'`      |
| `legendData`           | `legend-data`            |             | `any`        | `undefined` |
| `mealCodeName`         | `meal-code-name`         |             | `string`     | `undefined` |
| `myRoomTypeFoodCat`    | `my-room-type-food-cat`  |             | `string`     | `undefined` |
| `property_id`          | `property_id`            |             | `number`     | `undefined` |
| `room`                 | --                       |             | `Room`       | `undefined` |
| `roomsInfo`            | `rooms-info`             |             | `any`        | `undefined` |


## Events

| Event            | Description | Type                                                                                                                                                                                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `deleteFinished` |             | `CustomEvent<string>`                                                                                                                                                                                                                |
| `editInitiated`  |             | `CustomEvent<IglBookPropertyPayloadAddRoom \| IglBookPropertyPayloadBarBooking \| IglBookPropertyPayloadBlockDates \| IglBookPropertyPayloadEditBooking \| IglBookPropertyPayloadPlusBooking \| IglBookPropertyPayloadSplitBooking>` |
| `openSidebar`    |             | `CustomEvent<{ type: BookingDetailsSidebarEvents; payload?: RoomGuestsPayload; }>`                                                                                                                                                   |
| `pressCheckIn`   |             | `CustomEvent<any>`                                                                                                                                                                                                                   |
| `pressCheckOut`  |             | `CustomEvent<any>`                                                                                                                                                                                                                   |
| `resetbooking`   |             | `CustomEvent<null>`                                                                                                                                                                                                                  |
| `toast`          |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>`                                                                                                                                 |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-custom-button](../../ui/ir-custom-button)
- [ir-date-view](../../ir-date-view)
- [ir-unit-tag](../../ir-unit-tag)
- [ir-label](../../ui/ir-label)
- [ir-dialog](../../ui/ir-dialog)
- [ir-checkout-dialog](../../ir-checkout-dialog)
- [ir-invoice](../../ir-invoice)

### Graph
```mermaid
graph TD;
  ir-room --> ir-custom-button
  ir-room --> ir-date-view
  ir-room --> ir-unit-tag
  ir-room --> ir-label
  ir-room --> ir-dialog
  ir-room --> ir-checkout-dialog
  ir-room --> ir-invoice
  ir-checkout-dialog --> ir-dialog
  ir-checkout-dialog --> ir-spinner
  ir-checkout-dialog --> ir-custom-button
  ir-invoice --> ir-drawer
  ir-invoice --> ir-invoice-form
  ir-invoice --> ir-custom-button
  ir-invoice --> ir-preview-screen-dialog
  ir-invoice --> ir-proforma-invoice-preview
  ir-invoice-form --> ir-spinner
  ir-invoice-form --> ir-custom-date-picker
  ir-invoice-form --> ir-booking-billing-recipient
  ir-custom-date-picker --> ir-input
  ir-booking-billing-recipient --> ir-booking-company-dialog
  ir-booking-company-dialog --> ir-dialog
  ir-booking-company-dialog --> ir-booking-company-form
  ir-booking-company-dialog --> ir-custom-button
  ir-booking-company-form --> ir-input
  ir-preview-screen-dialog --> ir-dialog
  ir-preview-screen-dialog --> ir-custom-button
  ir-proforma-invoice-preview --> ir-printing-label
  ir-proforma-invoice-preview --> ir-print-room
  ir-proforma-invoice-preview --> ir-printing-pickup
  ir-proforma-invoice-preview --> ir-printing-extra-service
  ir-print-room --> ir-printing-label
  ir-printing-pickup --> ir-printing-label
  ir-printing-extra-service --> ir-printing-label
  ir-booking-details --> ir-room
  style ir-room fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
