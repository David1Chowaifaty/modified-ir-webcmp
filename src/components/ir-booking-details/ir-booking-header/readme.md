# ir-booking-header



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type      | Default     |
| ---------------- | ------------------ | ----------- | --------- | ----------- |
| `booking`        | --                 |             | `Booking` | `undefined` |
| `hasCloseButton` | `has-close-button` |             | `boolean` | `undefined` |
| `hasDelete`      | `has-delete`       |             | `boolean` | `undefined` |
| `hasEmail`       | `has-email`        |             | `boolean` | `true`      |
| `hasMenu`        | `has-menu`         |             | `boolean` | `undefined` |
| `hasPrint`       | `has-print`        |             | `boolean` | `undefined` |
| `hasReceipt`     | `has-receipt`      |             | `boolean` | `undefined` |


## Events

| Event             | Description | Type                                                                                                 |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `closeSidebar`    |             | `CustomEvent<null>`                                                                                  |
| `openSidebar`     |             | `CustomEvent<{ type: BookingDetailsSidebarEvents; payload?: any; }>`                                 |
| `resetBookingEvt` |             | `CustomEvent<null>`                                                                                  |
| `toast`           |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-pms-logs](ir-pms-logs)
- [ir-events-log](events-log)
- [ir-popover](../../ui/ir-popover)
- [ir-custom-button](../../ui/ir-custom-button)
- [ir-dialog](../../ui/ir-dialog)
- [ir-modal](../../ui/ir-modal)

### Graph
```mermaid
graph TD;
  ir-booking-header --> ir-pms-logs
  ir-booking-header --> ir-events-log
  ir-booking-header --> ir-popover
  ir-booking-header --> ir-custom-button
  ir-booking-header --> ir-dialog
  ir-booking-header --> ir-modal
  ir-pms-logs --> ir-spinner
  ir-events-log --> ir-spinner
  ir-modal --> ir-button
  ir-button --> ir-icons
  ir-booking-details --> ir-booking-header
  style ir-booking-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
