# ir-arrivals-table



<!-- Auto Generated Below -->


## Dependencies

### Used by

 - [ir-arrivals](..)

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
  ir-arrivals-table --> ir-booking-number-cell
  ir-arrivals-table --> ir-booked-by-source-cell
  ir-arrivals-table --> ir-guest-name-cell
  ir-arrivals-table --> ir-unit-cell
  ir-arrivals-table --> ir-dates-cell
  ir-arrivals-table --> ir-balance-cell
  ir-arrivals-table --> ir-actions-cell
  ir-booking-number-cell --> ir-custom-button
  ir-booked-by-source-cell --> ir-custom-button
  ir-unit-cell --> ir-unit-tag
  ir-balance-cell --> ir-custom-button
  ir-actions-cell --> ir-custom-button
  ir-arrivals --> ir-arrivals-table
  style ir-arrivals-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
