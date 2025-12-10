# ir-checkout-dialog



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                        | Type      | Default     |
| ------------ | ------------ | -------------------------------------------------- | --------- | ----------- |
| `booking`    | --           | Booking data for the current room checkout action. | `Booking` | `undefined` |
| `identifier` | `identifier` | Unique identifier of the room being checked out.   | `string`  | `undefined` |
| `open`       | `open`       |                                                    | `boolean` | `undefined` |


## Events

| Event                  | Description | Type                                                  |
| ---------------------- | ----------- | ----------------------------------------------------- |
| `checkoutDialogClosed` |             | `CustomEvent<{ reason: "dialog" \| "openInvoice"; }>` |


## Dependencies

### Used by

 - [ir-room](../ir-booking-details/ir-room)

### Depends on

- [ir-dialog](../ui/ir-dialog)
- [ir-spinner](../ui/ir-spinner)
- [ir-custom-button](../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-checkout-dialog --> ir-dialog
  ir-checkout-dialog --> ir-spinner
  ir-checkout-dialog --> ir-custom-button
  ir-room --> ir-checkout-dialog
  style ir-checkout-dialog fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
