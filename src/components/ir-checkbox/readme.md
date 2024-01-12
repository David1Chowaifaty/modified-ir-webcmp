# ir-checkbox



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                  | Default     |
| --------------- | ---------------- | ----------- | --------------------- | ----------- |
| `checked`       | `checked`        |             | `boolean`             | `false`     |
| `disabled`      | `disabled`       |             | `boolean`             | `false`     |
| `label`         | `label`          |             | `string`              | `'<label>'` |
| `labelPosition` | `label-position` |             | `"after" \| "before"` | `'after'`   |
| `name`          | `name`           |             | `string`              | `undefined` |
| `value`         | `value`          |             | `string`              | `undefined` |


## Events

| Event            | Description | Type                                                              |
| ---------------- | ----------- | ----------------------------------------------------------------- |
| `checkboxChange` |             | `CustomEvent<{ name: string; value: string; checked: boolean; }>` |


## Dependencies

### Used by

 - [ir-checkboxes](../ir-checkboxes)

### Graph
```mermaid
graph TD;
  ir-checkboxes --> ir-checkbox
  style ir-checkbox fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
