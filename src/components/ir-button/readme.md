# ir-button



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description | Type                                                                                            | Default     |
| -------------- | -------------- | ----------- | ----------------------------------------------------------------------------------------------- | ----------- |
| `btn_block`    | `btn_block`    |             | `boolean`                                                                                       | `true`      |
| `btn_color`    | `btn_color`    |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"` | `'primary'` |
| `btn_disabled` | `btn_disabled` |             | `boolean`                                                                                       | `false`     |
| `btn_styles`   | `btn_styles`   |             | `string`                                                                                        | `undefined` |
| `btn_type`     | `btn_type`     |             | `string`                                                                                        | `'button'`  |
| `icon`         | `icon`         |             | `string`                                                                                        | `'ft-save'` |
| `isLoading`    | `is-loading`   |             | `boolean`                                                                                       | `false`     |
| `name`         | `name`         |             | `string`                                                                                        | `undefined` |
| `size`         | `size`         |             | `"lg" \| "md" \| "sm"`                                                                          | `'md'`      |
| `text`         | `text`         |             | `any`                                                                                           | `undefined` |
| `textSize`     | `text-size`    |             | `"lg" \| "md" \| "sm"`                                                                          | `'md'`      |


## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `clickHanlder` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ir-booking-details](../ir-booking-details)
 - [ir-guest-info](../ir-guest-info)
 - [ir-modal](../ir-modal)
 - [ir-pickup](../ir-booking-details/ir-pickup)
 - [ir-room](../ir-booking-details/ir-room)

### Graph
```mermaid
graph TD;
  ir-booking-details --> ir-button
  ir-guest-info --> ir-button
  ir-modal --> ir-button
  ir-pickup --> ir-button
  ir-room --> ir-button
  style ir-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
