# igl-date-range



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description | Type                      | Default     |
| -------------------- | ---------------------- | ----------- | ------------------------- | ----------- |
| `dateLabel`          | `date-label`           |             | `string`                  | `undefined` |
| `defaultData`        | --                     |             | `{ [key: string]: any; }` | `undefined` |
| `disabled`           | `disabled`             |             | `boolean`                 | `false`     |
| `maxDate`            | `max-date`             |             | `string`                  | `undefined` |
| `minDate`            | `min-date`             |             | `string`                  | `undefined` |
| `withDateDifference` | `with-date-difference` |             | `boolean`                 | `true`      |


## Events

| Event             | Description | Type                                                                                                 |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `dateSelectEvent` |             | `CustomEvent<{ [key: string]: any; }>`                                                               |
| `toast`           |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igl-book-property-header](../igl-book-property/igl-book-property-header)
 - [ir-hk-archive](../../ir-housekeeping/ir-hk-tasks/ir-hk-archive)

### Depends on

- [ir-date-picker](../../ir-date-picker)
- [ir-date-view](../../ir-date-view)

### Graph
```mermaid
graph TD;
  igl-date-range --> ir-date-picker
  igl-date-range --> ir-date-view
  igl-book-property-header --> igl-date-range
  ir-hk-archive --> igl-date-range
  style igl-date-range fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
