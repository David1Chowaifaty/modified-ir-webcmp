# ir-departures-table



<!-- Auto Generated Below -->


## Dependencies

### Used by

 - [ir-departures](..)

### Depends on

- [ir-booking-number-cell](../../table-cells/booking/ir-booking-number-cell)
- [ir-booked-by-source-cell](../../table-cells/booking/ir-booked-by-source-cell)
- [ir-guest-name-cell](../../table-cells/booking/ir-guest-name-cell)
- [ir-unit-cell](../../table-cells/booking/ir-unit-cell)
- [ir-dates-cell](../../table-cells/booking/ir-dates-cell)
- [ir-balance-cell](../../table-cells/booking/ir-balance-cell)
- [ir-actions-cell](../../table-cells/booking/ir-actions-cell)

### Graph
```mermaid
graph TD;
  ir-departures-table --> ir-booking-number-cell
  ir-departures-table --> ir-booked-by-source-cell
  ir-departures-table --> ir-guest-name-cell
  ir-departures-table --> ir-unit-cell
  ir-departures-table --> ir-dates-cell
  ir-departures-table --> ir-balance-cell
  ir-departures-table --> ir-actions-cell
  ir-booking-number-cell --> ir-custom-button
  ir-booked-by-source-cell --> ir-custom-button
  ir-unit-cell --> ir-unit-tag
  ir-balance-cell --> ir-custom-button
  ir-actions-cell --> ir-custom-button
  ir-departures --> ir-departures-table
  style ir-departures-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
