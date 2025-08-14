# ir-progress-indicator



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                                                         | Type                       | Default     |
| ------------ | ------------ | ----------------------------------------------------------------------------------- | -------------------------- | ----------- |
| `color`      | `color`      | The color variant of the progress bar. Options: - 'primary' (default) - 'secondary' | `"primary" \| "secondary"` | `'primary'` |
| `percentage` | `percentage` | The percentage value to display and fill the progress bar. Example: "75%"           | `string`                   | `undefined` |


## Dependencies

### Used by

 - [ir-monthly-bookings-report-table](../../ir-monthly-bookings-report/ir-monthly-bookings-report-table)
 - [ir-sales-table](../../ir-sales-by-country/ir-sales-table)

### Graph
```mermaid
graph TD;
  ir-monthly-bookings-report-table --> ir-progress-indicator
  ir-sales-table --> ir-progress-indicator
  style ir-progress-indicator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
