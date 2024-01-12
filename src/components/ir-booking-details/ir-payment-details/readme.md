# ir-payment-details



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description | Type        | Default     |
| ------------------------- | --------------------------- | ----------- | ----------- | ----------- |
| `bookingDetails`          | --                          |             | `Booking`   | `undefined` |
| `defaultTexts`            | --                          |             | `Languages` | `undefined` |
| `item`                    | `item`                      |             | `any`       | `undefined` |
| `paymentExceptionMessage` | `payment-exception-message` |             | `string`    | `''`        |


## Events

| Event                     | Description | Type               |
| ------------------------- | ----------- | ------------------ |
| `creditCardPressHandler`  |             | `CustomEvent<any>` |
| `handlePaymentItemChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-date-picker](../../ir-date-picker)
- [ir-icon](../../ir-icon)
- [ir-modal](../../ir-modal)

### Graph
```mermaid
graph TD;
  ir-payment-details --> ir-date-picker
  ir-payment-details --> ir-icon
  ir-payment-details --> ir-modal
  ir-modal --> ir-icon
  ir-modal --> ir-button
  ir-booking-details --> ir-payment-details
  style ir-payment-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
