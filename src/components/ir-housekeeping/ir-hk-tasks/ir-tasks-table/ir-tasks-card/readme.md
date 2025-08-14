# ir-tasks-card



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type      | Default     |
| ------------- | -------------- | ----------- | --------- | ----------- |
| `isCheckable` | `is-checkable` |             | `boolean` | `undefined` |
| `isSkippable` | `is-skippable` |             | `boolean` | `undefined` |
| `task`        | --             |             | `Task`    | `undefined` |


## Events

| Event               | Description | Type                |
| ------------------- | ----------- | ------------------- |
| `cleanSelectedTask` |             | `CustomEvent<Task>` |
| `skipSelectedTask`  |             | `CustomEvent<Task>` |


## Dependencies

### Used by

 - [ir-tasks-table](..)

### Depends on

- [ir-button](../../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-tasks-card --> ir-button
  ir-button --> ir-icons
  ir-tasks-table --> ir-tasks-card
  style ir-tasks-card fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
