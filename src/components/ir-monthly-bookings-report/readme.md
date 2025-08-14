# ir-monthly-bookings-report



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type     | Default     |
| ------------ | ------------ | ----------- | -------- | ----------- |
| `language`   | `language`   |             | `string` | `''`        |
| `p`          | `p`          |             | `string` | `undefined` |
| `propertyid` | `propertyid` |             | `number` | `undefined` |
| `ticket`     | `ticket`     |             | `string` | `''`        |


## Dependencies

### Used by

 - [ir-secure-tasks](../ir-secure-tasks)

### Depends on

- [ir-loading-screen](../ir-loading-screen)
- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-button](../ui/ir-button)
- [ir-report-stats-card](ir-report-stats-card)
- [ir-monthly-bookings-report-filter](ir-monthly-bookings-report-filter)
- [ir-monthly-bookings-report-table](ir-monthly-bookings-report-table)

### Graph
```mermaid
graph TD;
  ir-monthly-bookings-report --> ir-loading-screen
  ir-monthly-bookings-report --> ir-toast
  ir-monthly-bookings-report --> ir-interceptor
  ir-monthly-bookings-report --> ir-button
  ir-monthly-bookings-report --> ir-report-stats-card
  ir-monthly-bookings-report --> ir-monthly-bookings-report-filter
  ir-monthly-bookings-report --> ir-monthly-bookings-report-table
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-report-stats-card --> ir-icons
  ir-monthly-bookings-report-filter --> ir-select
  ir-monthly-bookings-report-filter --> ir-checkbox
  ir-monthly-bookings-report-filter --> ir-button
  ir-monthly-bookings-report-table --> ir-tooltip
  ir-monthly-bookings-report-table --> ir-progress-indicator
  ir-secure-tasks --> ir-monthly-bookings-report
  style ir-monthly-bookings-report fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
