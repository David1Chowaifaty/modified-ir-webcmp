# ir-list-item



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute | Description | Type                                                                           | Default                                                                                                                                                                                                                                                                          |
| --------------------- | --------- | ----------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dropdownData`        | --        |             | `{ name: string; icon: string; children: { name: string; icon: string; }[]; }` | `{     name: 'Action',     icon: '',     children: [       {         name: 'Edit',         icon: 'ft-edit',       },       {         name: 'Delete',         icon: 'ft-trash',       },       {         name: 'Disable',         icon: 'ft-alert-triangle',       },     ],   }` |
| `dropdownDataDisable` | --        |             | `{ name: string; icon: string; children: { name: string; icon: string; }[]; }` | `{     name: 'Action',     icon: '',     children: [       {         name: 'Edit',         icon: 'ft-edit',       },       {         name: 'Delete',         icon: 'ft-trash',       },       {         name: 'Enable',         icon: 'ft-check',       },     ],   }`           |
| `listData`            | --        |             | `ChannelManager[]`                                                             | `null`                                                                                                                                                                                                                                                                           |


## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `changeStatus` |             | `CustomEvent<any>` |
| `createNew`    |             | `CustomEvent<any>` |
| `openSidebar`  |             | `CustomEvent<any>` |
| `sendDelete`   |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ir-channel-manager](../ir-channel-manager)

### Depends on

- [ir-dropdown](../../ir-dropdown)
- [ir-icon](../../ir-icon)
- [ir-modal](../../ir-modal)

### Graph
```mermaid
graph TD;
  ir-list-item --> ir-dropdown
  ir-list-item --> ir-icon
  ir-list-item --> ir-modal
  ir-dropdown --> ir-icon
  ir-modal --> ir-button
  ir-channel-manager --> ir-list-item
  style ir-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
