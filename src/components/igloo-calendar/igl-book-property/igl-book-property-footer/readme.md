# igl-book-property-footer



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default     |
| ----------- | ------------ | ----------- | --------- | ----------- |
| `disabled`  | `disabled`   |             | `boolean` | `true`      |
| `eventType` | `event-type` |             | `string`  | `undefined` |


## Events

| Event           | Description | Type                                           |
| --------------- | ----------- | ---------------------------------------------- |
| `buttonClicked` |             | `CustomEvent<{ key: TPropertyButtonsTypes; }>` |


## Dependencies

### Used by

 - [igl-booking-overview-page](../igl-booking-overview-page)

### Depends on

- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  igl-book-property-footer --> ir-button
  ir-button --> ir-icons
  igl-booking-overview-page --> igl-book-property-footer
  style igl-book-property-footer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
