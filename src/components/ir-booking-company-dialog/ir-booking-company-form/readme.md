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

- [ir-input](../../ui/ir-input)

### Graph
```mermaid
graph TD;
  ir-booking-company-form --> ir-input
  ir-booking-company-dialog --> ir-booking-company-form
  style ir-booking-company-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
