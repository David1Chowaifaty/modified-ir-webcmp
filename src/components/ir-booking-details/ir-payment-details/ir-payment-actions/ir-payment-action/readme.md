# ir-payment-action



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute | Description | Type             | Default     |
| --------------- | --------- | ----------- | ---------------- | ----------- |
| `paymentAction` | --        |             | `IPaymentAction` | `undefined` |


## Events

| Event             | Description | Type                          |
| ----------------- | ----------- | ----------------------------- |
| `generatePayment` |             | `CustomEvent<IPaymentAction>` |


## Dependencies

### Used by

 - [ir-payment-actions](..)

### Depends on

- [ir-button](../../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-payment-action --> ir-button
  ir-button --> ir-icons
  ir-payment-actions --> ir-payment-action
  style ir-payment-action fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
