# ir-channel



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type     | Default     |
| ------------ | ------------ | ----------- | -------- | ----------- |
| `baseurl`    | `baseurl`    |             | `string` | `undefined` |
| `language`   | `language`   |             | `string` | `undefined` |
| `p`          | `p`          |             | `string` | `undefined` |
| `propertyid` | `propertyid` |             | `number` | `undefined` |
| `ticket`     | `ticket`     |             | `string` | `''`        |


## Dependencies

### Depends on

- [ir-loading-screen](../ir-loading-screen)
- [ir-toast](../ir-toast)
- [ir-button](../ir-button)
- [ir-switch](../ir-switch)
- [ir-sidebar](../ir-sidebar)
- [ir-channel-editor](ir-channel-editor)
- [ir-modal](../ir-modal)

### Graph
```mermaid
graph TD;
  ir-channel --> ir-loading-screen
  ir-channel --> ir-toast
  ir-channel --> ir-button
  ir-channel --> ir-switch
  ir-channel --> ir-sidebar
  ir-channel --> ir-channel-editor
  ir-channel --> ir-modal
  ir-button --> ir-icons
  ir-sidebar --> ir-icon
  ir-channel-editor --> ir-channel-general
  ir-channel-editor --> ir-channel-mapping
  ir-channel-editor --> ir-icon
  ir-channel-editor --> ir-channel-header
  ir-channel-editor --> ir-button
  ir-channel-general --> ir-combobox
  ir-channel-general --> ir-icons
  ir-channel-mapping --> ir-icon
  ir-channel-mapping --> ir-button
  ir-channel-mapping --> ir-combobox
  ir-modal --> ir-button
  style ir-channel fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
