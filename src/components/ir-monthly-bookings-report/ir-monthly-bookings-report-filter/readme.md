# ir-monthly-bookings-report-filter



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute    | Description | Type                                                    | Default     |
| ------------- | ------------ | ----------- | ------------------------------------------------------- | ----------- |
| `baseFilters` | --           |             | `{ date: ReportDate; include_previous_year: boolean; }` | `undefined` |
| `isLoading`   | `is-loading` |             | `boolean`                                               | `undefined` |


## Events

| Event          | Description | Type                                                                 |
| -------------- | ----------- | -------------------------------------------------------------------- |
| `applyFilters` |             | `CustomEvent<{ date: ReportDate; include_previous_year: boolean; }>` |


## Dependencies

### Used by

 - [ir-monthly-bookings-report](..)

### Depends on

- [ir-select](../../ui/ir-select)
- [ir-checkbox](../../ui/ir-checkbox)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-monthly-bookings-report-filter --> ir-select
  ir-monthly-bookings-report-filter --> ir-checkbox
  ir-monthly-bookings-report-filter --> ir-button
  ir-button --> ir-icons
  ir-monthly-bookings-report --> ir-monthly-bookings-report-filter
  style ir-monthly-bookings-report-filter fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
