# ir-checkbox



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description                                                   | Type      | Default     |
| --------------- | --------------- | ------------------------------------------------------------- | --------- | ----------- |
| `checkboxId`    | `checkbox-id`   | The unique ID of the checkbox element.                        | `string`  | `v4()`      |
| `checked`       | `checked`       | Whether the checkbox is checked.                              | `boolean` | `false`     |
| `disabled`      | `disabled`      | Disables the checkbox when true.                              | `boolean` | `undefined` |
| `indeterminate` | `indeterminate` | Whether the checkbox is in an indeterminate state.            | `boolean` | `undefined` |
| `label`         | `label`         | The label text associated with the checkbox.                  | `string`  | `undefined` |
| `labelClass`    | `label-class`   | CSS class applied to the label element.                       | `string`  | `undefined` |
| `name`          | `name`          | The name attribute of the checkbox, used for form submission. | `string`  | `undefined` |


## Events

| Event         | Description                                        | Type                   |
| ------------- | -------------------------------------------------- | ---------------------- |
| `checkChange` | Emitted when the checkbox's checked state changes. | `CustomEvent<boolean>` |


## Dependencies

### Used by

 - [ir-checkboxes](../ir-checkboxes)
 - [ir-sales-filters](../../ir-sales-by-country/ir-sales-filters)
 - [ir-tasks-table](../../ir-housekeeping/ir-hk-tasks/ir-tasks-table)
 - [ir-weekday-selector](../ir-weekday-selector)

### Graph
```mermaid
graph TD;
  ir-checkboxes --> ir-checkbox
  ir-sales-filters --> ir-checkbox
  ir-tasks-table --> ir-checkbox
  ir-weekday-selector --> ir-checkbox
  style ir-checkbox fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
