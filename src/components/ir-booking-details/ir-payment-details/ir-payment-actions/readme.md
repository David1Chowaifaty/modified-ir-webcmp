# ir-payment-actions



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute | Description | Type               | Default     |
| --------------- | --------- | ----------- | ------------------ | ----------- |
| `booking`       | --        |             | `Booking`          | `undefined` |
| `paymentAction` | --        |             | `IPaymentAction[]` | `undefined` |


## Events

| Event             | Description | Type                          |
| ----------------- | ----------- | ----------------------------- |
| `generatePayment` |             | `CustomEvent<IPaymentAction>` |


## Dependencies

### Used by

 - [ir-payment-details](..)

### Depends on

- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-payment-actions --> ir-button
  ir-button --> ir-icons
  ir-payment-details --> ir-payment-actions
  style ir-payment-actions fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
