# ir-housekeeping



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type     | Default     |
| ------------ | ------------ | ----------- | -------- | ----------- |
| `language`   | `language`   |             | `string` | `''`        |
| `p`          | `p`          |             | `string` | `undefined` |
| `propertyid` | `propertyid` |             | `number` | `undefined` |
| `ticket`     | `ticket`     |             | `string` | `''`        |


## Events

| Event   | Description | Type                                                                                                 |
| ------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `toast` |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [ir-secure-tasks](../ir-secure-tasks)

### Depends on

- [ir-loading-screen](../ir-loading-screen)
- [ir-interceptor](../ir-interceptor)
- [ir-toast](../ui/ir-toast)
- [ir-title](../ir-title)
- [ir-select](../ui/ir-select)
- [ir-hk-team](ir-hk-team)

### Graph
```mermaid
graph TD;
  ir-housekeeping --> ir-loading-screen
  ir-housekeeping --> ir-interceptor
  ir-housekeeping --> ir-toast
  ir-housekeeping --> ir-title
  ir-housekeeping --> ir-select
  ir-housekeeping --> ir-hk-team
  ir-title --> ir-icon
  ir-hk-team --> ir-hk-unassigned-units
  ir-hk-team --> ir-hk-user
  ir-hk-team --> ir-title
  ir-hk-team --> ir-icon
  ir-hk-team --> ir-popover
  ir-hk-team --> ir-button
  ir-hk-team --> ir-sidebar
  ir-hk-team --> ir-delete-modal
  ir-hk-unassigned-units --> ir-select
  ir-hk-unassigned-units --> ir-switch
  ir-hk-unassigned-units --> ir-title
  ir-hk-unassigned-units --> ir-button
  ir-button --> ir-icons
  ir-hk-user --> ir-title
  ir-hk-user --> ir-input-text
  ir-hk-user --> ir-phone-input
  ir-hk-user --> ir-textarea
  ir-hk-user --> ir-password-validator
  ir-hk-user --> ir-button
  ir-phone-input --> ir-combobox
  ir-password-validator --> requirement-check
  requirement-check --> ir-icons
  ir-sidebar --> ir-icon
  ir-delete-modal --> ir-button
  ir-delete-modal --> ir-select
  ir-secure-tasks --> ir-housekeeping
  style ir-housekeeping fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
