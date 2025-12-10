# ir-test-cmp



<!-- Auto Generated Below -->


## Dependencies

### Depends on

- [ir-custom-button](../ui/ir-custom-button)
- [ir-invoice](../ir-invoice)

### Graph
```mermaid
graph TD;
  ir-test2-cmp --> ir-custom-button
  ir-test2-cmp --> ir-invoice
  ir-invoice --> ir-drawer
  ir-invoice --> ir-invoice-form
  ir-invoice --> ir-custom-button
  ir-invoice-form --> ir-spinner
  ir-invoice-form --> ir-custom-date-picker
  ir-invoice-form --> ir-booking-billing-recipient
  ir-custom-date-picker --> ir-custom-input
  ir-booking-billing-recipient --> ir-booking-company-dialog
  ir-booking-company-dialog --> ir-dialog
  ir-booking-company-dialog --> ir-booking-company-form
  ir-booking-company-dialog --> ir-custom-button
  ir-booking-company-form --> ir-custom-input
  style ir-test2-cmp fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
