# ir-button

<!-- Auto Generated Below -->


## Properties

| Property                   | Attribute                     | Description                                                                      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Default     |
| -------------------------- | ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `btnStyle`                 | --                            | Custom inline styles for the button element.                                     | `{ [key: string]: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `undefined` |
| `btn_block`                | `btn_block`                   | Whether the button should expand to the full width of its container.             | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `true`      |
| `btn_color`                | `btn_color`                   | The color theme of the button.                                                   | `"danger" \| "dark" \| "info" \| "light" \| "link" \| "outline" \| "primary" \| "secondary" \| "success" \| "warning"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `'primary'` |
| `btn_disabled`             | `btn_disabled`                | Disables the button when set to true.                                            | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false`     |
| `btn_id`                   | `btn_id`                      | A unique identifier for the button instance.                                     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `v4()`      |
| `btn_styles`               | `btn_styles`                  | Additional custom class names for the button.                                    | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `undefined` |
| `btn_type`                 | `btn_type`                    | The button type attribute (`button`, `submit`, or `reset`).                      | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `'button'`  |
| `iconPosition`             | `icon-position`               | Position of the icon relative to the button text.                                | `"left" \| "right"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `'left'`    |
| `icon_name`                | `icon_name`                   | The name of the icon to display.                                                 | `"print" \| "key" \| "search" \| "email" \| "save" \| "check" \| "calendar" \| "note" \| "user" \| "danger" \| "clock" \| "heart-fill" \| "envelope-circle-check" \| "bell" \| "burger_menu" \| "home" \| "xmark" \| "minus" \| "heart" \| "user_group" \| "arrow_right" \| "arrow_left" \| "circle_info" \| "xmark-fill" \| "globe" \| "facebook" \| "twitter" \| "whatsapp" \| "instagram" \| "youtube" \| "angle_left" \| "circle_check" \| "eraser" \| "file" \| "edit" \| "trash" \| "plus" \| "reciept" \| "menu_list" \| "credit_card" \| "closed_eye" \| "open_eye" \| "server" \| "double_caret_left" \| "square_plus" \| "angles_left" \| "angle_right" \| "angles_right" \| "outline_user" \| "unlock" \| "circle_plus" \| "arrow-right-from-bracket" \| "calendar-xmark"` | `undefined` |
| `icon_style`               | `icon_style`                  | Custom style object for the icon.                                                | `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `undefined` |
| `isLoading`                | `is-loading`                  | Displays a loading indicator when true and disables the button.                  | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false`     |
| `labelStyle`               | --                            | Custom inline styles for the label/text inside the button.                       | `{ [key: string]: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `undefined` |
| `name`                     | `name`                        | The name of the button, used for identification purposes.                        | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `undefined` |
| `renderContentAsHtml`      | `render-content-as-html`      | If true, renders the text property as raw HTML inside the button.                | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false`     |
| `size`                     | `size`                        | The size of the button.                                                          | `"lg" \| "md" \| "sm"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `'md'`      |
| `text`                     | `text`                        | The text content displayed inside the button.                                    | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `undefined` |
| `textSize`                 | `text-size`                   | The size of the text inside the button.                                          | `"lg" \| "md" \| "sm"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `'md'`      |
| `variant`                  | `variant`                     | Visual variant of the button: either standard (`default`) or icon-only (`icon`). | `"default" \| "icon"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `'default'` |
| `visibleBackgroundOnHover` | `visible-background-on-hover` | If true, applies a visible background when hovered.                              | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false`     |


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
 - [igl-book-property-footer](../../igloo-calendar/igl-book-property/igl-book-property-footer)
 - [igl-book-property-header](../../igloo-calendar/igl-book-property/igl-book-property-header)
 - [igl-booking-event-hover](../../igloo-calendar/igl-booking-event-hover)
 - [igl-bulk-stop-sale](../../igloo-calendar/igl-bulk-stop-sale)
 - [igl-cal-header](../../igloo-calendar/igl-cal-header)
 - [igl-tba-booking-view](../../igloo-calendar/igl-to-be-assigned/igl-tba-booking-view)
 - [igl-to-be-assigned](../../igloo-calendar/igl-to-be-assigned)
 - [ir-booking-details](../../ir-booking-details)
 - [ir-booking-extra-note](../../ir-booking-details/ir-booking-extra-note)
 - [ir-booking-header](../../ir-booking-details/ir-booking-header)
 - [ir-booking-listing](../../ir-booking-listing)
 - [ir-channel](../../ir-channel)
 - [ir-channel-editor](../../ir-channel/ir-channel-editor)
 - [ir-channel-mapping](../../ir-channel/ir-channel-mapping)
 - [ir-delete-modal](../../ir-housekeeping/ir-delete-modal)
 - [ir-extra-service](../../ir-booking-details/ir-extra-services/ir-extra-service)
 - [ir-extra-service-config](../../ir-booking-details/ir-extra-services/ir-extra-service-config)
 - [ir-guest-info](../../ir-guest-info)
 - [ir-hk-archive](../../ir-housekeeping/ir-hk-tasks/ir-hk-archive)
 - [ir-hk-team](../../ir-housekeeping/ir-hk-team)
 - [ir-hk-unassigned-units](../../ir-housekeeping/ir-hk-unassigned-units)
 - [ir-hk-user](../../ir-housekeeping/ir-hk-user)
 - [ir-listing-header](../../ir-booking-listing/ir-listing-header)
 - [ir-listing-modal](../../ir-booking-listing/ir-listing-modal)
 - [ir-login](../../ir-login)
 - [ir-modal](../ir-modal)
 - [ir-option-details](../../ir-payment-option/ir-option-details)
 - [ir-otp-modal](../../ir-otp-modal)
 - [ir-payment-actions](../../ir-booking-details/ir-payment-details/ir-payment-actions)
 - [ir-payment-details](../../ir-booking-details/ir-payment-details)
 - [ir-payment-option](../../ir-payment-option)
 - [ir-pickup](../../ir-booking-details/ir-pickup)
 - [ir-pickup-view](../../ir-booking-details/ir-pickup-view)
 - [ir-reservation-information](../../ir-booking-details/ir-reservation-information)
 - [ir-reset-password](../../ir-reset-password)
 - [ir-room](../../ir-booking-details/ir-room)
 - [ir-room-guests](../../ir-booking-details/ir-room-guests)
 - [ir-room-nights](../../igloo-calendar/ir-room-nights)
 - [ir-sales-by-country](../../ir-sales-by-country)
 - [ir-sales-filters](../../ir-sales-by-country/ir-sales-filters)
 - [ir-tasks-filters](../../ir-housekeeping/ir-hk-tasks/ir-tasks-filters)
 - [ir-tasks-header](../../ir-housekeeping/ir-hk-tasks/ir-tasks-header)
 - [ir-user-form-panel](../../ir-user-management/ir-user-form-panel)

### Depends on

- [ir-icons](../ir-icons)

### Graph
```mermaid
graph TD;
  ir-button --> ir-icons
  igl-book-property --> ir-button
  igl-book-property-footer --> ir-button
  igl-book-property-header --> ir-button
  igl-booking-event-hover --> ir-button
  igl-bulk-stop-sale --> ir-button
  igl-cal-header --> ir-button
  igl-tba-booking-view --> ir-button
  igl-to-be-assigned --> ir-button
  ir-booking-details --> ir-button
  ir-booking-extra-note --> ir-button
  ir-booking-header --> ir-button
  ir-booking-listing --> ir-button
  ir-channel --> ir-button
  ir-channel-editor --> ir-button
  ir-channel-mapping --> ir-button
  ir-delete-modal --> ir-button
  ir-extra-service --> ir-button
  ir-extra-service-config --> ir-button
  ir-guest-info --> ir-button
  ir-hk-archive --> ir-button
  ir-hk-team --> ir-button
  ir-hk-unassigned-units --> ir-button
  ir-hk-user --> ir-button
  ir-listing-header --> ir-button
  ir-listing-modal --> ir-button
  ir-login --> ir-button
  ir-modal --> ir-button
  ir-option-details --> ir-button
  ir-otp-modal --> ir-button
  ir-payment-actions --> ir-button
  ir-payment-details --> ir-button
  ir-payment-option --> ir-button
  ir-pickup --> ir-button
  ir-pickup-view --> ir-button
  ir-reservation-information --> ir-button
  ir-reset-password --> ir-button
  ir-room --> ir-button
  ir-room-guests --> ir-button
  ir-room-nights --> ir-button
  ir-sales-by-country --> ir-button
  ir-sales-filters --> ir-button
  ir-tasks-filters --> ir-button
  ir-tasks-header --> ir-button
  ir-user-form-panel --> ir-button
  style ir-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
