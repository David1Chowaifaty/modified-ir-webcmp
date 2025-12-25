# ir-booking-editor-form



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                                                                                 | Default          |
| -------- | --------- | ----------- | ------------------------------------------------------------------------------------ | ---------------- |
| `mode`   | `mode`    |             | `"ADD_ROOM" \| "BAR_BOOKING" \| "EDIT_BOOKING" \| "PLUS_BOOKING" \| "SPLIT_BOOKING"` | `'PLUS_BOOKING'` |
| `room`   | --        |             | `Room`                                                                               | `undefined`      |


## Events

| Event           | Description | Type                  |
| --------------- | ----------- | --------------------- |
| `doReservation` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-booking-editor](..)

### Depends on

- [ir-date-view](../../../ir-date-view)
- [igl-application-info](../../igl-book-property/igl-booking-form/igl-application-info)
- [ir-picker](../../../ui/ir-picker)
- [ir-picker-item](../../../ui/ir-picker/ir-picker-item)
- [ir-custom-button](../../../ui/ir-custom-button)
- [ir-booking-editor-guest-form](../ir-booking-editor-guest-form)

### Graph
```mermaid
graph TD;
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
  ir-booking-editor --> ir-booking-editor-form
  style ir-booking-editor-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
