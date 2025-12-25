# ir-booking-editor-header



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                              | Type                                                                                 | Default          |
| ---------- | ----------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------- |
| `booking`  | --          | Booking context used for edit, add-room, and split flows | `Booking`                                                                            | `undefined`      |
| `checkIn`  | `check-in`  | Fixed check-in date (YYYY-MM-DD), if applicable          | `string`                                                                             | `undefined`      |
| `checkOut` | `check-out` | Fixed check-out date (YYYY-MM-DD), if applicable         | `string`                                                                             | `undefined`      |
| `mode`     | `mode`      | Controls header behavior and date constraints            | `"ADD_ROOM" \| "BAR_BOOKING" \| "EDIT_BOOKING" \| "PLUS_BOOKING" \| "SPLIT_BOOKING"` | `'PLUS_BOOKING'` |


## Events

| Event               | Description | Type                   |
| ------------------- | ----------- | ---------------------- |
| `checkAvailability` |             | `CustomEvent<void>`    |
| `guestSelected`     |             | `CustomEvent<Booking>` |


## Dependencies

### Used by

 - [ir-booking-editor](..)

### Depends on

- [ir-validator](../../../ui/ir-validator)
- [ir-picker](../../../ui/ir-picker)
- [ir-picker-item](../../../ui/ir-picker/ir-picker-item)
- [igl-date-range](../../igl-date-range)
- [ir-custom-button](../../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-booking-editor-header --> ir-validator
  ir-booking-editor-header --> ir-picker
  ir-booking-editor-header --> ir-picker-item
  ir-booking-editor-header --> igl-date-range
  ir-booking-editor-header --> ir-custom-button
  igl-date-range --> ir-custom-date-picker
  ir-custom-date-picker --> ir-input
  ir-booking-editor --> ir-booking-editor-header
  style ir-booking-editor-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
