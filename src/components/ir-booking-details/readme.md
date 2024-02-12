# ir-booking-details



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute         | Description | Type      | Default     |
| --------------- | ----------------- | ----------- | --------- | ----------- |
| `baseurl`       | `baseurl`         |             | `string`  | `''`        |
| `bookingNumber` | `booking-number`  |             | `string`  | `''`        |
| `hasCheckIn`    | `has-check-in`    |             | `boolean` | `false`     |
| `hasCheckOut`   | `has-check-out`   |             | `boolean` | `false`     |
| `hasDelete`     | `has-delete`      |             | `boolean` | `false`     |
| `hasMenu`       | `has-menu`        |             | `boolean` | `false`     |
| `hasPrint`      | `has-print`       |             | `boolean` | `false`     |
| `hasReceipt`    | `has-receipt`     |             | `boolean` | `false`     |
| `hasRoomAdd`    | `has-room-add`    |             | `boolean` | `false`     |
| `hasRoomDelete` | `has-room-delete` |             | `boolean` | `false`     |
| `hasRoomEdit`   | `has-room-edit`   |             | `boolean` | `false`     |
| `language`      | `language`        |             | `string`  | `''`        |
| `propertyid`    | `propertyid`      |             | `number`  | `undefined` |
| `ticket`        | `ticket`          |             | `string`  | `''`        |


## Events

| Event   | Description | Type                                                                                                 |
| ------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `toast` |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igloo-calendar](../igloo-calendar)

### Depends on

- [ir-select](../ir-select)
- [ir-button](../ir-button)
- [ir-icon](../ir-icon)
- [ir-label](../ir-label)
- [ir-room](ir-room)
- [ir-payment-details](ir-payment-details)
- [ir-sidebar](../ir-sidebar)
- [ir-guest-info](../ir-guest-info)
- [ir-pickup](ir-pickup)
- [igl-book-property](../igloo-calendar/igl-book-property)

### Graph
```mermaid
graph TD;
  ir-booking-details --> ir-select
  ir-booking-details --> ir-button
  ir-booking-details --> ir-icon
  ir-booking-details --> ir-label
  ir-booking-details --> ir-room
  ir-booking-details --> ir-payment-details
  ir-booking-details --> ir-sidebar
  ir-booking-details --> ir-guest-info
  ir-booking-details --> ir-pickup
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
  ir-guest-info --> ir-button
  ir-pickup --> ir-select
  ir-pickup --> ir-date-picker
  ir-pickup --> ir-input-text
  ir-pickup --> ir-button
  igl-book-property --> igl-block-dates-view
  igl-book-property --> igl-booking-overview-page
  igl-book-property --> igl-pagetwo
  igl-booking-overview-page --> igl-book-property-header
  igl-booking-overview-page --> igl-booking-rooms
  igl-booking-overview-page --> igl-book-property-footer
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> ir-button
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-picker
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-pagetwo --> igl-application-info
  igl-pagetwo --> igl-property-booked-by
  igl-pagetwo --> ir-button
  igl-application-info --> ir-tooltip
  igl-property-booked-by --> ir-autocomplete
  igloo-calendar --> ir-booking-details
  style ir-booking-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
