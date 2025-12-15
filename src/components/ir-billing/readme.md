# ir-billing



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default     |
| --------- | --------- | ----------- | --------- | ----------- |
| `booking` | --        |             | `Booking` | `undefined` |


## Events

| Event          | Description | Type                |
| -------------- | ----------- | ------------------- |
| `billingClose` |             | `CustomEvent<void>` |


## Dependencies

### Used by

 - [ir-billing-drawer](ir-billing-drawer)

### Depends on

- [ir-spinner](../ui/ir-spinner)
- [ir-custom-button](../ui/ir-custom-button)
- [ir-empty-state](../ir-empty-state)
- [ir-invoice](../ir-invoice)
- [ir-dialog](../ui/ir-dialog)

### Graph
```mermaid
graph TD;
  ir-billing --> ir-spinner
  ir-billing --> ir-custom-button
  ir-billing --> ir-empty-state
  ir-billing --> ir-invoice
  ir-billing --> ir-dialog
  ir-invoice --> ir-drawer
  ir-invoice --> ir-invoice-form
  ir-invoice --> ir-custom-button
  ir-invoice --> ir-preview-screen-dialog
  ir-invoice --> ir-proforma-invoice-preview
  ir-invoice-form --> ir-spinner
  ir-invoice-form --> ir-custom-date-picker
  ir-invoice-form --> ir-booking-billing-recipient
  ir-custom-date-picker --> ir-input
  ir-booking-billing-recipient --> ir-booking-company-dialog
  ir-booking-company-dialog --> ir-dialog
  ir-booking-company-dialog --> ir-booking-company-form
  ir-booking-company-dialog --> ir-custom-button
  ir-booking-company-form --> ir-input
  ir-preview-screen-dialog --> ir-dialog
  ir-preview-screen-dialog --> ir-custom-button
  ir-proforma-invoice-preview --> ir-printing-label
  ir-proforma-invoice-preview --> ir-print-room
  ir-proforma-invoice-preview --> ir-printing-pickup
  ir-proforma-invoice-preview --> ir-printing-extra-service
  ir-print-room --> ir-printing-label
  ir-printing-pickup --> ir-printing-label
  ir-printing-extra-service --> ir-printing-label
  ir-billing-drawer --> ir-billing
  style ir-billing fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
