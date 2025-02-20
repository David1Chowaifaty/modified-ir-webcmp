# ir-label



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute                | Description                                              | Type                                            | Default     |
| --------------------- | ------------------------ | -------------------------------------------------------- | ----------------------------------------------- | ----------- |
| `containerStyle`      | --                       | inline styles for the component container                | `{ [key: string]: string; }`                    | `undefined` |
| `content`             | `content`                | The main text or HTML content to display                 | `string`                                        | `undefined` |
| `display`             | `display`                |                                                          | `"flex" \| "inline"`                            | `'flex'`    |
| `ignoreEmptyContent`  | `ignore-empty-content`   | If true, label will ignore checking for an empty content | `boolean`                                       | `false`     |
| `image`               | --                       | Object representing the image used within the label      | `{ src: string; alt: string; style?: string; }` | `null`      |
| `imageStyle`          | `image-style`            | Additional CSS classes or style for the image            | `string`                                        | `''`        |
| `isCountryImage`      | `is-country-image`       | Renders a country-type image style (vs. a 'logo')        | `boolean`                                       | `false`     |
| `labelText`           | `label-text`             | The text to display as the label's title                 | `string`                                        | `undefined` |
| `placeholder`         | `placeholder`            | Placeholder text to display if content is empty          | `string`                                        | `undefined` |
| `renderContentAsHtml` | `render-content-as-html` | If true, will render `content` as HTML                   | `boolean`                                       | `false`     |


## Dependencies

### Used by

 - [igl-booking-event-hover](../../igloo-calendar/igl-booking-event-hover)
 - [ir-ota-service](../../ir-booking-details/ir-ota-services/ir-ota-service)
 - [ir-payment-details](../../ir-booking-details/ir-payment-details)
 - [ir-reservation-information](../../ir-booking-details/ir-reservation-information)
 - [ir-room](../../ir-booking-details/ir-room)

### Graph
```mermaid
graph TD;
  igl-booking-event-hover --> ir-label
  ir-ota-service --> ir-label
  ir-payment-details --> ir-label
  ir-reservation-information --> ir-label
  ir-room --> ir-label
  style ir-label fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
