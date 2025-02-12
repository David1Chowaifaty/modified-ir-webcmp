# ir-select



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description | Type                                                                                                                 | Default     |
| ---------------------- | ------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| `LabelAvailable`       | `label-available`        |             | `boolean`                                                                                                            | `true`      |
| `data`                 | --                       |             | `selectOption[]`                                                                                                     | `undefined` |
| `firstOption`          | `first-option`           |             | `string`                                                                                                             | `'Select'`  |
| `label`                | `label`                  |             | `string`                                                                                                             | `'<label>'` |
| `labelBackground`      | `label-background`       |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"`                      | `null`      |
| `labelBorder`          | `label-border`           |             | `"danger" \| "dark" \| "info" \| "light" \| "none" \| "primary" \| "secondary" \| "success" \| "theme" \| "warning"` | `'theme'`   |
| `labelColor`           | `label-color`            |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"`                      | `'dark'`    |
| `labelPosition`        | `label-position`         |             | `"center" \| "left" \| "right"`                                                                                      | `'left'`    |
| `labelWidth`           | `label-width`            |             | `1 \| 10 \| 11 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9`                                                              | `3`         |
| `name`                 | `name`                   |             | `string`                                                                                                             | `undefined` |
| `required`             | `required`               |             | `boolean`                                                                                                            | `undefined` |
| `selectContainerStyle` | `select-container-style` |             | `string`                                                                                                             | `undefined` |
| `selectStyle`          | `select-style`           |             | `boolean`                                                                                                            | `true`      |
| `selectStyles`         | `select-styles`          |             | `string`                                                                                                             | `undefined` |
| `select_id`            | `select_id`              |             | `string`                                                                                                             | `v4()`      |
| `selectedValue`        | `selected-value`         |             | `any`                                                                                                                | `null`      |
| `showFirstOption`      | `show-first-option`      |             | `boolean`                                                                                                            | `true`      |
| `size`                 | `size`                   |             | `"lg" \| "md" \| "sm"`                                                                                               | `'md'`      |
| `submited`             | `submited`               |             | `boolean`                                                                                                            | `false`     |
| `textSize`             | `text-size`              |             | `"lg" \| "md" \| "sm"`                                                                                               | `'md'`      |


## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `selectChange` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [igl-book-property-header](../igloo-calendar/igl-book-property/igl-book-property-header)
 - [ir-booking-header](../ir-booking-details/ir-booking-header)
 - [ir-booking-listing](../ir-booking-listing)
 - [ir-delete-modal](../ir-housekeeping/ir-delete-modal)
 - [ir-guest-info](../ir-guest-info)
 - [ir-hk-archive](../ir-housekeeping/ir-hk-tasks/ir-hk-archive)
 - [ir-hk-tasks](../ir-housekeeping/ir-hk-tasks)
 - [ir-hk-unassigned-units](../ir-housekeeping/ir-hk-unassigned-units)
 - [ir-listing-header](../ir-booking-listing/ir-listing-header)
 - [ir-listing-modal](../ir-booking-listing/ir-listing-modal)
 - [ir-option-details](../ir-payment-option/ir-option-details)
 - [ir-pickup](../ir-booking-details/ir-pickup)
 - [ir-unit-status](../ir-housekeeping/ir-unit-status)

### Graph
```mermaid
graph TD;
  igl-book-property-header --> ir-select
  ir-booking-header --> ir-select
  ir-booking-listing --> ir-select
  ir-delete-modal --> ir-select
  ir-guest-info --> ir-select
  ir-hk-archive --> ir-select
  ir-hk-tasks --> ir-select
  ir-hk-unassigned-units --> ir-select
  ir-listing-header --> ir-select
  ir-listing-modal --> ir-select
  ir-option-details --> ir-select
  ir-pickup --> ir-select
  ir-unit-status --> ir-select
  style ir-select fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
