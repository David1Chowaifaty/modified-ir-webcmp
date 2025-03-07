# ir-hk-team



<!-- Auto Generated Below -->


## Dependencies

### Used by

 - [ir-housekeeping](..)

### Depends on

- [ir-hk-unassigned-units](../ir-hk-unassigned-units)
- [ir-hk-user](../ir-hk-user)
- [ir-title](../../ir-title)
- [ir-icon](../../ui/ir-icon)
- [ir-popover](../../ui/ir-popover)
- [ir-button](../../ui/ir-button)
- [ir-sidebar](../../ui/ir-sidebar)
- [ir-delete-modal](../ir-delete-modal)

### Graph
```mermaid
graph TD;
  ir-hk-team --> ir-hk-unassigned-units
  ir-hk-team --> ir-hk-user
  ir-hk-team --> ir-title
  ir-hk-team --> ir-icon
  ir-hk-team --> ir-popover
  ir-hk-team --> ir-button
  ir-hk-team --> ir-sidebar
  ir-hk-team --> ir-delete-modal
  ir-hk-unassigned-units --> ir-select
  ir-hk-unassigned-units --> ir-switch
  ir-hk-unassigned-units --> ir-title
  ir-hk-unassigned-units --> ir-button
  ir-title --> ir-icon
  ir-button --> ir-icons
  ir-hk-user --> ir-title
  ir-hk-user --> ir-input-text
  ir-hk-user --> ir-phone-input
  ir-hk-user --> ir-textarea
  ir-hk-user --> ir-button
  ir-phone-input --> ir-combobox
  ir-sidebar --> ir-icon
  ir-delete-modal --> ir-icon
  ir-delete-modal --> ir-select
  ir-delete-modal --> ir-button
  ir-housekeeping --> ir-hk-team
  style ir-hk-team fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
