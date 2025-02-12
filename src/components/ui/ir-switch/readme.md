# ir-switch



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description | Type      | Default     |
| ---------- | ----------- | ----------- | --------- | ----------- |
| `checked`  | `checked`   |             | `boolean` | `false`     |
| `disabled` | `disabled`  |             | `boolean` | `false`     |
| `switchId` | `switch-id` |             | `string`  | `undefined` |


## Events

| Event         | Description | Type                   |
| ------------- | ----------- | ---------------------- |
| `checkChange` |             | `CustomEvent<boolean>` |


## Dependencies

### Used by

 - [ir-channel](../ir-channel)
 - [ir-hk-unassigned-units](../ir-housekeeping/ir-hk-unassigned-units)
 - [ir-payment-option](../ir-payment-option)

### Graph
```mermaid
graph TD;
  ir-channel --> ir-switch
  ir-hk-unassigned-units --> ir-switch
  ir-payment-option --> ir-switch
  style ir-switch fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
