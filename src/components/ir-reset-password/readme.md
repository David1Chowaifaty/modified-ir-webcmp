# ir-reset-password



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description | Type      | Default     |
| ---------- | ----------- | ----------- | --------- | ----------- |
| `old_pwd`  | `old_pwd`   |             | `string`  | `undefined` |
| `skip2Fa`  | `skip-2-fa` |             | `boolean` | `undefined` |
| `ticket`   | `ticket`    |             | `string`  | `undefined` |
| `username` | `username`  |             | `string`  | `undefined` |


## Events

| Event          | Description | Type                                                           |
| -------------- | ----------- | -------------------------------------------------------------- |
| `authFinish`   |             | `CustomEvent<{ token: string; code: "error" \| "succsess"; }>` |
| `closeSideBar` |             | `CustomEvent<null>`                                            |


## Dependencies

### Used by

 - [ir-user-form-panel](../ir-user-management/ir-user-form-panel)

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-toast](../ui/ir-toast)
- [ir-title](../ir-title)
- [ir-input-text](../ui/ir-input-text)
- [ir-password-validator](../ir-password-validator)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-reset-password --> ir-interceptor
  ir-reset-password --> ir-toast
  ir-reset-password --> ir-title
  ir-reset-password --> ir-input-text
  ir-reset-password --> ir-password-validator
  ir-reset-password --> ir-button
  ir-title --> ir-icon
  ir-password-validator --> requirement-check
  requirement-check --> ir-icons
  ir-button --> ir-icons
  ir-user-form-panel --> ir-reset-password
  style ir-reset-password fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
