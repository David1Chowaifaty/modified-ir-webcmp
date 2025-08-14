# igl-bulk-block



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type     | Default     |
| ---------------- | ------------------ | ----------- | -------- | ----------- |
| `maxDatesLength` | `max-dates-length` |             | `number` | `8`         |
| `property_id`    | `property_id`      |             | `number` | `undefined` |


## Events

| Event        | Description | Type                                                                                                 |
| ------------ | ----------- | ---------------------------------------------------------------------------------------------------- |
| `closeModal` |             | `CustomEvent<null>`                                                                                  |
| `toast`      |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igl-bulk-operations](..)

### Depends on

- [ir-select](../../../ui/ir-select)
- [ir-radio](../../../ui/ir-radio)
- [ir-button](../../../ui/ir-button)
- [ir-date-picker](../../../ui/ir-date-picker)

### Graph
```mermaid
graph TD;
  igl-bulk-block --> ir-select
  igl-bulk-block --> ir-radio
  igl-bulk-block --> ir-button
  igl-bulk-block --> ir-date-picker
  ir-button --> ir-icons
  igl-bulk-operations --> igl-bulk-block
  style igl-bulk-block fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
