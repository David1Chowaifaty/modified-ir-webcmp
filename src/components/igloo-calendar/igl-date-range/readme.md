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
| `variant`            | `variant`              |             | `"booking" \| "default"`  | `'default'` |
| `withDateDifference` | `with-date-difference` |             | `boolean`                 | `true`      |


## Events

| Event             | Description | Type                                                                                                 |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `dateSelectEvent` |             | `CustomEvent<{ [key: string]: any; }>`                                                               |
| `toast`           |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igl-book-property-header](../igl-book-property/igl-book-property-header)

### Depends on

- [ir-date-range](../../ui/ir-date-range)

### Graph
```mermaid
graph TD;
  igl-date-range --> ir-date-range
  igl-book-property-header --> igl-date-range
  style igl-date-range fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
