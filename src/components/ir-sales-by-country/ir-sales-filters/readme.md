# ir-sales-filters



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default     |
| ----------- | ------------ | ----------- | --------- | ----------- |
| `isLoading` | `is-loading` |             | `boolean` | `undefined` |


## Events

| Event          | Description | Type                                                                                                                 |
| -------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `applyFilters` |             | `CustomEvent<{ from_date: string; to_date: string; show_previous_year: boolean; rooms_status: { code: string; }; }>` |


## Dependencies

### Used by

 - [ir-sales-by-country](..)

### Depends on

- [ir-button](../../ui/ir-button)
- [ir-select](../../ui/ir-select)
- [ir-range-picker](../../ir-housekeeping/ir-hk-tasks/ir-hk-archive/ir-range-picker)
- [ir-checkbox](../../ui/ir-checkbox)

### Graph
```mermaid
graph TD;
  ir-sales-filters --> ir-button
  ir-sales-filters --> ir-select
  ir-sales-filters --> ir-range-picker
  ir-sales-filters --> ir-checkbox
  ir-button --> ir-icons
  ir-range-picker --> ir-date-picker
  ir-sales-by-country --> ir-sales-filters
  style ir-sales-filters fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
