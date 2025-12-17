# ir-sales-by-channel



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type                  | Default     |
| ------------ | ------------ | ----------- | --------------------- | ----------- |
| `language`   | `language`   |             | `string`              | `''`        |
| `mode`       | `mode`       |             | `"mpo" \| "property"` | `undefined` |
| `p`          | `p`          |             | `string`              | `undefined` |
| `propertyid` | `propertyid` |             | `string`              | `undefined` |
| `ticket`     | `ticket`     |             | `string`              | `''`        |


## Dependencies

### Used by

 - [ir-secure-tasks](../ir-secure-tasks)

### Depends on

- [ir-loading-screen](../ir-loading-screen)
- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-button](../ui/ir-button)
- [ir-sales-by-channel-filters](ir-sales-by-channel-filters)
- [ir-sales-by-channel-table](ir-sales-by-channel-table)

### Graph
```mermaid
graph TD;
  ir-sales-by-channel --> ir-loading-screen
  ir-sales-by-channel --> ir-toast
  ir-sales-by-channel --> ir-interceptor
  ir-sales-by-channel --> ir-button
  ir-sales-by-channel --> ir-sales-by-channel-filters
  ir-sales-by-channel --> ir-sales-by-channel-table
  ir-interceptor --> ir-spinner
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-sales-by-channel-filters --> ir-filters-panel
  ir-sales-by-channel-filters --> ir-select
  ir-sales-by-channel-filters --> ir-m-combobox
  ir-sales-by-channel-filters --> ir-range-picker
  ir-sales-by-channel-filters --> ir-checkbox
  ir-filters-panel --> ir-button
  ir-range-picker --> ir-date-picker
  ir-sales-by-channel-table --> ir-progress-indicator
  ir-sales-by-channel-table --> ir-button
  ir-secure-tasks --> ir-sales-by-channel
  style ir-sales-by-channel fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
