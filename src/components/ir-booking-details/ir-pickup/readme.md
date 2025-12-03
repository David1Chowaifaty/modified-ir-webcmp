# ir-pickup



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute           | Description | Type                            | Default     |
| ------------------- | ------------------- | ----------- | ------------------------------- | ----------- |
| `bookingDates`      | --                  |             | `{ from: string; to: string; }` | `undefined` |
| `bookingNumber`     | `booking-number`    |             | `string`                        | `undefined` |
| `defaultPickupData` | --                  |             | `IBookingPickupInfo`            | `undefined` |
| `numberOfPersons`   | `number-of-persons` |             | `number`                        | `0`         |
| `open`              | `open`              |             | `boolean`                       | `undefined` |


## Events

| Event             | Description | Type                |
| ----------------- | ----------- | ------------------- |
| `closeModal`      |             | `CustomEvent<null>` |
| `resetBookingEvt` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-drawer](../../ir-drawer)
- [ir-validator](../../ui/ir-validator)
- [ir-custom-date-picker](../../ir-custom-date-picker)
- [ir-custom-input](../../ui/ir-custom-input)
- [ir-custom-button](../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-pickup --> ir-drawer
  ir-pickup --> ir-validator
  ir-pickup --> ir-custom-date-picker
  ir-pickup --> ir-custom-input
  ir-pickup --> ir-custom-button
  ir-custom-date-picker --> ir-custom-input
  ir-booking-details --> ir-pickup
  style ir-pickup fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
