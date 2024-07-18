# ir-label



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Default     |
| ------------ | ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `country`    | `country`     |             | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `false`     |
| `iconShown`  | `icon-shown`  |             | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `false`     |
| `icon_name`  | `icon_name`   |             | `"print" \| "save" \| "check" \| "user" \| "search" \| "danger" \| "clock" \| "bell" \| "burger_menu" \| "home" \| "xmark" \| "minus" \| "heart" \| "user_group" \| "arrow_right" \| "arrow_left" \| "circle_info" \| "calendar" \| "globe" \| "facebook" \| "twitter" \| "whatsapp" \| "instagram" \| "youtube" \| "angle_left" \| "circle_check" \| "eraser" \| "file" \| "edit" \| "trash" \| "plus" \| "reciept" \| "menu_list" \| "credit_card" \| "closed_eye" \| "open_eye"` | `'edit'`    |
| `icon_style` | `icon_style`  |             | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `undefined` |
| `image`      | --            |             | `{ src: string; alt: string; style?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                     | `undefined` |
| `imageStyle` | `image-style` |             | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `''`        |
| `label`      | `label`       |             | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `undefined` |
| `value`      | `value`       |             | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `undefined` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `editSidebar` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ir-booking-details](../ir-booking-details)
 - [ir-room](../ir-booking-details/ir-room)

### Depends on

- [ir-button](../ir-button)

### Graph
```mermaid
graph TD;
  ir-label --> ir-button
  ir-button --> ir-icons
  ir-booking-details --> ir-label
  ir-room --> ir-label
  style ir-label fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
