# ir-tasks-header



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type      | Default |
| ------------------ | -------------------- | ----------- | --------- | ------- |
| `isCleanedEnabled` | `is-cleaned-enabled` |             | `boolean` | `false` |


## Events

| Event               | Description | Type                                            |
| ------------------- | ----------- | ----------------------------------------------- |
| `headerButtonPress` |             | `CustomEvent<{ name: "cleaned" \| "export"; }>` |


## Dependencies

### Used by

 - [ir-hk-tasks](..)

### Depends on

- [ir-button](../../../ir-button)

### Graph
```mermaid
graph TD;
  ir-tasks-header --> ir-button
  ir-button --> ir-icons
  ir-hk-tasks --> ir-tasks-header
  style ir-tasks-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
