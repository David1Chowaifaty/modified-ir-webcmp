# ir-picker-item



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type      | Default     |
| ---------- | ---------- | ----------- | --------- | ----------- |
| `active`   | `active`   |             | `boolean` | `false`     |
| `disabled` | `disabled` |             | `boolean` | `false`     |
| `label`    | `label`    |             | `string`  | `undefined` |
| `selected` | `selected` |             | `boolean` | `false`     |
| `value`    | `value`    |             | `string`  | `undefined` |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"base"`    |             |
| `"content"` |             |


## Dependencies

### Used by

 - [igl-book-property-header](../../../igloo-calendar/igl-book-property/igl-book-property-header)
 - [igl-cal-header](../../../igloo-calendar/igl-cal-header)
 - [igl-property-booked-by](../../../igloo-calendar/igl-book-property/igl-booking-form/igl-property-booked-by)
 - [ir-country-picker](../../ir-country-picker)

### Graph
```mermaid
graph TD;
  igl-book-property-header --> ir-picker-item
  igl-cal-header --> ir-picker-item
  igl-property-booked-by --> ir-picker-item
  ir-country-picker --> ir-picker-item
  style ir-picker-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
