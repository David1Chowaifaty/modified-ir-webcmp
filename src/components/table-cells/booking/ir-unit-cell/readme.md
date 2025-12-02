# ir-unit-cell



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type   | Default     |
| -------- | --------- | ----------- | ------ | ----------- |
| `room`   | --        |             | `Room` | `undefined` |


## Dependencies

### Used by

 - [ir-arrivals-table](../../../ir-arrivals/ir-arrivals-table)
 - [ir-booking-listing-table](../../../ir-booking-listing/ir-booking-listing-table)
 - [ir-departures-table](../../../ir-departures/ir-departures-table)

### Depends on

- [ir-unit-tag](../../../ir-unit-tag)

### Graph
```mermaid
graph TD;
  ir-unit-cell --> ir-unit-tag
  ir-arrivals-table --> ir-unit-cell
  ir-booking-listing-table --> ir-unit-cell
  ir-departures-table --> ir-unit-cell
  style ir-unit-cell fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
