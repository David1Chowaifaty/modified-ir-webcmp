# ir-modal



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                  | Description                                                                   | Type                                                                                            | Default         |
| ----------------------- | -------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------- |
| `autoClose`             | `auto-close`               | If true, the modal automatically closes after confirm/cancel actions.         | `boolean`                                                                                       | `true`          |
| `btnPosition`           | `btn-position`             | Horizontal alignment of the footer buttons.                                   | `"center" \| "left" \| "right"`                                                                 | `'right'`       |
| `icon`                  | `icon`                     | Icon name to render next to the title (if `iconAvailable` is true).           | `string`                                                                                        | `''`            |
| `iconAvailable`         | `icon-available`           | Whether an icon should be displayed next to the title.                        | `boolean`                                                                                       | `false`         |
| `isLoading`             | `is-loading`               | Whether the modal is in a loading state, disabling interaction.               | `boolean`                                                                                       | `false`         |
| `isMiddleButtonLoading` | `is-middle-button-loading` | Whether the modal middle button is in a loading state, disabling interaction. | `boolean`                                                                                       | `false`         |
| `item`                  | `item`                     | Payload object to pass along with confirm/cancel events.                      | `any`                                                                                           | `{}`            |
| `leftBtnActive`         | `left-btn-active`          | Whether the left (cancel/close) button is visible.                            | `boolean`                                                                                       | `true`          |
| `leftBtnColor`          | `left-btn-color`           | Color theme of the left button.                                               | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"` | `'secondary'`   |
| `leftBtnText`           | `left-btn-text`            | Text displayed on the left (cancel/close) button.                             | `string`                                                                                        | `'Close'`       |
| `middleBtnActive`       | `middle-btn-active`        | Whether the middle (tertiary) button is visible.                              | `boolean`                                                                                       | `false`         |
| `middleBtnColor`        | `middle-btn-color`         | Color theme of the middle (tertiary) button.                                  | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"` | `'info'`        |
| `middleBtnText`         | `middle-btn-text`          | Text displayed on the middle (tertiary) button.                               | `string`                                                                                        | `'More'`        |
| `modalBody`             | `modal-body`               | The main content text shown in the modal body.                                | `string`                                                                                        | `'Modal Body'`  |
| `modalTitle`            | `modal-title`              | The title text displayed in the modal header.                                 | `string`                                                                                        | `'Modal Title'` |
| `rightBtnActive`        | `right-btn-active`         | Whether the right (confirm) button is visible.                                | `boolean`                                                                                       | `true`          |
| `rightBtnColor`         | `right-btn-color`          | Color theme of the right button.                                              | `"danger" \| "dark" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning"` | `'primary'`     |
| `rightBtnText`          | `right-btn-text`           | Text displayed on the right (confirm) button.                                 | `string`                                                                                        | `'Confirm'`     |
| `showTitle`             | `show-title`               | Controls whether the modal title is rendered.                                 | `boolean`                                                                                       | `undefined`     |


## Events

| Event          | Description                                                                         | Type               |
| -------------- | ----------------------------------------------------------------------------------- | ------------------ |
| `cancelModal`  | Fired when the cancel (left) button or backdrop is clicked.                         | `CustomEvent<any>` |
| `confirmModal` | Fired when the confirm (right) button is clicked. Emits the current `item` value.   | `CustomEvent<any>` |
| `middleModal`  | Fired when the middle (tertiary) button is clicked. Emits the current `item` value. | `CustomEvent<any>` |


## Methods

### `closeModal() => Promise<void>`

Closes the modal.

#### Returns

Type: `Promise<void>`



### `openModal() => Promise<void>`

Opens the modal.

Example:
```ts
const modal = document.querySelector('ir-modal');
modal.openModal();
```

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [igl-cal-body](../../igloo-calendar/igl-cal-body)
 - [igloo-calendar](../../igloo-calendar)
 - [ir-channel](../../ir-channel)
 - [ir-hk-tasks](../../ir-housekeeping/ir-hk-tasks)
 - [ir-housekeeping](../../ir-housekeeping)
 - [ir-user-management-table](../../ir-user-management/ir-user-management-table)

### Depends on

- [ir-button](../ir-button)

### Graph
```mermaid
graph TD;
  ir-modal --> ir-button
  ir-button --> ir-icons
  igl-cal-body --> ir-modal
  igloo-calendar --> ir-modal
  ir-channel --> ir-modal
  ir-hk-tasks --> ir-modal
  ir-housekeeping --> ir-modal
  ir-user-management-table --> ir-modal
  style ir-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
