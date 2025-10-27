# igl-legends



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute | Description | Type                      | Default     |
| ------------ | --------- | ----------- | ------------------------- | ----------- |
| `legendData` | --        |             | `{ [key: string]: any; }` | `undefined` |


## Events

| Event         | Description | Type                                   |
| ------------- | ----------- | -------------------------------------- |
| `optionEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [ir-new-badge](../../ir-new-badge)
- [ir-input-text](../../ui/ir-input-text)
- [ir-success-loader](../../ui/ir-success-loader)

### Graph
```mermaid
graph TD;
  igl-legends --> ir-new-badge
  igl-legends --> ir-input-text
  igl-legends --> ir-success-loader
  ir-success-loader --> ir-icons
  igloo-calendar --> igl-legends
  style igl-legends fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
