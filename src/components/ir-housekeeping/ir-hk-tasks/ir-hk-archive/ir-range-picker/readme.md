# ir-range-picker



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute | Description | Type     | Default     |
| ---------- | --------- | ----------- | -------- | ----------- |
| `fromDate` | --        |             | `Moment` | `undefined` |
| `toDate`   | --        |             | `Moment` | `undefined` |


## Events

| Event              | Description | Type                                                 |
| ------------------ | ----------- | ---------------------------------------------------- |
| `dateRangeChanged` |             | `CustomEvent<{ fromDate: Moment; toDate: Moment; }>` |


## Dependencies

### Used by

 - [ir-hk-archive](..)
 - [ir-test-cmp](../../../../ir-test-cmp)

### Depends on

- [ir-date-picker](../../../../ui/ir-date-picker)
- [ir-button](../../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-range-picker --> ir-date-picker
  ir-range-picker --> ir-button
  ir-button --> ir-icons
  ir-hk-archive --> ir-range-picker
  ir-test-cmp --> ir-range-picker
  style ir-range-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
