# ir-actions-cell



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type               | Default |
| --------- | --------- | ----------- | ------------------ | ------- |
| `buttons` | --        |             | `IrActionButton[]` | `[]`    |


## Events

| Event      | Description | Type                                       |
| ---------- | ----------- | ------------------------------------------ |
| `irAction` |             | `CustomEvent<{ action: IrActionButton; }>` |


## Dependencies

### Used by

 - [ir-arrivals-table](../../../ir-arrivals/ir-arrivals-table)
 - [ir-booking-listing-table](../../../ir-booking-listing/ir-booking-listing-table)
 - [ir-departures-table](../../../ir-departures/ir-departures-table)

### Depends on

- [ir-custom-button](../../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-actions-cell --> ir-custom-button
  ir-arrivals-table --> ir-actions-cell
  ir-booking-listing-table --> ir-actions-cell
  ir-departures-table --> ir-actions-cell
  style ir-actions-cell fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
