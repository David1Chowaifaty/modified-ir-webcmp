# ir-interceptor



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute | Description | Type       | Default                                                                          |
| ------------------ | --------- | ----------- | ---------- | -------------------------------------------------------------------------------- |
| `handledEndpoints` | --        |             | `string[]` | `['/Get_Exposed_Calendar', '/ReAllocate_Exposed_Room', '/Get_Exposed_Bookings']` |


## Events

| Event   | Description | Type                                                                                                 |
| ------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `toast` |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igl-book-property-container](../igl-book-property-container)
 - [igloo-calendar](../igloo-calendar)
 - [ir-booking-details](../ir-booking-details)
 - [ir-booking-listing](../ir-booking-listing)
 - [ir-hk-tasks](../ir-housekeeping/ir-hk-tasks)
 - [ir-housekeeping](../ir-housekeeping)
 - [ir-login](../ir-login)

### Graph
```mermaid
graph TD;
  igl-book-property-container --> ir-interceptor
  igloo-calendar --> ir-interceptor
  ir-booking-details --> ir-interceptor
  ir-booking-listing --> ir-interceptor
  ir-hk-tasks --> ir-interceptor
  ir-housekeeping --> ir-interceptor
  ir-login --> ir-interceptor
  style ir-interceptor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
