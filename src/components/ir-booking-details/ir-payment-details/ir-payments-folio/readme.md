# ir-payments-folio



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute | Description | Type         | Default |
| ---------- | --------- | ----------- | ------------ | ------- |
| `payments` | --        |             | `IPayment[]` | `[]`    |


## Events

| Event           | Description | Type                    |
| --------------- | ----------- | ----------------------- |
| `addPayment`    |             | `CustomEvent<void>`     |
| `deletePayment` |             | `CustomEvent<IPayment>` |
| `editPayment`   |             | `CustomEvent<IPayment>` |
| `issueReceipt`  |             | `CustomEvent<IPayment>` |


## Dependencies

### Used by

 - [ir-payment-details](..)

### Depends on

- [ir-payment-item](../ir-payment-item)
- [ir-custom-button](../../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-payments-folio --> ir-payment-item
  ir-payments-folio --> ir-custom-button
  ir-payment-item --> ir-custom-button
  ir-payment-details --> ir-payments-folio
  style ir-payments-folio fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
