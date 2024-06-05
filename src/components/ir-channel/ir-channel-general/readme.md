# ir-channel-general



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type                 | Default |
| ---------------- | ---------------- | ----------- | -------------------- | ------- |
| `channel_status` | `channel_status` |             | `"create" \| "edit"` | `null`  |


## Events

| Event              | Description | Type                   |
| ------------------ | ----------- | ---------------------- |
| `connectionStatus` |             | `CustomEvent<boolean>` |


## Dependencies

### Used by

 - [ir-channel-editor](../ir-channel-editor)

### Depends on

- [ir-combobox](../../ir-combobox)
- [ir-icons](../../ui/ir-icons)

### Graph
```mermaid
graph TD;
  ir-channel-general --> ir-combobox
  ir-channel-general --> ir-icons
  ir-channel-editor --> ir-channel-general
  style ir-channel-general fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
