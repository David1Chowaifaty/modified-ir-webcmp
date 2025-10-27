# ir-financial-table



<!-- Auto Generated Below -->


## Events

| Event                         | Description | Type                                                                                                                                                    |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `financialActionsOpenSidebar` |             | `CustomEvent<{ type: "booking"; payload: { bookingNumber: number; }; } \| { type: "payment"; payload: { payment: Payment; bookingNumber: number; }; }>` |


## Dependencies

### Used by

 - [ir-financial-actions](..)

### Depends on

- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-financial-table --> ir-button
  ir-button --> ir-icons
  ir-financial-actions --> ir-financial-table
  style ir-financial-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
