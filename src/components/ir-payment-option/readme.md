# ir-payment-option



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type      | Default     |
| --------------- | ---------------- | ----------- | --------- | ----------- |
| `baseurl`       | `baseurl`        |             | `string`  | `undefined` |
| `defaultStyles` | `default-styles` |             | `boolean` | `true`      |
| `language`      | `language`       |             | `string`  | `'en'`      |
| `propertyid`    | `propertyid`     |             | `string`  | `undefined` |
| `ticket`        | `ticket`         |             | `string`  | `undefined` |


## Dependencies

### Depends on

- [ir-toast](../ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-icons](../ui/ir-icons)
- [ir-switch](../ir-switch)
- [ir-button](../ir-button)
- [ir-sidebar](../ir-sidebar)
- [ir-option-details](ir-option-details)

### Graph
```mermaid
graph TD;
  ir-payment-option --> ir-toast
  ir-payment-option --> ir-interceptor
  ir-payment-option --> ir-icons
  ir-payment-option --> ir-switch
  ir-payment-option --> ir-button
  ir-payment-option --> ir-sidebar
  ir-payment-option --> ir-option-details
  ir-button --> ir-icons
  ir-sidebar --> ir-icon
  ir-option-details --> ir-select
  ir-option-details --> ir-textarea
  ir-option-details --> ir-input-text
  ir-option-details --> ir-button
  style ir-payment-option fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
