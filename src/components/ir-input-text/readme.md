# ir-input-text



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type                                                                                                                 | Default           |
| ----------------- | ------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `LabelAvailable`  | `label-available`  |             | `boolean`                                                                                                            | `true`            |
| `inputStyle`      | `input-style`      |             | `boolean`                                                                                                            | `true`            |
| `inputStyles`     | `input-styles`     |             | `string`                                                                                                             | `''`              |
| `label`           | `label`            |             | `string`                                                                                                             | `'<label>'`       |
| `labelBackground` | `label-background` |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"`                      | `null`            |
| `labelBorder`     | `label-border`     |             | `"danger" \| "dark" \| "info" \| "light" \| "none" \| "primary" \| "secondary" \| "success" \| "theme" \| "warning"` | `'theme'`         |
| `labelColor`      | `label-color`      |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"`                      | `'dark'`          |
| `labelPosition`   | `label-position`   |             | `"center" \| "left" \| "right"`                                                                                      | `'left'`          |
| `labelWidth`      | `label-width`      |             | `1 \| 10 \| 11 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9`                                                              | `3`               |
| `name`            | `name`             |             | `string`                                                                                                             | `undefined`       |
| `placeholder`     | `placeholder`      |             | `string`                                                                                                             | `'<placeholder>'` |
| `readonly`        | `readonly`         |             | `boolean`                                                                                                            | `false`           |
| `required`        | `required`         |             | `boolean`                                                                                                            | `undefined`       |
| `size`            | `size`             |             | `"lg" \| "md" \| "sm"`                                                                                               | `'md'`            |
| `submited`        | `submited`         |             | `boolean`                                                                                                            | `false`           |
| `textSize`        | `text-size`        |             | `"lg" \| "md" \| "sm"`                                                                                               | `'md'`            |
| `type`            | `type`             |             | `string`                                                                                                             | `'text'`          |
| `value`           | `value`            |             | `any`                                                                                                                | `undefined`       |


## Events

| Event        | Description | Type               |
| ------------ | ----------- | ------------------ |
| `textChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ir-general-settings](../old-ir-channel/ir-general-settings)
 - [ir-guest-info](../ir-guest-info)
 - [ir-pickup](../ir-booking-details/ir-pickup)

### Graph
```mermaid
graph TD;
  ir-general-settings --> ir-input-text
  ir-guest-info --> ir-input-text
  ir-pickup --> ir-input-text
  style ir-input-text fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
