# igl-bulk-operations



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type     | Default     |
| ---------------- | ------------------ | ----------- | -------- | ----------- |
| `maxDatesLength` | `max-dates-length` |             | `number` | `8`         |
| `property_id`    | `property_id`      |             | `number` | `undefined` |


## Events

| Event        | Description | Type                   |
| ------------ | ----------- | ---------------------- |
| `closeModal` |             | `CustomEvent<null>`    |
| `toast`      |             | `CustomEvent<IrToast>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [ir-title](../../ir-title)
- [ir-tabs](../../ui/ir-tabs)
- [igl-bulk-stop-sale](igl-bulk-stop-sale)
- [igl-bulk-block](igl-bulk-block)

### Graph
```mermaid
graph TD;
  igl-bulk-operations --> ir-title
  igl-bulk-operations --> ir-tabs
  igl-bulk-operations --> igl-bulk-stop-sale
  igl-bulk-operations --> igl-bulk-block
  ir-title --> ir-icon
  igl-bulk-stop-sale --> ir-select
  igl-bulk-stop-sale --> ir-weekday-selector
  igl-bulk-stop-sale --> ir-button
  igl-bulk-stop-sale --> ir-date-picker
  ir-weekday-selector --> ir-checkbox
  ir-button --> ir-icons
  igl-bulk-block --> ir-select
  igl-bulk-block --> ir-radio
  igl-bulk-block --> ir-button
  igl-bulk-block --> ir-date-picker
  igloo-calendar --> igl-bulk-operations
  style igl-bulk-operations fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
