# igl-bulk-stop-sale



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type     | Default |
| ---------------- | ------------------ | ----------- | -------- | ------- |
| `maxDatesLength` | `max-dates-length` |             | `number` | `8`     |


## Events

| Event        | Description | Type                                                                                                 |
| ------------ | ----------- | ---------------------------------------------------------------------------------------------------- |
| `closeModal` |             | `CustomEvent<null>`                                                                                  |
| `toast`      |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [ir-title](../../ir-title)
- [ir-select](../../ui/ir-select)
- [ir-checkbox](../../ui/ir-checkbox)
- [ir-button](../../ui/ir-button)
- [ir-date-picker](../../ui/ir-date-picker)

### Graph
```mermaid
graph TD;
  igl-bulk-stop-sale --> ir-title
  igl-bulk-stop-sale --> ir-select
  igl-bulk-stop-sale --> ir-checkbox
  igl-bulk-stop-sale --> ir-button
  igl-bulk-stop-sale --> ir-date-picker
  ir-title --> ir-icon
  ir-button --> ir-icons
  igloo-calendar --> igl-bulk-stop-sale
  style igl-bulk-stop-sale fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
