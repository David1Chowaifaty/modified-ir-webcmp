# ir-reservation-information



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute | Description | Type         | Default     |
| ----------- | --------- | ----------- | ------------ | ----------- |
| `booking`   | --        |             | `Booking`    | `undefined` |
| `countries` | --        |             | `ICountry[]` | `undefined` |


## Events

| Event         | Description | Type                                                                 |
| ------------- | ----------- | -------------------------------------------------------------------- |
| `openSidebar` |             | `CustomEvent<{ type: BookingDetailsSidebarEvents; payload?: any; }>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-label](../../ui/ir-label)
- [ir-custom-button](../../ui/ir-custom-button)
- [ota-label](../../ui/ota-label)
- [ir-booking-extra-note](../ir-booking-extra-note)
- [ir-booking-company-form](../ir-booking-company-form)

### Graph
```mermaid
graph TD;
  ir-reservation-information --> ir-label
  ir-reservation-information --> ir-custom-button
  ir-reservation-information --> ota-label
  ir-reservation-information --> ir-booking-extra-note
  ir-reservation-information --> ir-booking-company-form
  ir-booking-extra-note --> ir-dialog
  ir-booking-extra-note --> ir-custom-button
  ir-booking-company-form --> ir-dialog
  ir-booking-company-form --> ir-custom-input
  ir-booking-company-form --> ir-custom-button
  ir-booking-details --> ir-reservation-information
  style ir-reservation-information fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
