# ir-sales-table



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute | Description | Type                                            | Default     |
| ----------------- | --------- | ----------- | ----------------------------------------------- | ----------- |
| `mappedCountries` | --        |             | `Map<number, Pick<ICountry, "name" \| "flag">>` | `undefined` |
| `records`         | --        |             | `SalesRecord[]`                                 | `[]`        |


## Dependencies

### Used by

 - [ir-sales-by-country](..)

### Depends on

- [ir-progress-indicator](../../ui/ir-progress-indicator)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-sales-table --> ir-progress-indicator
  ir-sales-table --> ir-button
  ir-button --> ir-icons
  ir-sales-by-country --> ir-sales-table
  style ir-sales-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
