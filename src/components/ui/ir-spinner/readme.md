# ir-spinner



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                           | Type            | Default     |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------- | --------------- | ----------- |
| `borderWidth` | `border-width` | Thickness of the spinner's border. Example: `borderWidth={4}` renders a `4px` or `4rem` thick border. | `number`        | `undefined` |
| `color`       | `color`        | Color of the spinner. Accepts any valid CSS color string.                                             | `string`        | `undefined` |
| `size`        | `size`         | Size of the spinner (diameter). Example: `size={2}` with `unit="rem"` sets spinner to `2rem`.         | `number`        | `undefined` |
| `unit`        | `unit`         | CSS unit used for `size` and `borderWidth`. Can be `'px'` or `'rem'`.                                 | `"px" \| "rem"` | `'rem'`     |


## Dependencies

### Used by

 - [igl-book-property](../../igloo-calendar/igl-book-property)
 - [ir-booking-details](../../ir-booking-details)
 - [ir-events-log](../../ir-booking-details/ir-booking-header/events-log)
 - [ir-guest-info](../../ir-guest-info)
 - [ir-interceptor](../../ir-interceptor)
 - [ir-otp-modal](../../ir-otp-modal)
 - [ir-pms-logs](../../ir-booking-details/ir-booking-header/ir-pms-logs)
 - [ir-room-guests](../../ir-booking-details/ir-room-guests)

### Graph
```mermaid
graph TD;
  igl-book-property --> ir-spinner
  ir-booking-details --> ir-spinner
  ir-events-log --> ir-spinner
  ir-guest-info --> ir-spinner
  ir-interceptor --> ir-spinner
  ir-otp-modal --> ir-spinner
  ir-pms-logs --> ir-spinner
  ir-room-guests --> ir-spinner
  style ir-spinner fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
