# ir-booking-listing-mobile-card



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description | Type                                                            | Default     |
| -------------------- | ---------------------- | ----------- | --------------------------------------------------------------- | ----------- |
| `booking`            | --                     |             | `Booking`                                                       | `undefined` |
| `extraServicesLabel` | `extra-services-label` |             | `string`                                                        | `undefined` |
| `lastManipulation`   | --                     |             | `{ user: string; date: string; hour: string; minute: string; }` | `undefined` |
| `totalPersons`       | `total-persons`        |             | `number`                                                        | `undefined` |


## Events

| Event                 | Description | Type                                                         |
| --------------------- | ----------- | ------------------------------------------------------------ |
| `irBookingCardAction` |             | `CustomEvent<{ action: IrActionButton; booking: Booking; }>` |


## Dependencies

### Used by

 - [ir-booking-listing-table](../ir-booking-listing-table)

### Depends on

- [ir-unit-cell](../../table-cells/booking/ir-unit-cell)
- [ir-booking-number-cell](../../table-cells/booking/ir-booking-number-cell)
- [ir-status-activity-cell](../../table-cells/booking/ir-status-activity-cell)
- [ir-booked-by-cell](../../table-cells/booking/ir-booked-by-cell)
- [ir-booked-on-cell](../../table-cells/booking/ir-booked-on-cell)
- [ir-dates-cell](../../table-cells/booking/ir-dates-cell)
- [ir-balance-cell](../../table-cells/booking/ir-balance-cell)
- [ir-custom-button](../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-booking-listing-mobile-card --> ir-unit-cell
  ir-booking-listing-mobile-card --> ir-booking-number-cell
  ir-booking-listing-mobile-card --> ir-status-activity-cell
  ir-booking-listing-mobile-card --> ir-booked-by-cell
  ir-booking-listing-mobile-card --> ir-booked-on-cell
  ir-booking-listing-mobile-card --> ir-dates-cell
  ir-booking-listing-mobile-card --> ir-balance-cell
  ir-booking-listing-mobile-card --> ir-custom-button
  ir-unit-cell --> ir-unit-tag
  ir-booking-number-cell --> ir-custom-button
  ir-status-activity-cell --> ir-booking-status-tag
  ir-booked-by-cell --> ir-custom-button
  ir-balance-cell --> ir-custom-button
  ir-booking-listing-table --> ir-booking-listing-mobile-card
  style ir-booking-listing-mobile-card fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
