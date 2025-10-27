# ir-revenue-row



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute    | Description                              | Type             | Default     |
| ------------------------ | ------------ | ---------------------------------------- | ---------------- | ----------- |
| `groupName` _(required)_ | `group-name` | Group display name (e.g., "Credit Card") | `string`         | `undefined` |
| `payments`               | --           | Array of payments for this method group  | `FolioPayment[]` | `[]`        |


## Dependencies

### Used by

 - [ir-revenue-table](..)

### Depends on

- [ir-accordion](../../../ui/ir-accordion)
- [ir-revenue-row-details](ir-revenue-row-details)

### Graph
```mermaid
graph TD;
  ir-revenue-row --> ir-accordion
  ir-revenue-row --> ir-revenue-row-details
  ir-accordion --> ir-icons
  ir-revenue-row-details --> ir-button
  ir-button --> ir-icons
  ir-revenue-table --> ir-revenue-row
  style ir-revenue-row fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
