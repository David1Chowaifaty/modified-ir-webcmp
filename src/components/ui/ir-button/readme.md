# ir-button

<!-- Auto Generated Below -->


## Properties

| Property                   | Attribute                     | Description                                                                      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Default     |
| -------------------------- | ----------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `btnStyle`                 | --                            | Custom inline styles for the button element.                                     | `{ [key: string]: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `undefined` |
| `btn_block`                | `btn_block`                   | Whether the button should expand to the full width of its container.             | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `true`      |
| `btn_color`                | `btn_color`                   | The color theme of the button.                                                   | `"danger" \| "dark" \| "info" \| "light" \| "link" \| "outline" \| "primary" \| "secondary" \| "success" \| "warning"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `'primary'` |
| `btn_disabled`             | `btn_disabled`                | Disables the button when set to true.                                            | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `false`     |
| `btn_id`                   | `btn_id`                      | A unique identifier for the button instance.                                     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `v4()`      |
| `btn_styles`               | `btn_styles`                  | Additional custom class names for the button.                                    | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `undefined` |
| `btn_type`                 | `btn_type`                    | The button type attribute (`button`, `submit`, or `reset`).                      | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `'button'`  |
| `iconPosition`             | `icon-position`               | Position of the icon relative to the button text.                                | `"left" \| "right"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `'left'`    |
| `icon_name`                | `icon_name`                   | The name of the icon to display.                                                 | `"angle-down" \| "clock" \| "check" \| "heart-fill" \| "envelope-circle-check" \| "danger" \| "bell" \| "burger_menu" \| "home" \| "xmark" \| "minus" \| "user" \| "heart" \| "user_group" \| "search" \| "arrow_right" \| "arrow_left" \| "circle_info" \| "calendar" \| "xmark-fill" \| "globe" \| "facebook" \| "twitter" \| "whatsapp" \| "instagram" \| "youtube" \| "angle_left" \| "circle_check" \| "eraser" \| "file" \| "edit" \| "trash" \| "plus" \| "reciept" \| "print" \| "menu_list" \| "save" \| "credit_card" \| "closed_eye" \| "open_eye" \| "server" \| "double_caret_left" \| "square_plus" \| "angles_left" \| "angle_right" \| "angles_right" \| "outline_user" \| "key" \| "unlock" \| "circle_plus" \| "arrow-right-from-bracket" \| "note" \| "email" \| "calendar-xmark" \| "arrow-trend-up" \| "hotel" \| "arrow-trend-down" \| "angle-up" \| "ban"` | `undefined` |
| `icon_style`               | `icon_style`                  | Custom style object for the icon.                                                | `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `undefined` |
| `isLoading`                | `is-loading`                  | Displays a loading indicator when true and disables the button.                  | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `false`     |
| `labelStyle`               | --                            | Custom inline styles for the label/text inside the button.                       | `{ [key: string]: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `undefined` |
| `name`                     | `name`                        | The name of the button, used for identification purposes.                        | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `undefined` |
| `renderContentAsHtml`      | `render-content-as-html`      | If true, renders the text property as raw HTML inside the button.                | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `false`     |
| `size`                     | `size`                        | The size of the button.                                                          | `"lg" \| "md" \| "sm"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `'md'`      |
| `text`                     | `text`                        | The text content displayed inside the button.                                    | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `undefined` |
| `textSize`                 | `text-size`                   | The size of the text inside the button.                                          | `"lg" \| "md" \| "sm"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `'md'`      |
| `variant`                  | `variant`                     | Visual variant of the button: either standard (`default`) or icon-only (`icon`). | `"default" \| "icon"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `'default'` |
| `visibleBackgroundOnHover` | `visible-background-on-hover` | If true, applies a visible background when hovered.                              | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `false`     |


## Events

| Event          | Description                                            | Type               |
| -------------- | ------------------------------------------------------ | ------------------ |
| `clickHandler` | Emits a custom click event when the button is clicked. | `CustomEvent<any>` |


## Methods

### `bounce() => Promise<void>`

Triggers a bounce animation on the button.

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [igl-book-property](../../igloo-calendar/igl-book-property)
 - [igl-booking-event-hover](../../igloo-calendar/igl-booking-event-hover)
 - [igl-bulk-block](../../igloo-calendar/igl-bulk-operations/igl-bulk-block)
 - [igl-bulk-stop-sale](../../igloo-calendar/igl-bulk-operations/igl-bulk-stop-sale)
 - [igl-split-booking](../../igloo-calendar/igl-split-booking)
 - [igl-tba-booking-view](../../igloo-calendar/igl-to-be-assigned/igl-tba-booking-view)
 - [igl-to-be-assigned](../../igloo-calendar/igl-to-be-assigned)
 - [ir-booking-email-logs](../../ir-booking-email-logs)
 - [ir-booking-guarantee](../../ir-booking-details/ir-payment-details/ir-booking-guarantee)
 - [ir-channel](../../ir-channel)
 - [ir-channel-editor](../../ir-channel/ir-channel-editor)
 - [ir-channel-mapping](../../ir-channel/ir-channel-mapping)
 - [ir-daily-revenue](../../ir-daily-revenue)
 - [ir-daily-revenue-filters](../../ir-daily-revenue/ir-daily-revenue-filters)
 - [ir-delete-modal](../../ir-housekeeping/ir-delete-modal)
 - [ir-filters-panel](../ir-filters-panel)
 - [ir-financial-actions](../../ir-financial-actions)
 - [ir-financial-filters](../../ir-financial-actions/ir-financial-filters)
 - [ir-financial-table](../../ir-financial-actions/ir-financial-table)
 - [ir-guest-info](../../ir-guest-info)
 - [ir-hk-archive](../../ir-housekeeping/ir-hk-tasks/ir-hk-archive)
 - [ir-hk-team](../../ir-housekeeping/ir-hk-team)
 - [ir-hk-unassigned-units](../../ir-housekeeping/ir-hk-unassigned-units)
 - [ir-hk-user](../../ir-housekeeping/ir-hk-user)
 - [ir-listing-modal](../../ir-booking-listing/ir-listing-modal)
 - [ir-login](../../ir-login)
 - [ir-modal](../ir-modal)
 - [ir-monthly-bookings-report](../../ir-monthly-bookings-report)
 - [ir-monthly-bookings-report-filter](../../ir-monthly-bookings-report/ir-monthly-bookings-report-filter)
 - [ir-notifications](../../ir-notifications)
 - [ir-option-details](../../ir-payment-option/ir-option-details)
 - [ir-otp-modal](../../ir-otp-modal)
 - [ir-payment-action](../../ir-booking-details/ir-payment-details/ir-payment-actions/ir-payment-action)
 - [ir-payment-option](../../ir-payment-option)
 - [ir-reset-password](../../ir-reset-password)
 - [ir-revenue-row-details](../../ir-daily-revenue/ir-revenue-table/ir-revenue-row/ir-revenue-row-details)
 - [ir-room-nights](../../igloo-calendar/ir-room-nights)
 - [ir-sales-by-channel](../../ir-sales-by-channel)
 - [ir-sales-by-channel-table](../../ir-sales-by-channel/ir-sales-by-channel-table)
 - [ir-sales-by-country](../../ir-sales-by-country)
 - [ir-sales-filters](../../ir-sales-by-country/ir-sales-filters)
 - [ir-sales-table](../../ir-sales-by-country/ir-sales-table)
 - [ir-tasks-card](../../ir-housekeeping/ir-hk-tasks/ir-tasks-table/ir-tasks-card)
 - [ir-tasks-filters](../../ir-housekeeping/ir-hk-tasks/ir-tasks-filters)
 - [ir-tasks-header](../../ir-housekeeping/ir-hk-tasks/ir-tasks-header)
 - [ir-tasks-table](../../ir-housekeeping/ir-hk-tasks/ir-tasks-table)
 - [ir-tasks-table-pagination](../../ir-housekeeping/ir-hk-tasks/ir-tasks-table/ir-tasks-table-pagination)
 - [ir-test-cmp](../../ir-test-cmp)
 - [ir-user-form-panel](../../ir-user-management/ir-user-form-panel)

### Depends on

- [ir-icons](../ir-icons)

### Graph
```mermaid
graph TD;
  ir-button --> ir-icons
  igl-book-property --> ir-button
  igl-booking-event-hover --> ir-button
  igl-bulk-block --> ir-button
  igl-bulk-stop-sale --> ir-button
  igl-split-booking --> ir-button
  igl-tba-booking-view --> ir-button
  igl-to-be-assigned --> ir-button
  ir-booking-email-logs --> ir-button
  ir-booking-guarantee --> ir-button
  ir-channel --> ir-button
  ir-channel-editor --> ir-button
  ir-channel-mapping --> ir-button
  ir-daily-revenue --> ir-button
  ir-daily-revenue-filters --> ir-button
  ir-delete-modal --> ir-button
  ir-filters-panel --> ir-button
  ir-financial-actions --> ir-button
  ir-financial-filters --> ir-button
  ir-financial-table --> ir-button
  ir-guest-info --> ir-button
  ir-hk-archive --> ir-button
  ir-hk-team --> ir-button
  ir-hk-unassigned-units --> ir-button
  ir-hk-user --> ir-button
  ir-listing-modal --> ir-button
  ir-login --> ir-button
  ir-modal --> ir-button
  ir-monthly-bookings-report --> ir-button
  ir-monthly-bookings-report-filter --> ir-button
  ir-notifications --> ir-button
  ir-option-details --> ir-button
  ir-otp-modal --> ir-button
  ir-payment-action --> ir-button
  ir-payment-option --> ir-button
  ir-reset-password --> ir-button
  ir-revenue-row-details --> ir-button
  ir-room-nights --> ir-button
  ir-sales-by-channel --> ir-button
  ir-sales-by-channel-table --> ir-button
  ir-sales-by-country --> ir-button
  ir-sales-filters --> ir-button
  ir-sales-table --> ir-button
  ir-tasks-card --> ir-button
  ir-tasks-filters --> ir-button
  ir-tasks-header --> ir-button
  ir-tasks-table --> ir-button
  ir-tasks-table-pagination --> ir-button
  ir-test-cmp --> ir-button
  ir-user-form-panel --> ir-button
  style ir-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
