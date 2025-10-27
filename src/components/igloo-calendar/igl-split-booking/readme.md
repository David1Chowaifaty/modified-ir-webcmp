# igl-split-booking



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type      | Default     |
| ------------ | ------------ | ----------- | --------- | ----------- |
| `booking`    | --           |             | `Booking` | `undefined` |
| `identifier` | `identifier` |             | `string`  | `undefined` |


## Events

| Event        | Description | Type                |
| ------------ | ----------- | ------------------- |
| `closeModal` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [ir-title](../../ir-title)
- [ir-date-view](../../ir-date-view)
- [ir-date-picker](../../ui/ir-date-picker)
- [ir-button](../../ui/ir-button)
- [ir-radio](../../ui/ir-radio)
- [ir-select](../../ui/ir-select)

### Graph
```mermaid
graph TD;
  igl-split-booking --> ir-title
  igl-split-booking --> ir-date-view
  igl-split-booking --> ir-date-picker
  igl-split-booking --> ir-button
  igl-split-booking --> ir-radio
  igl-split-booking --> ir-select
  ir-title --> ir-icon
  ir-button --> ir-icons
  igloo-calendar --> igl-split-booking
  style igl-split-booking fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
