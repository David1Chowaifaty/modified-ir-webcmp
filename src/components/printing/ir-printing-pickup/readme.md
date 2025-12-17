# ir-printing-pickup



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                | Type                 | Default     |
| -------- | --------- | ------------------------------------------ | -------------------- | ----------- |
| `pickup` | --        | Pickup information attached to the booking | `IBookingPickupInfo` | `undefined` |


## Dependencies

### Used by

 - [ir-proforma-invoice-preview](../ir-proforma-invoice-preview)

### Depends on

- [ir-printing-label](../ir-printing-label)

### Graph
```mermaid
graph TD;
  ir-printing-pickup --> ir-printing-label
  ir-proforma-invoice-preview --> ir-printing-pickup
  style ir-printing-pickup fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
