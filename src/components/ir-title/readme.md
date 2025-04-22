# ir-title



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description | Type                                                                                                                                                                                                  | Default     |
| ---------------- | ----------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `borderShown`    | `border-shown`    |             | `boolean`                                                                                                                                                                                             | `undefined` |
| `displayContext` | `display-context` |             | `"default" \| "sidebar"`                                                                                                                                                                              | `'default'` |
| `justifyContent` | `justify-content` |             | `"center" \| "end" \| "flex-end" \| "flex-start" \| "left" \| "normal" \| "right" \| "safe center" \| "space-around" \| "space-between" \| "space-evenly" \| "start" \| "stretch" \| "unsafe center"` | `'start'`   |
| `label`          | `label`           |             | `string`                                                                                                                                                                                              | `undefined` |


## Events

| Event          | Description | Type                |
| -------------- | ----------- | ------------------- |
| `closeSideBar` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-extra-note](../ir-booking-details/ir-booking-extra-note)
 - [ir-extra-service-config](../ir-booking-details/ir-extra-services/ir-extra-service-config)
 - [ir-guest-info](../ir-guest-info)
 - [ir-hk-archive](../ir-housekeeping/ir-hk-tasks/ir-hk-archive)
 - [ir-hk-team](../ir-housekeeping/ir-hk-team)
 - [ir-hk-unassigned-units](../ir-housekeeping/ir-hk-unassigned-units)
 - [ir-hk-user](../ir-housekeeping/ir-hk-user)
 - [ir-housekeeping](../ir-housekeeping)
 - [ir-option-details](../ir-payment-option/ir-option-details)
 - [ir-pickup](../ir-booking-details/ir-pickup)
 - [ir-reset-password](../ir-reset-password)
 - [ir-room-guests](../ir-booking-details/ir-room-guests)
 - [ir-room-nights](../igloo-calendar/ir-room-nights)
 - [ir-unit-status](../ir-housekeeping/ir-unit-status)
 - [ir-user-form-panel](../ir-user-management/ir-user-form-panel)

### Depends on

- [ir-icon](../ui/ir-icon)

### Graph
```mermaid
graph TD;
  ir-title --> ir-icon
  ir-booking-extra-note --> ir-title
  ir-extra-service-config --> ir-title
  ir-guest-info --> ir-title
  ir-hk-archive --> ir-title
  ir-hk-team --> ir-title
  ir-hk-unassigned-units --> ir-title
  ir-hk-user --> ir-title
  ir-housekeeping --> ir-title
  ir-option-details --> ir-title
  ir-pickup --> ir-title
  ir-reset-password --> ir-title
  ir-room-guests --> ir-title
  ir-room-nights --> ir-title
  ir-unit-status --> ir-title
  ir-user-form-panel --> ir-title
  style ir-title fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
