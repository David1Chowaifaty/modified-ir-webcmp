# ir-channel-manager



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute | Description | Type                                                                           | Default                                                                                                                                                                                                                                                                          |
| ---------------------- | --------- | ----------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowed_MinStayTypes` | --        |             | `selectOption[]`                                                               | `[]`                                                                                                                                                                                                                                                                             |
| `allowed_channels`     | --        |             | `selectOption[]`                                                               | `[]`                                                                                                                                                                                                                                                                             |
| `allowed_properties`   | --        |             | `selectOption[]`                                                               | `[]`                                                                                                                                                                                                                                                                             |
| `dropdownData`         | --        |             | `{ name: string; icon: string; children: { name: string; icon: string; }[]; }` | `{     name: 'Action',     icon: '',     children: [       {         name: 'Edit',         icon: 'ft-edit',       },       {         name: 'Delete',         icon: 'ft-trash',       },       {         name: 'Disable',         icon: 'ft-alert-triangle',       },     ],   }` |
| `hostRoom`             | --        |             | `RoomType[]`                                                                   | `undefined`                                                                                                                                                                                                                                                                      |
| `listData`             | --        |             | `ChannelManager[]`                                                             | `null`                                                                                                                                                                                                                                                                           |
| `mapReference`         | --        |             | `RoomType[]`                                                                   | `undefined`                                                                                                                                                                                                                                                                      |


## Events

| Event              | Description | Type                            |
| ------------------ | ----------- | ------------------------------- |
| `fetchApi`         |             | `CustomEvent<ChannelManager[]>` |
| `requestApiDelete` |             | `CustomEvent<any>`              |


## Dependencies

### Depends on

- [ir-topbar](../ir-topBar)
- [ir-list-item](../ir-listItems)
- [ir-sidebar](../../ir-sidebar)
- [ir-loader](../../ir-loader)
- [ir-general-settings](../ir-general-settings)
- [ir-mapping](../ir-mapping)
- [ir-modal](../../ir-modal)

### Graph
```mermaid
graph TD;
  ir-channel-manager --> ir-topbar
  ir-channel-manager --> ir-list-item
  ir-channel-manager --> ir-sidebar
  ir-channel-manager --> ir-loader
  ir-channel-manager --> ir-general-settings
  ir-channel-manager --> ir-mapping
  ir-channel-manager --> ir-modal
  ir-topbar --> ir-icon
  ir-list-item --> ir-dropdown
  ir-list-item --> ir-icon
  ir-list-item --> ir-modal
  ir-dropdown --> ir-icon
  ir-modal --> ir-icon
  ir-modal --> ir-button
  ir-sidebar --> ir-icon
  ir-general-settings --> ir-select
  ir-general-settings --> ir-input-text
  ir-general-settings --> ir-modal
  ir-mapping --> ir-icon
  style ir-channel-manager fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
