# igl-cal-footer



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type                      | Default     |
| ----------------- | ------------------ | ----------- | ------------------------- | ----------- |
| `calendarData`    | --                 |             | `{ [key: string]: any; }` | `undefined` |
| `highlightedDate` | `highlighted-date` |             | `string`                  | `undefined` |
| `today`           | --                 |             | `String`                  | `undefined` |


## Events

| Event         | Description | Type                                   |
| ------------- | ----------- | -------------------------------------- |
| `optionEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [ir-new-badge](../../ir-new-badge)

### Graph
```mermaid
graph TD;
  igl-cal-footer --> ir-new-badge
  igloo-calendar --> igl-cal-footer
  style igl-cal-footer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
