# ir-password-validator



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                     | Type     | Default |
| ---------- | ---------- | ------------------------------- | -------- | ------- |
| `password` | `password` | The password string to validate | `string` | `''`    |


## Dependencies

### Used by

 - [ir-hk-user](../ir-housekeeping/ir-hk-user)

### Depends on

- [requirement-check](requirement-check)

### Graph
```mermaid
graph TD;
  ir-password-validator --> requirement-check
  requirement-check --> ir-icons
  ir-hk-user --> ir-password-validator
  style ir-password-validator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
