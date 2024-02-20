# ir-channel-editor



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type                 | Default |
| ---------------- | ---------------- | ----------- | -------------------- | ------- |
| `channel_status` | `channel_status` |             | `"create" \| "edit"` | `null`  |


## Events

| Event          | Description | Type                |
| -------------- | ----------- | ------------------- |
| `closeSideBar` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-channel](..)

### Depends on

- [ir-channel-general](../ir-channel-general)
- [ir-channel-mapping](../ir-channel-mapping)
- [ir-icon](../../ir-icon)
- [ir-channel-header](../ir-channel-header)
- [ir-button](../../ir-button)

### Graph
```mermaid
graph TD;
  ir-channel-editor --> ir-channel-general
  ir-channel-editor --> ir-channel-mapping
  ir-channel-editor --> ir-icon
  ir-channel-editor --> ir-channel-header
  ir-channel-editor --> ir-button
  ir-channel-general --> ir-combobox
  ir-channel-mapping --> ir-icon
  ir-channel-mapping --> ir-combobox
  ir-channel --> ir-channel-editor
  style ir-channel-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
