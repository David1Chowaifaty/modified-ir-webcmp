# ir-booking-header



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type      | Default     |
| ---------------- | ------------------ | ----------- | --------- | ----------- |
| `booking`        | --                 |             | `Booking` | `undefined` |
| `hasCloseButton` | `has-close-button` |             | `boolean` | `undefined` |
| `hasDelete`      | `has-delete`       |             | `boolean` | `undefined` |
| `hasMenu`        | `has-menu`         |             | `boolean` | `undefined` |
| `hasPrint`       | `has-print`        |             | `boolean` | `undefined` |
| `hasReceipt`     | `has-receipt`      |             | `boolean` | `undefined` |


## Events

| Event             | Description | Type                                                                                                 |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `closeSidebar`    |             | `CustomEvent<null>`                                                                                  |
| `openSidebar`     |             | `CustomEvent<{ type: BookingDetailsSidebarEvents; payload?: unknown; }>`                             |
| `resetBookingEvt` |             | `CustomEvent<null>`                                                                                  |
| `toast`           |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-pms-logs](ir-pms-logs)
- [ir-events-log](events-log)
- [ir-select](../../ui/ir-select)
- [ir-button](../../ui/ir-button)
- [ir-dialog](../../ui/ir-dialog)

### Graph
```mermaid
graph TD;
  ir-booking-header --> ir-pms-logs
  ir-booking-header --> ir-events-log
  ir-booking-header --> ir-select
  ir-booking-header --> ir-button
  ir-booking-header --> ir-dialog
  ir-pms-logs --> ir-spinner
  ir-events-log --> ir-spinner
  ir-button --> ir-icons
  ir-dialog --> ir-icon
  ir-booking-details --> ir-booking-header
  style ir-booking-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
