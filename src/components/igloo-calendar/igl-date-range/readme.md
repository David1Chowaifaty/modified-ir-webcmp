# igl-date-range



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description | Type                             | Default     |
| -------------------- | ---------------------- | ----------- | -------------------------------- | ----------- |
| `dateLabel`          | `date-label`           |             | `string`                         | `undefined` |
| `defaultData`        | --                     |             | `{ [key: string]: any; }`        | `undefined` |
| `disabled`           | `disabled`             |             | `boolean`                        | `false`     |
| `hint`               | `hint`                 |             | `string`                         | `undefined` |
| `maxDate`            | `max-date`             |             | `string`                         | `undefined` |
| `minDate`            | `min-date`             |             | `string`                         | `undefined` |
| `size`               | `size`                 |             | `"large" \| "medium" \| "small"` | `'small'`   |
| `variant`            | `variant`              |             | `"booking" \| "default"`         | `'default'` |
| `withDateDifference` | `with-date-difference` |             | `boolean`                        | `true`      |


## Events

| Event             | Description | Type                                                                                                 |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `dateRangeChange` |             | `CustomEvent<{ checkIn: Moment; checkOut: Moment; }>`                                                |
| `dateSelectEvent` |             | `CustomEvent<{ [key: string]: any; }>`                                                               |
| `toast`           |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igl-book-property-header](../igl-book-property/igl-book-property-header)
 - [ir-booking-editor-header](../ir-booking-editor/ir-booking-editor-header)

### Depends on

- [ir-custom-date-picker](../../ir-custom-date-picker)

### Graph
```mermaid
graph TD;
  igl-date-range --> ir-custom-date-picker
  ir-custom-date-picker --> ir-input
  igl-book-property-header --> igl-date-range
  ir-booking-editor-header --> igl-date-range
  style igl-date-range fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
