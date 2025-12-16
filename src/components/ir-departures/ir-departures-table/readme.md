# ir-departures-table



<!-- Auto Generated Below -->


## Events

| Event                   | Description | Type                                                     |
| ----------------------- | ----------- | -------------------------------------------------------- |
| `checkoutRoom`          |             | `CustomEvent<{ booking: Booking; identifier: string; }>` |
| `requestPageChange`     |             | `CustomEvent<PaginationChangeEvent>`                     |
| `requestPageSizeChange` |             | `CustomEvent<PaginationChangeEvent>`                     |


## Dependencies

### Used by

 - [ir-departures](..)

### Depends on

- [ir-booking-number-cell](../../table-cells/booking/ir-booking-number-cell)
- [ir-booked-by-cell](../../table-cells/booking/ir-booked-by-cell)
- [ir-guest-name-cell](../../table-cells/booking/ir-guest-name-cell)
- [ir-unit-cell](../../table-cells/booking/ir-unit-cell)
- [ir-dates-cell](../../table-cells/booking/ir-dates-cell)
- [ir-balance-cell](../../table-cells/booking/ir-balance-cell)
- [ir-actions-cell](../../table-cells/booking/ir-actions-cell)
- [ir-custom-button](../../ui/ir-custom-button)
- [ir-empty-state](../../ir-empty-state)
- [ir-pagination](../../ir-pagination)

### Graph
```mermaid
graph TD;
  ir-departures-table --> ir-booking-number-cell
  ir-departures-table --> ir-booked-by-cell
  ir-departures-table --> ir-guest-name-cell
  ir-departures-table --> ir-unit-cell
  ir-departures-table --> ir-dates-cell
  ir-departures-table --> ir-balance-cell
  ir-departures-table --> ir-actions-cell
  ir-departures-table --> ir-custom-button
  ir-departures-table --> ir-empty-state
  ir-departures-table --> ir-pagination
  ir-booking-number-cell --> ir-custom-button
  ir-booked-by-cell --> ir-custom-button
  ir-unit-cell --> ir-unit-tag
  ir-balance-cell --> ir-custom-button
  ir-actions-cell --> ir-custom-button
  ir-pagination --> ir-select
  ir-pagination --> ir-custom-button
  ir-departures --> ir-departures-table
  style ir-departures-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
