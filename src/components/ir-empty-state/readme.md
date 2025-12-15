# ir-empty-state



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type     | Default              |
| --------- | --------- | ----------- | -------- | -------------------- |
| `message` | `message` |             | `string` | `'No records found'` |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"message"` |             |


## Dependencies

### Used by

 - [ir-billing](../ir-billing)
 - [ir-departures-table](../ir-departures/ir-departures-table)
 - [ir-invoice-form](../ir-invoice/ir-invoice-form)

### Graph
```mermaid
graph TD;
  ir-billing --> ir-empty-state
  ir-departures-table --> ir-empty-state
  ir-invoice-form --> ir-empty-state
  style ir-empty-state fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
