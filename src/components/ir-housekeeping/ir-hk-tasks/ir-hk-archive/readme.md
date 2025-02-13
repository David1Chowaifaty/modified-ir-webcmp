# ir-hk-archive



<!-- Auto Generated Below -->


## Dependencies

### Used by

 - [ir-hk-tasks](..)

### Depends on

- [ir-title](../../../ir-title)
- [ir-select](../../../ui/ir-select)
- [igl-date-range](../../../igloo-calendar/igl-date-range)
- [ir-icon](../../../ui/ir-icon)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-hk-archive --> ir-title
  ir-hk-archive --> ir-select
  ir-hk-archive --> igl-date-range
  ir-hk-archive --> ir-icon
  ir-hk-archive --> ir-button
  ir-title --> ir-icon
  igl-date-range --> ir-date-range
  igl-date-range --> ir-date-picker
  igl-date-range --> ir-date-view
  ir-button --> ir-icons
  ir-hk-tasks --> ir-hk-archive
  style ir-hk-archive fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
