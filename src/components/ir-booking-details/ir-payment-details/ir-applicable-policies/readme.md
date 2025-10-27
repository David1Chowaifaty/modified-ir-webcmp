# ir-applicable-policies



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type      | Default     |
| ------------ | ------------- | ----------- | --------- | ----------- |
| `booking`    | --            |             | `Booking` | `undefined` |
| `language`   | `language`    |             | `string`  | `'en'`      |
| `propertyId` | `property-id` |             | `number`  | `undefined` |


## Events

| Event             | Description | Type                          |
| ----------------- | ----------- | ----------------------------- |
| `generatePayment` |             | `CustomEvent<IPaymentAction>` |


## Dependencies

### Used by

 - [ir-payment-details](..)

### Depends on

- [ir-button](../../../ui/ir-button)
- [ir-icons](../../../ui/ir-icons)

### Graph
```mermaid
graph TD;
  ir-applicable-policies --> ir-button
  ir-applicable-policies --> ir-icons
  ir-button --> ir-icons
  ir-payment-details --> ir-applicable-policies
  style ir-applicable-policies fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
