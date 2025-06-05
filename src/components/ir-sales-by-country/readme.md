# ir-sales-by-country



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type     | Default     |
| ------------ | ------------ | ----------- | -------- | ----------- |
| `language`   | `language`   |             | `string` | `''`        |
| `p`          | `p`          |             | `string` | `undefined` |
| `propertyid` | `propertyid` |             | `number` | `undefined` |
| `ticket`     | `ticket`     |             | `string` | `''`        |


## Dependencies

### Depends on

- [ir-loading-screen](../ir-loading-screen)
- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-button](../ui/ir-button)
- [ir-sales-filters](ir-sales-filters)
- [ir-sales-table](ir-sales-table)

### Graph
```mermaid
graph TD;
  ir-sales-by-country --> ir-loading-screen
  ir-sales-by-country --> ir-toast
  ir-sales-by-country --> ir-interceptor
  ir-sales-by-country --> ir-button
  ir-sales-by-country --> ir-sales-filters
  ir-sales-by-country --> ir-sales-table
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-sales-filters --> ir-button
  ir-sales-filters --> ir-select
  ir-sales-filters --> ir-range-picker
  ir-sales-filters --> ir-checkbox
  ir-range-picker --> ir-date-picker
  style ir-sales-by-country fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
