# ir-input-text



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type                                                                                                                 | Default           |
| ----------------- | ------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `LabelAvailable`  | `label-available`  |             | `boolean`                                                                                                            | `true`            |
| `disabled`        | `disabled`         |             | `boolean`                                                                                                            | `false`           |
| `error`           | `error`            |             | `boolean`                                                                                                            | `false`           |
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
| `variant`         | `variant`          |             | `"default" \| "icon"`                                                                                                | `'default'`       |


## Events

| Event        | Description | Type                      |
| ------------ | ----------- | ------------------------- |
| `inputBlur`  |             | `CustomEvent<FocusEvent>` |
| `textChange` |             | `CustomEvent<any>`        |


## Dependencies

### Used by

 - [ir-guest-info](../../ir-guest-info)
 - [ir-hk-user](../../ir-housekeeping/ir-hk-user)
 - [ir-listing-header](../../ir-booking-listing/ir-listing-header)
 - [ir-login](../../ir-login)
 - [ir-option-details](../../ir-payment-option/ir-option-details)
 - [ir-pickup](../../ir-booking-details/ir-pickup)

### Graph
```mermaid
graph TD;
  ir-guest-info --> ir-input-text
  ir-hk-user --> ir-input-text
  ir-listing-header --> ir-input-text
  ir-login --> ir-input-text
  ir-option-details --> ir-input-text
  ir-pickup --> ir-input-text
  style ir-input-text fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
