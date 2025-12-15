# ir-print-room



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                   | Type       | Default     |
| ---------- | ---------- | ----------------------------- | ---------- | ----------- |
| `booking`  | --         | Booking context               | `Booking`  | `undefined` |
| `currency` | `currency` | Currency code (e.g. USD, EUR) | `string`   | `undefined` |
| `idx`      | `idx`      | Room index                    | `number`   | `undefined` |
| `property` | --         | Property context              | `Property` | `undefined` |
| `room`     | --         | Room data                     | `Room`     | `undefined` |


## Dependencies

### Used by

 - [ir-proforma-invoice-preview](../ir-proforma-invoice-preview)

### Depends on

- [ir-printing-label](../ir-printing-label)

### Graph
```mermaid
graph TD;
  ir-print-room --> ir-printing-label
  ir-proforma-invoice-preview --> ir-print-room
  style ir-print-room fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
