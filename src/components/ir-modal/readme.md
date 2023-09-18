# ir-modal



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type                                                                                            | Default         |
| ---------------- | ------------------ | ----------- | ----------------------------------------------------------------------------------------------- | --------------- |
| `btnPosition`    | `btn-position`     |             | `"center" \| "left" \| "right"`                                                                 | `'right'`       |
| `icon`           | `icon`             |             | `string`                                                                                        | `''`            |
| `iconAvailable`  | `icon-available`   |             | `boolean`                                                                                       | `false`         |
| `item`           | `item`             |             | `any`                                                                                           | `{}`            |
| `leftBtnActive`  | `left-btn-active`  |             | `boolean`                                                                                       | `true`          |
| `leftBtnColor`   | `left-btn-color`   |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"` | `'secondary'`   |
| `leftBtnText`    | `left-btn-text`    |             | `string`                                                                                        | `'Confirm'`     |
| `modalBody`      | `modal-body`       |             | `string`                                                                                        | `'Modal Body'`  |
| `modalTitle`     | `modal-title`      |             | `string`                                                                                        | `'Modal Title'` |
| `rightBtnActive` | `right-btn-active` |             | `boolean`                                                                                       | `true`          |
| `rightBtnColor`  | `right-btn-color`  |             | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"` | `'primary'`     |
| `rightBtnText`   | `right-btn-text`   |             | `string`                                                                                        | `'Close'`       |


## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `cancelModal`  |             | `CustomEvent<any>` |
| `confirmModal` |             | `CustomEvent<any>` |


## Methods

### `closeModal() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `openModal() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-channel-manager](../ir-channel/ir-channel-manager)
 - [ir-general-settings](../ir-channel/ir-general-settings)
 - [ir-list-item](../ir-channel/ir-listItems)
 - [ir-payment-details](../ir-booking-details/ir-payment-details)

### Depends on

- [ir-icon](../ir-icon)
- [ir-button](../ir-button)

### Graph
```mermaid
graph TD;
  ir-modal --> ir-icon
  ir-modal --> ir-button
  ir-channel-manager --> ir-modal
  ir-general-settings --> ir-modal
  ir-list-item --> ir-modal
  ir-payment-details --> ir-modal
  style ir-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
