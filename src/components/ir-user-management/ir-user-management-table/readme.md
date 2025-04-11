# ir-user-management-table



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description | Type      | Default     |
| -------------- | ---------------- | ----------- | --------- | ----------- |
| `isSuperAdmin` | `is-super-admin` |             | `boolean` | `undefined` |
| `users`        | --               |             | `User[]`  | `[]`        |


## Events

| Event   | Description | Type                                                                                                 |
| ------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `toast` |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [ir-user-management](..)

### Depends on

- [ir-icon](../../ui/ir-icon)
- [ir-switch](../../ui/ir-switch)
- [ir-sidebar](../../ui/ir-sidebar)
- [ir-modal](../../ui/ir-modal)
- [ir-user-form-panel](../ir-user-form-panel)

### Graph
```mermaid
graph TD;
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
  ir-title --> ir-icon
  ir-password-validator --> requirement-check
  requirement-check --> ir-icons
  ir-user-management --> ir-user-management-table
  style ir-user-management-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
