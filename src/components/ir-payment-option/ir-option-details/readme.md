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

- [ir-title](../../ir-title)
- [ir-select](../../ui/ir-select)
- [ir-text-editor](../../ui/ir-text-editor)
- [ir-input-text](../../ui/ir-input-text)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-option-details --> ir-title
  ir-option-details --> ir-select
  ir-option-details --> ir-text-editor
  ir-option-details --> ir-input-text
  ir-option-details --> ir-button
  ir-title --> ir-icon
  ir-button --> ir-icons
  ir-payment-option --> ir-option-details
  style ir-option-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
