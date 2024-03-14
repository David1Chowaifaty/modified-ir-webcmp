# ir-hk-user



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                                                                                                                                         | Default |
| -------- | --------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `isEdit` | `is-edit` |             | `boolean`                                                                                                                                    | `false` |
| `user`   | --        |             | `{ name: string; id: number; mobile: string; note: string; password: string; property_id: number; phone_prefix: string; username: string; }` | `null`  |


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
- [ir-input-text](../../ir-input-text)
- [ir-phone-input](../../ir-phone-input)
- [ir-button](../../ir-button)

### Graph
```mermaid
graph TD;
  ir-hk-user --> ir-title
  ir-hk-user --> ir-input-text
  ir-hk-user --> ir-phone-input
  ir-hk-user --> ir-button
  ir-title --> ir-icon
  ir-phone-input --> ir-combobox
  ir-hk-team --> ir-hk-user
  style ir-hk-user fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
