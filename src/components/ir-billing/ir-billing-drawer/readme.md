# ir-billing-drawer



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                                                                                                                                               | Type      | Default     |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `booking` | --        | The booking object containing reservation and guest details that will be used to populate the billing view.                                                               | `Booking` | `undefined` |
| `open`    | `open`    | Controls whether the billing drawer is open or closed.  When `true`, the drawer becomes visible. When `false`, it is hidden.  This prop is reflected to the host element. | `boolean` | `undefined` |


## Events

| Event          | Description                                                                                                | Type                |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------- |
| `billingClose` | Emitted when the billing drawer has been closed.  Listen to this event to respond to drawer close actions. | `CustomEvent<void>` |


## Dependencies

### Used by

 - [ir-booking-details](../../ir-booking-details)

### Depends on

- [ir-drawer](../../ir-drawer)
- [ir-billing](..)

### Graph
```mermaid
graph TD;
  ir-billing-drawer --> ir-drawer
  ir-billing-drawer --> ir-billing
  ir-billing --> ir-spinner
  ir-billing --> ir-custom-button
  ir-billing --> ir-invoice
  ir-billing --> ir-dialog
  ir-invoice --> ir-drawer
  ir-invoice --> ir-invoice-form
  ir-invoice --> ir-custom-button
  ir-invoice-form --> ir-spinner
  ir-invoice-form --> ir-custom-date-picker
  ir-invoice-form --> ir-booking-billing-recipient
  ir-custom-date-picker --> ir-custom-input
  ir-booking-billing-recipient --> ir-booking-company-form
  ir-booking-company-form --> ir-dialog
  ir-booking-company-form --> ir-custom-input
  ir-booking-company-form --> ir-custom-button
  ir-booking-details --> ir-billing-drawer
  style ir-billing-drawer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
