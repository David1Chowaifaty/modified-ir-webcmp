# ir-reservation-information



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute | Description | Type         | Default     |
| ----------- | --------- | ----------- | ------------ | ----------- |
| `booking`   | --        |             | `Booking`    | `undefined` |
| `countries` | --        |             | `ICountry[]` | `undefined` |


## Events

| Event         | Description | Type                                                                     |
| ------------- | ----------- | ------------------------------------------------------------------------ |
| `openSidebar` |             | `CustomEvent<{ type: BookingDetailsSidebarEvents; payload?: unknown; }>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-label](../../ui/ir-label)
- [ir-button](../../ir-button)
- [ota-label](../../ota-label)

### Graph
```mermaid
graph TD;
  ir-reservation-information --> ir-label
  ir-reservation-information --> ir-button
  ir-reservation-information --> ota-label
  ir-button --> ir-icons
  ir-booking-details --> ir-reservation-information
  style ir-reservation-information fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
