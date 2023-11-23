# ir-payment-details



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description | Type     | Default     |
| ------------------------- | --------------------------- | ----------- | -------- | ----------- |
| `item`                    | `item`                      |             | `any`    | `undefined` |
| `paymentDetailsUrl`       | `payment-details-url`       |             | `string` | `''`        |
| `paymentExceptionMessage` | `payment-exception-message` |             | `string` | `''`        |


## Events

| Event                     | Description | Type               |
| ------------------------- | ----------- | ------------------ |
| `creditCardPressHandler`  |             | `CustomEvent<any>` |
| `handlePaymentItemChange` |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [ir-icon](../../ir-icon)
- [ir-modal](../../ir-modal)

### Graph
```mermaid
graph TD;
  ir-payment-details --> ir-icon
  ir-payment-details --> ir-modal
  ir-modal --> ir-icon
  ir-modal --> ir-button
  style ir-payment-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
