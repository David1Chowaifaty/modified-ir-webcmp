# ir-hk-unassigned-units



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type            | Default |
| -------- | --------- | ----------- | --------------- | ------- |
| `user`   | --        |             | `IHouseKeepers` | `null`  |


## Events

| Event          | Description | Type                |
| -------------- | ----------- | ------------------- |
| `closeSideBar` |             | `CustomEvent<null>` |
| `resetData`    |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-hk-team](../ir-hk-team)

### Depends on

- [ir-select](../../ui/ir-select)
- [ir-switch](../../ui/ir-switch)
- [ir-title](../../ir-title)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-hk-unassigned-units --> ir-select
  ir-hk-unassigned-units --> ir-switch
  ir-hk-unassigned-units --> ir-title
  ir-hk-unassigned-units --> ir-button
  ir-title --> ir-icon
  ir-button --> ir-icons
  ir-hk-team --> ir-hk-unassigned-units
  style ir-hk-unassigned-units fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
