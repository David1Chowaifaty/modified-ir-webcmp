# ir-menu-bar-menu



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute | Description                                                                                            | Type      | Default |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------ | --------- | ------- |
| `newBadge` | `new`     | Displays an `ir-new-badge` next to the trigger when set.                                               | `boolean` | `false` |
| `open`     | `open`    | Controls the open state of the dropdown menu. Can be toggled programmatically or via user interaction. | `boolean` | `false` |


## Events

| Event               | Description                                     | Type                   |
| ------------------- | ----------------------------------------------- | ---------------------- |
| `menuBarOpenChange` | Fires whenever the menu's `open` state changes. | `CustomEvent<boolean>` |


## Shadow Parts

| Part              | Description |
| ----------------- | ----------- |
| `"dropdown"`      |             |
| `"new-indicator"` |             |
| `"trigger"`       |             |


## Dependencies

### Depends on

- [ir-new-badge](../../ir-new-badge)

### Graph
```mermaid
graph TD;
  ir-menu-bar-menu --> ir-new-badge
  style ir-menu-bar-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
