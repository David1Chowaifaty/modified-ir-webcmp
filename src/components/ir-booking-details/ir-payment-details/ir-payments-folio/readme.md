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


## Dependencies

### Used by

 - [ir-payment-details](..)

### Depends on

- [ir-payment-item](../ir-payment-item)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-payments-folio --> ir-payment-item
  ir-payments-folio --> ir-button
  ir-payment-item --> ir-popover
  ir-payment-item --> ir-button
  ir-button --> ir-icons
  ir-payment-details --> ir-payments-folio
  style ir-payments-folio fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
