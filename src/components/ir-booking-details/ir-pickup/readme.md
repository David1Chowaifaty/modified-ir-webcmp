# ir-pickup



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute           | Description | Type                            | Default     |
| ------------------- | ------------------- | ----------- | ------------------------------- | ----------- |
| `bookingDates`      | --                  |             | `{ from: string; to: string; }` | `undefined` |
| `bookingNumber`     | `booking-number`    |             | `string`                        | `undefined` |
| `defaultPickupData` | --                  |             | `IBookingPickupInfo`            | `undefined` |
| `numberOfPersons`   | `number-of-persons` |             | `number`                        | `0`         |


## Events

| Event             | Description | Type                |
| ----------------- | ----------- | ------------------- |
| `closeModal`      |             | `CustomEvent<null>` |
| `resetBookingEvt` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-title](../../ir-title)
- [ir-select](../../ui/ir-select)
- [ir-date-picker](../../ui/ir-date-picker)
- [ir-input-text](../../ui/ir-input-text)
- [ir-price-input](../../ui/ir-price-input)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-pickup --> ir-title
  ir-pickup --> ir-select
  ir-pickup --> ir-date-picker
  ir-pickup --> ir-input-text
  ir-pickup --> ir-price-input
  ir-pickup --> ir-button
  ir-title --> ir-icon
  ir-button --> ir-icons
  ir-booking-details --> ir-pickup
  style ir-pickup fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
