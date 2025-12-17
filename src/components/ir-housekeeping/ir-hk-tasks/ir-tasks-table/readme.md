# ir-tasks-table



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default |
| -------- | --------- | ----------- | -------- | ------- |
| `tasks`  | --        |             | `Task[]` | `[]`    |


## Events

| Event                  | Description | Type                                                          |
| ---------------------- | ----------- | ------------------------------------------------------------- |
| `animateCleanedButton` |             | `CustomEvent<null>`                                           |
| `rowSelectChange`      |             | `CustomEvent<Task[]>`                                         |
| `skipSelectedTask`     |             | `CustomEvent<Task>`                                           |
| `sortingChanged`       |             | `CustomEvent<{ field: string; direction: "ASC" \| "DESC"; }>` |


## Dependencies

### Used by

 - [ir-hk-tasks](..)

### Depends on

- [ir-tasks-header](../ir-tasks-header)
- [ir-tasks-card](ir-tasks-card)
- [ir-tasks-table-pagination](ir-tasks-table-pagination)
- [ir-checkbox](../../../ui/ir-checkbox)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-tasks-table --> ir-tasks-header
  ir-tasks-table --> ir-tasks-card
  ir-tasks-table --> ir-tasks-table-pagination
  ir-tasks-table --> ir-checkbox
  ir-tasks-table --> ir-button
  ir-tasks-header --> ir-input-text
  ir-tasks-header --> ir-icons
  ir-tasks-header --> ir-button
  ir-button --> ir-icons
  ir-tasks-card --> ir-button
  ir-tasks-table-pagination --> ir-button
  ir-tasks-table-pagination --> ir-pagination
  ir-pagination --> ir-select
  ir-pagination --> ir-custom-button
  ir-hk-tasks --> ir-tasks-table
  style ir-tasks-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
