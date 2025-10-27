# ir-revenue-summary



<!-- Auto Generated Below -->


## Properties

| Property                      | Attribute | Description | Type                                                              | Default     |
| ----------------------------- | --------- | ----------- | ----------------------------------------------------------------- | ----------- |
| `groupedPayments`             | --        |             | `Map<string, FolioPayment[]>`                                     | `new Map()` |
| `paymentEntries`              | --        |             | `{ types: IEntries[]; groups: IEntries[]; methods: IEntries[]; }` | `undefined` |
| `previousDateGroupedPayments` | --        |             | `Map<string, FolioPayment[]>`                                     | `new Map()` |


## Dependencies

### Used by

 - [ir-daily-revenue](..)

### Depends on

- [ir-stats-card](../../ui/ir-stats-card)

### Graph
```mermaid
graph TD;
  ir-revenue-summary --> ir-stats-card
  ir-stats-card --> ir-icons
  ir-daily-revenue --> ir-revenue-summary
  style ir-revenue-summary fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
