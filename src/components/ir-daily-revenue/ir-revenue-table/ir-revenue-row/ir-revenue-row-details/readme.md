# ir-revenue-row-details



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type           | Default     |
| --------- | --------- | ----------- | -------------- | ----------- |
| `payment` | --        |             | `FolioPayment` | `undefined` |


## Events

| Event                | Description | Type                                                                     |
| -------------------- | ----------- | ------------------------------------------------------------------------ |
| `revenueOpenSidebar` |             | `CustomEvent<{ type: "booking"; payload: { bookingNumber: number; }; }>` |


## Dependencies

### Used by

 - [ir-revenue-row](..)

### Depends on

- [ir-button](../../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-revenue-row-details --> ir-button
  ir-button --> ir-icons
  ir-revenue-row --> ir-revenue-row-details
  style ir-revenue-row-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
