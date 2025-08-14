# ir-icons

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description                                                                                                                    | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Default     |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `color`        | `color`          | Sets the `color` attribute on the `<svg>` element. Accepts any valid CSS color string.                                         | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `undefined` |
| `name`         | `name`           | The name of the icon to render. Must match a key from the imported `icons` map.  Example: ```tsx <ir-icons name="check" /> ``` | `"print" \| "key" \| "angle-down" \| "clock" \| "check" \| "heart-fill" \| "envelope-circle-check" \| "danger" \| "bell" \| "burger_menu" \| "home" \| "xmark" \| "minus" \| "user" \| "heart" \| "user_group" \| "search" \| "arrow_right" \| "arrow_left" \| "circle_info" \| "calendar" \| "xmark-fill" \| "globe" \| "facebook" \| "twitter" \| "whatsapp" \| "instagram" \| "youtube" \| "angle_left" \| "circle_check" \| "eraser" \| "file" \| "edit" \| "trash" \| "plus" \| "reciept" \| "menu_list" \| "save" \| "credit_card" \| "closed_eye" \| "open_eye" \| "server" \| "double_caret_left" \| "square_plus" \| "angles_left" \| "angle_right" \| "angles_right" \| "outline_user" \| "unlock" \| "circle_plus" \| "arrow-right-from-bracket" \| "note" \| "email" \| "calendar-xmark" \| "arrow-trend-up" \| "hotel" \| "arrow-trend-down" \| "angle-up"` | `undefined` |
| `svgClassName` | `svg-class-name` | Additional CSS class applied to the `<svg>` element. Can be used for sizing, positioning, etc.                                 | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `undefined` |


## Dependencies

### Used by

 - [ac-pages-menu](../../ac-pages-menu)
 - [ir-booking-listing](../../ir-booking-listing)
 - [ir-button](../ir-button)
 - [ir-channel-general](../../ir-channel/ir-channel-general)
 - [ir-login](../../ir-login)
 - [ir-notifications](../../ir-notifications)
 - [ir-payment-option](../../ir-payment-option)
 - [ir-report-stats-card](../../ir-monthly-bookings-report/ir-report-stats-card)
 - [ir-reservation-information](../../ir-booking-details/ir-reservation-information)
 - [ir-tasks-header](../../ir-housekeeping/ir-hk-tasks/ir-tasks-header)
 - [requirement-check](../../ir-password-validator/requirement-check)

### Graph
```mermaid
graph TD;
  ac-pages-menu --> ir-icons
  ir-booking-listing --> ir-icons
  ir-button --> ir-icons
  ir-channel-general --> ir-icons
  ir-login --> ir-icons
  ir-notifications --> ir-icons
  ir-payment-option --> ir-icons
  ir-report-stats-card --> ir-icons
  ir-reservation-information --> ir-icons
  ir-tasks-header --> ir-icons
  requirement-check --> ir-icons
  style ir-icons fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
