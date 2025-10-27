# ir-booking-email-logs



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `ticket` | `ticket`  |             | `string` | `undefined` |


## Dependencies

### Used by

 - [ir-secure-tasks](../ir-secure-tasks)

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-toast](../ui/ir-toast)
- [ir-input-text](../ui/ir-input-text)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-booking-email-logs --> ir-interceptor
  ir-booking-email-logs --> ir-toast
  ir-booking-email-logs --> ir-input-text
  ir-booking-email-logs --> ir-button
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-secure-tasks --> ir-booking-email-logs
  style ir-booking-email-logs fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
