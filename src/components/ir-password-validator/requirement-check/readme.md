# requirement-check



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute  | Description                                                             | Type      | Default |
| --------- | ---------- | ----------------------------------------------------------------------- | --------- | ------- |
| `isValid` | `is-valid` | Whether this requirement has been satisfied (true/false).               | `boolean` | `false` |
| `text`    | `text`     | The requirement text to display (e.g. "At least one lowercase letter"). | `string`  | `''`    |


## Dependencies

### Used by

 - [ir-password-validator](..)

### Depends on

- [ir-icons](../../ui/ir-icons)

### Graph
```mermaid
graph TD;
  requirement-check --> ir-icons
  ir-password-validator --> requirement-check
  style requirement-check fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
