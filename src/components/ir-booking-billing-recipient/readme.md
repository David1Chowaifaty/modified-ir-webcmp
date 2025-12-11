# ir-booking-billing-recipient



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default     |
| --------- | --------- | ----------- | --------- | ----------- |
| `booking` | --        |             | `Booking` | `undefined` |


## Events

| Event             | Description | Type                  |
| ----------------- | ----------- | --------------------- |
| `recipientChange` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-invoice-form](../ir-invoice/ir-invoice-form)

### Depends on

- [ir-booking-company-dialog](../ir-booking-company-dialog)

### Graph
```mermaid
graph TD;
  ir-booking-billing-recipient --> ir-booking-company-dialog
  ir-booking-company-dialog --> ir-dialog
  ir-booking-company-dialog --> ir-booking-company-form
  ir-booking-company-dialog --> ir-custom-button
  ir-booking-company-form --> ir-input
  ir-invoice-form --> ir-booking-billing-recipient
  style ir-booking-billing-recipient fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
