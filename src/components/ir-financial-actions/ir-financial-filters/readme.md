# ir-financial-filters



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default     |
| ----------- | ------------ | ----------- | --------- | ----------- |
| `isLoading` | `is-loading` |             | `boolean` | `undefined` |


## Events

| Event             | Description | Type                                                 |
| ----------------- | ----------- | ---------------------------------------------------- |
| `fetchNewReports` |             | `CustomEvent<{ date: string; sourceCode: string; }>` |


## Dependencies

### Used by

 - [ir-financial-actions](..)

### Depends on

- [ir-button](../../ui/ir-button)
- [ir-date-picker](../../ui/ir-date-picker)
- [ir-select](../../ui/ir-select)

### Graph
```mermaid
graph TD;
  ir-financial-filters --> ir-button
  ir-financial-filters --> ir-date-picker
  ir-financial-filters --> ir-select
  ir-button --> ir-icons
  ir-financial-actions --> ir-financial-filters
  style ir-financial-filters fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
