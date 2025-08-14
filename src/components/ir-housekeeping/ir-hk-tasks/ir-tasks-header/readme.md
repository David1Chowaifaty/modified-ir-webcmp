# ir-tasks-header



<!-- Auto Generated Below -->


## Events

| Event               | Description | Type                                                         |
| ------------------- | ----------- | ------------------------------------------------------------ |
| `headerButtonPress` |             | `CustomEvent<{ name: "cleaned" \| "export" \| "archive"; }>` |


## Dependencies

### Used by

 - [ir-tasks-table](../ir-tasks-table)

### Depends on

- [ir-input-text](../../../ui/ir-input-text)
- [ir-icons](../../../ui/ir-icons)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-tasks-header --> ir-input-text
  ir-tasks-header --> ir-icons
  ir-tasks-header --> ir-button
  ir-button --> ir-icons
  ir-tasks-table --> ir-tasks-header
  style ir-tasks-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
