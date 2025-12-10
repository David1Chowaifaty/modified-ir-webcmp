# ir-booking-company-form



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default     |
| --------- | --------- | ----------- | --------- | ----------- |
| `booking` | --        |             | `Booking` | `undefined` |
| `formId`  | `form-id` |             | `string`  | `undefined` |


## Events

| Event             | Description | Type                   |
| ----------------- | ----------- | ---------------------- |
| `resetBookingEvt` |             | `CustomEvent<Booking>` |


## Dependencies

### Used by

 - [ir-booking-company-dialog](..)

### Depends on

- [ir-custom-input](../../ui/ir-custom-input)

### Graph
```mermaid
graph TD;
  ir-booking-company-form --> ir-custom-input
  ir-booking-company-dialog --> ir-booking-company-form
  style ir-booking-company-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
