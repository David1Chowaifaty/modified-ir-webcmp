# ir-secure-tasks



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type     | Default     |
| --------------- | ---------------- | ----------- | -------- | ----------- |
| `bookingNumber` | `booking-number` |             | `string` | `undefined` |
| `p`             | `p`              |             | `string` | `undefined` |
| `propertyid`    | `propertyid`     |             | `number` | `undefined` |


## Dependencies

### Depends on

- [ir-login](../ir-login)
- [ir-hk-tasks](../ir-housekeeping/ir-hk-tasks)
- [ir-housekeeping](../ir-housekeeping)

### Graph
```mermaid
graph TD;
  ir-secure-tasks --> ir-login
  ir-secure-tasks --> ir-hk-tasks
  ir-secure-tasks --> ir-housekeeping
  ir-login --> ir-interceptor
  ir-login --> ir-toast
  ir-login --> ir-input-text
  ir-login --> ir-icons
  ir-login --> ir-button
  ir-button --> ir-icons
  ir-hk-tasks --> ir-loading-screen
  ir-hk-tasks --> ir-toast
  ir-hk-tasks --> ir-interceptor
  ir-hk-tasks --> ir-tasks-header
  ir-hk-tasks --> ir-tasks-filters
  ir-hk-tasks --> ir-tasks-table
  ir-hk-tasks --> ir-modal
  ir-hk-tasks --> ir-sidebar
  ir-hk-tasks --> ir-hk-archive
  ir-tasks-header --> ir-button
  ir-tasks-filters --> ir-button
  ir-tasks-filters --> ir-select
  ir-tasks-table --> ir-checkbox
  ir-modal --> ir-button
  ir-sidebar --> ir-icon
  ir-hk-archive --> ir-title
  ir-hk-archive --> ir-select
  ir-hk-archive --> igl-date-range
  ir-hk-archive --> ir-button
  ir-title --> ir-icon
  igl-date-range --> ir-date-range
  ir-housekeeping --> ir-loading-screen
  ir-housekeeping --> ir-interceptor
  ir-housekeeping --> ir-toast
  ir-housekeeping --> ir-title
  ir-housekeeping --> ir-select
  ir-housekeeping --> ir-hk-team
  ir-hk-team --> ir-hk-unassigned-units
  ir-hk-team --> ir-hk-user
  ir-hk-team --> ir-title
  ir-hk-team --> ir-icon
  ir-hk-team --> ir-popover
  ir-hk-team --> ir-sidebar
  ir-hk-team --> ir-delete-modal
  ir-hk-unassigned-units --> ir-select
  ir-hk-unassigned-units --> ir-switch
  ir-hk-unassigned-units --> ir-title
  ir-hk-unassigned-units --> ir-button
  ir-hk-user --> ir-title
  ir-hk-user --> ir-input-text
  ir-hk-user --> ir-phone-input
  ir-hk-user --> ir-textarea
  ir-hk-user --> ir-button
  ir-phone-input --> ir-combobox
  ir-delete-modal --> ir-icon
  ir-delete-modal --> ir-select
  ir-delete-modal --> ir-button
  style ir-secure-tasks fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
