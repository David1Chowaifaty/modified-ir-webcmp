# ir-checkbox



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description | Type      | Default     |
| --------------- | --------------- | ----------- | --------- | ----------- |
| `checkboxId`    | `checkbox-id`   |             | `string`  | `v4()`      |
| `checked`       | `checked`       |             | `boolean` | `false`     |
| `disabled`      | `disabled`      |             | `boolean` | `undefined` |
| `indeterminate` | `indeterminate` |             | `boolean` | `undefined` |
| `label`         | `label`         |             | `string`  | `undefined` |
| `name`          | `name`          |             | `string`  | `undefined` |


## Events

| Event         | Description | Type                   |
| ------------- | ----------- | ---------------------- |
| `checkChange` |             | `CustomEvent<boolean>` |


## Dependencies

### Used by

 - [ir-checkboxes](../ir-checkboxes)
 - [ir-sales-filters](../../ir-sales-by-country/ir-sales-filters)
 - [ir-tasks-table](../../ir-housekeeping/ir-hk-tasks/ir-tasks-table)

### Graph
```mermaid
graph TD;
  ir-checkboxes --> ir-checkbox
  ir-sales-filters --> ir-checkbox
  ir-tasks-table --> ir-checkbox
  style ir-checkbox fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
