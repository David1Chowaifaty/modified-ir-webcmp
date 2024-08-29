# ir-option-details



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type     | Default     |
| ------------ | ------------- | ----------- | -------- | ----------- |
| `propertyId` | `property-id` |             | `string` | `undefined` |


## Events

| Event        | Description | Type                                                                                                 |
| ------------ | ----------- | ---------------------------------------------------------------------------------------------------- |
| `closeModal` |             | `CustomEvent<PaymentOption>`                                                                         |
| `toast`      |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [ir-payment-option](..)

### Depends on

- [ir-select](../../ir-select)
- [ir-textarea](../../ir-textarea)
- [ir-input-text](../../ir-input-text)
- [ir-button](../../ir-button)

### Graph
```mermaid
graph TD;
  ir-option-details --> ir-select
  ir-option-details --> ir-textarea
  ir-option-details --> ir-input-text
  ir-option-details --> ir-button
  ir-button --> ir-icons
  ir-payment-option --> ir-option-details
  style ir-option-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
