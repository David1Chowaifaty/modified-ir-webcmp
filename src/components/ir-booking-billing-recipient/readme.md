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

 - [ir-invoice](../ir-invoice)

### Depends on

- [ir-booking-company-form](../ir-booking-details/ir-booking-company-form)

### Graph
```mermaid
graph TD;
  ir-booking-billing-recipient --> ir-booking-company-form
  ir-booking-company-form --> ir-dialog
  ir-booking-company-form --> ir-custom-input
  ir-booking-company-form --> ir-custom-button
  ir-invoice --> ir-booking-billing-recipient
  style ir-booking-billing-recipient fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
