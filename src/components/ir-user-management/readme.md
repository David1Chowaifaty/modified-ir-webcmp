# ir-user-management



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description | Type      | Default     |
| -------------- | ---------------- | ----------- | --------- | ----------- |
| `isSuperAdmin` | `is-super-admin` |             | `boolean` | `true`      |
| `language`     | `language`       |             | `string`  | `''`        |
| `p`            | `p`              |             | `string`  | `undefined` |
| `propertyid`   | `propertyid`     |             | `number`  | `undefined` |
| `ticket`       | `ticket`         |             | `string`  | `''`        |


## Dependencies

### Depends on

- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-loading-screen](../ir-loading-screen)
- [ir-user-management-table](ir-user-management-table)

### Graph
```mermaid
graph TD;
  ir-user-management --> ir-toast
  ir-user-management --> ir-interceptor
  ir-user-management --> ir-loading-screen
  ir-user-management --> ir-user-management-table
  ir-user-management-table --> ir-icon
  ir-user-management-table --> ir-switch
  ir-user-management-table --> ir-sidebar
  ir-user-management-table --> ir-modal
  ir-user-management-table --> ir-user-form-panel
  ir-sidebar --> ir-icon
  ir-modal --> ir-button
  ir-button --> ir-icons
  ir-user-form-panel --> ir-title
  ir-user-form-panel --> ir-input-text
  ir-user-form-panel --> ir-select
  ir-user-form-panel --> ir-password-validator
  ir-user-form-panel --> ir-button
  ir-user-form-panel --> ir-sidebar
  ir-user-form-panel --> ir-reset-password
  ir-title --> ir-icon
  ir-password-validator --> requirement-check
  requirement-check --> ir-icons
  ir-reset-password --> ir-interceptor
  ir-reset-password --> ir-toast
  ir-reset-password --> ir-title
  ir-reset-password --> ir-input-text
  ir-reset-password --> ir-password-validator
  ir-reset-password --> ir-button
  style ir-user-management fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
