# ir-hk-user



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                                                                                                                                         | Default |
| -------- | --------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `isEdit` | `is-edit` |             | `boolean`                                                                                                                                    | `false` |
| `user`   | --        |             | `{ name: string; note: string; id: number; mobile: string; password: string; property_id: number; phone_prefix: string; username: string; }` | `null`  |


## Events

| Event          | Description | Type                |
| -------------- | ----------- | ------------------- |
| `closeSideBar` |             | `CustomEvent<null>` |
| `resetData`    |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-hk-team](../ir-hk-team)

### Depends on

- [ir-title](../../ir-title)
- [ir-input-text](../../ui/ir-input-text)
- [ir-phone-input](../../ui/ir-phone-input)
- [ir-textarea](../../ui/ir-textarea)
- [ir-password-validator](../../ir-password-validator)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-hk-user --> ir-title
  ir-hk-user --> ir-input-text
  ir-hk-user --> ir-phone-input
  ir-hk-user --> ir-textarea
  ir-hk-user --> ir-password-validator
  ir-hk-user --> ir-button
  ir-title --> ir-icon
  ir-phone-input --> ir-combobox
  ir-password-validator --> requirement-check
  requirement-check --> ir-icons
  ir-button --> ir-icons
  ir-hk-team --> ir-hk-user
  style ir-hk-user fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
