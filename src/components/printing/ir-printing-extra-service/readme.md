# ir-printing-extra-service



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute | Description                            | Type                                                                                                                                                                       | Default     |
| --------------- | --------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `currency`      | --        | Booking currency                       | `Currency`                                                                                                                                                                 | `undefined` |
| `extraServices` | --        | Extra services attached to the booking | `{ cost?: number; system_id?: number; description?: string; booking_system_id?: number; currency_id?: number; end_date?: string; start_date?: string; price?: number; }[]` | `undefined` |
| `invocableKeys` | --        |                                        | `Set<string \| number>`                                                                                                                                                    | `undefined` |


## Dependencies

### Used by

 - [ir-proforma-invoice-preview](../ir-proforma-invoice-preview)

### Depends on

- [ir-printing-label](../ir-printing-label)

### Graph
```mermaid
graph TD;
  ir-printing-extra-service --> ir-printing-label
  ir-proforma-invoice-preview --> ir-printing-extra-service
  style ir-printing-extra-service fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
