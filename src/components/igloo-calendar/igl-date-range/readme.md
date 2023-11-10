# igl-date-range



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute | Description | Type                      | Default     |
| ------------- | --------- | ----------- | ------------------------- | ----------- |
| `defaultData` | --        |             | `{ [key: string]: any; }` | `undefined` |
| `message`     | `message` |             | `string`                  | `""`        |


## Events

| Event             | Description | Type                                   |
| ----------------- | ----------- | -------------------------------------- |
| `dateSelectEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igl-book-property](../igl-book-property)

### Depends on

- [ir-date-picker](../../ir-date-picker)

### Graph
```mermaid
graph TD;
  igl-date-range --> ir-date-picker
  igl-book-property --> igl-date-range
  style igl-date-range fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*