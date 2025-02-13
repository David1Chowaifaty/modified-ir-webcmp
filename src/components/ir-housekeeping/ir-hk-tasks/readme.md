# ir-hk-tasks



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type     | Default     |
| ------------ | ------------ | ----------- | -------- | ----------- |
| `language`   | `language`   |             | `string` | `''`        |
| `p`          | `p`          |             | `string` | `undefined` |
| `propertyid` | `propertyid` |             | `number` | `undefined` |
| `ticket`     | `ticket`     |             | `string` | `''`        |


## Events

| Event                  | Description | Type                |
| ---------------------- | ----------- | ------------------- |
| `clearSelectedHkTasks` |             | `CustomEvent<void>` |


## Dependencies

### Depends on

- [ir-loading-screen](../../ir-loading-screen)
- [ir-toast](../../ui/ir-toast)
- [ir-interceptor](../../ir-interceptor)
- [ir-tasks-header](ir-tasks-header)
- [ir-tasks-filters](ir-tasks-filters)
- [ir-tasks-table](ir-tasks-table)
- [ir-modal](../../ui/ir-modal)
- [ir-sidebar](../../ui/ir-sidebar)
- [ir-hk-archive](ir-hk-archive)

### Graph
```mermaid
graph TD;
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
  ir-button --> ir-icons
  ir-tasks-filters --> ir-button
  ir-tasks-filters --> ir-select
  ir-tasks-table --> ir-checkbox
  ir-modal --> ir-button
  ir-sidebar --> ir-icon
  ir-hk-archive --> ir-title
  ir-hk-archive --> ir-select
  ir-hk-archive --> igl-date-range
  ir-hk-archive --> ir-icon
  ir-hk-archive --> ir-button
  ir-title --> ir-icon
  igl-date-range --> ir-date-range
  igl-date-range --> ir-date-picker
  igl-date-range --> ir-date-view
  style ir-hk-tasks fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
