# ir-select



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type                                                                                                      | Default     |
| ----------------- | ------------------ | ----------- | --------------------------------------------------------------------------------------------------------- | ----------- |
| `LabelAvailable`  | `label-available`  |             | `boolean`                                                                                                 | `true`      |
| `data`            | --                 |             | `selectOption[]`                                                                                          | `undefined` |
| `firstOption`     | `first-option`     |             | `string`                                                                                                  | `'Select'`  |
| `label`           | `label`            |             | `string`                                                                                                  | `'<label>'` |
| `labelBackground` | `label-background` |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"`           | `'light'`   |
| `labelBorder`     | `label-border`     |             | `"danger" \| "dark" \| "info" \| "light" \| "none" \| "primary" \| "secondary" \| "success" \| "warning"` | `'none'`    |
| `labelColor`      | `label-color`      |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"`           | `'dark'`    |
| `labelPosition`   | `label-position`   |             | `"center" \| "left" \| "right"`                                                                           | `'left'`    |
| `labelWidth`      | `label-width`      |             | `1 \| 10 \| 11 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9`                                                   | `3`         |
| `name`            | `name`             |             | `string`                                                                                                  | `undefined` |
| `required`        | `required`         |             | `boolean`                                                                                                 | `undefined` |
| `selectStyle`     | `select-style`     |             | `boolean`                                                                                                 | `true`      |
| `selectedValue`   | `selected-value`   |             | `any`                                                                                                     | `null`      |
| `size`            | `size`             |             | `"lg" \| "md" \| "sm"`                                                                                    | `'md'`      |
| `submited`        | `submited`         |             | `boolean`                                                                                                 | `false`     |
| `textSize`        | `text-size`        |             | `"lg" \| "md" \| "sm"`                                                                                    | `'md'`      |


## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `selectChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ir-booking-details](../ir-booking-details)
 - [ir-general-settings](../ir-channel/ir-general-settings)
 - [ir-guest-info](../ir-guest-info)
 - [ir-pickup](../ir-booking-details/ir-pickup)

### Graph
```mermaid
graph TD;
  ir-booking-details --> ir-select
  ir-general-settings --> ir-select
  ir-guest-info --> ir-select
  ir-pickup --> ir-select
  style ir-select fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
