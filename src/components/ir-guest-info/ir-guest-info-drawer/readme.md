# ir-guest-info-drawer



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description | Type      | Default     |
| ------------- | ------------- | ----------- | --------- | ----------- |
| `booking_nbr` | `booking_nbr` |             | `string`  | `undefined` |
| `email`       | `email`       |             | `string`  | `undefined` |
| `language`    | `language`    |             | `string`  | `'en'`      |
| `open`        | `open`        |             | `boolean` | `undefined` |
| `ticket`      | `ticket`      |             | `string`  | `undefined` |


## Events

| Event                   | Description | Type                                                                                                 |
| ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `guestInfoDrawerClosed` |             | `CustomEvent<{ source: Element; }>`                                                                  |
| `resetBookingEvt`       |             | `CustomEvent<null>`                                                                                  |
| `toast`                 |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [ir-booking-listing](../../ir-booking-listing)

### Depends on

- [ir-drawer](../../ir-drawer)
- [ir-spinner](../../ui/ir-spinner)
- [ir-guest-info-form](../ir-guest-info-form)
- [ir-custom-button](../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-guest-info-drawer --> ir-drawer
  ir-guest-info-drawer --> ir-spinner
  ir-guest-info-drawer --> ir-guest-info-form
  ir-guest-info-drawer --> ir-custom-button
  ir-guest-info-form --> ir-custom-input
  ir-guest-info-form --> ir-country-picker
  ir-guest-info-form --> ir-mobile-input
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  ir-booking-listing --> ir-guest-info-drawer
  style ir-guest-info-drawer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
