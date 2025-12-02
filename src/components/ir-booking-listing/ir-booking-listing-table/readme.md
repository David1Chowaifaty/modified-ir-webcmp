# ir-booking-listing-table



<!-- Auto Generated Below -->


## Events

| Event                   | Description | Type                                 |
| ----------------------- | ----------- | ------------------------------------ |
| `openBookingDetails`    |             | `CustomEvent<string>`                |
| `requestPageChange`     |             | `CustomEvent<PaginationChangeEvent>` |
| `requestPageSizeChange` |             | `CustomEvent<PaginationChangeEvent>` |


## Dependencies

### Used by

 - [ir-booking-listing](..)

### Depends on

- [ir-booking-number-cell](../../table-cells/booking/ir-booking-number-cell)
- [ir-booked-on-cell](../../table-cells/booking/ir-booked-on-cell)
- [ir-booked-by-source-cell](../../table-cells/booking/ir-booked-by-source-cell)
- [ir-unit-cell](../../table-cells/booking/ir-unit-cell)
- [ir-dates-cell](../../table-cells/booking/ir-dates-cell)
- [ir-balance-cell](../../table-cells/booking/ir-balance-cell)
- [ir-status-activity-cell](../../table-cells/booking/ir-status-activity-cell)
- [ir-actions-cell](../../table-cells/booking/ir-actions-cell)
- [ir-pagination](../../ir-pagination)
- [ir-dialog](../../ui/ir-dialog)
- [ir-custom-button](../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-booking-listing-table --> ir-booking-number-cell
  ir-booking-listing-table --> ir-booked-on-cell
  ir-booking-listing-table --> ir-booked-by-source-cell
  ir-booking-listing-table --> ir-unit-cell
  ir-booking-listing-table --> ir-dates-cell
  ir-booking-listing-table --> ir-balance-cell
  ir-booking-listing-table --> ir-status-activity-cell
  ir-booking-listing-table --> ir-actions-cell
  ir-booking-listing-table --> ir-pagination
  ir-booking-listing-table --> ir-dialog
  ir-booking-listing-table --> ir-custom-button
  ir-booking-number-cell --> ir-custom-button
  ir-booked-by-source-cell --> ir-custom-button
  ir-unit-cell --> ir-unit-tag
  ir-balance-cell --> ir-custom-button
  ir-status-activity-cell --> ir-booking-status-tag
  ir-actions-cell --> ir-custom-button
  ir-pagination --> ir-select
  ir-pagination --> ir-custom-button
  ir-booking-listing --> ir-booking-listing-table
  style ir-booking-listing-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
