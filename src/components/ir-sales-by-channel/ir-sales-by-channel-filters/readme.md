# ir-sales-by-channel-filters



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute    | Description | Type                                                                                                                                                                                   | Default     |
| ------------------- | ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `allowedProperties` | --           |             | `{ name?: string; id?: number; }[]`                                                                                                                                                    | `undefined` |
| `baseFilters`       | --           |             | `{ FROM_DATE?: string; TO_DATE?: string; AC_ID?: string; BOOK_CASE?: string; WINDOW?: number; is_export_to_excel?: boolean; LIST_AC_ID?: number[]; include_previous_year?: boolean; }` | `undefined` |
| `isLoading`         | `is-loading` |             | `boolean`                                                                                                                                                                              | `undefined` |


## Events

| Event          | Description | Type                                                                                                                                                                                                |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applyFilters` |             | `CustomEvent<{ FROM_DATE?: string; TO_DATE?: string; AC_ID?: string; BOOK_CASE?: string; WINDOW?: number; is_export_to_excel?: boolean; LIST_AC_ID?: number[]; include_previous_year?: boolean; }>` |


## Dependencies

### Used by

 - [ir-sales-by-channel](..)

### Depends on

- [ir-filters-panel](../../ui/ir-filters-panel)
- [ir-select](../../ui/ir-select)
- [ir-m-combobox](../../ir-m-combobox)
- [ir-range-picker](../../ir-housekeeping/ir-hk-tasks/ir-hk-archive/ir-range-picker)
- [ir-checkbox](../../ui/ir-checkbox)

### Graph
```mermaid
graph TD;
  ir-sales-by-channel-filters --> ir-filters-panel
  ir-sales-by-channel-filters --> ir-select
  ir-sales-by-channel-filters --> ir-m-combobox
  ir-sales-by-channel-filters --> ir-range-picker
  ir-sales-by-channel-filters --> ir-checkbox
  ir-filters-panel --> ir-button
  ir-button --> ir-icons
  ir-range-picker --> ir-date-picker
  ir-sales-by-channel --> ir-sales-by-channel-filters
  style ir-sales-by-channel-filters fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
