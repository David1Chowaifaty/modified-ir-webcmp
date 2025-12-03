# ir-payment-option



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type      | Default     |
| --------------- | ---------------- | ----------- | --------- | ----------- |
| `defaultStyles` | `default-styles` |             | `boolean` | `true`      |
| `hideLogs`      | `hide-logs`      |             | `boolean` | `true`      |
| `language`      | `language`       |             | `string`  | `'en'`      |
| `p`             | `p`              |             | `string`  | `undefined` |
| `propertyid`    | `propertyid`     |             | `string`  | `undefined` |
| `ticket`        | `ticket`         |             | `string`  | `undefined` |


## Events

| Event   | Description | Type                                                                                                 |
| ------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `toast` |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Depends on

- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-icons](../ui/ir-icons)
- [ir-switch](../ui/ir-switch)
- [ir-button](../ui/ir-button)
- [ir-sidebar](../ui/ir-sidebar)
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
  ir-interceptor --> ir-spinner
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-sidebar --> ir-icon
  ir-option-details --> ir-title
  ir-option-details --> ir-select
  ir-option-details --> ir-text-editor
  ir-option-details --> ir-input-text
  ir-option-details --> ir-button
  ir-title --> ir-icon
  style ir-payment-option fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
