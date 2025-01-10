# ir-booking-extra-note



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default     |
| --------- | --------- | ----------- | --------- | ----------- |
| `booking` | --        |             | `Booking` | `undefined` |


## Events

| Event          | Description | Type                   |
| -------------- | ----------- | ---------------------- |
| `closeModal`   |             | `CustomEvent<null>`    |
| `resetbooking` |             | `CustomEvent<Booking>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-title](../../ir-title)
- [ir-textarea](../../ir-textarea)
- [ir-button](../../ir-button)

### Graph
```mermaid
graph TD;
  ir-booking-extra-note --> ir-title
  ir-booking-extra-note --> ir-textarea
  ir-booking-extra-note --> ir-button
  ir-title --> ir-icon
  ir-button --> ir-icons
  ir-booking-details --> ir-booking-extra-note
  style ir-booking-extra-note fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
