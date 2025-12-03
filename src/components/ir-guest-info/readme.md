# ir-guest-info



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute        | Description | Type      | Default     |
| ------------- | ---------------- | ----------- | --------- | ----------- |
| `booking_nbr` | `booking_nbr`    |             | `string`  | `undefined` |
| `email`       | `email`          |             | `string`  | `undefined` |
| `headerShown` | `header-shown`   |             | `boolean` | `undefined` |
| `isInSideBar` | `is-in-side-bar` |             | `boolean` | `undefined` |
| `language`    | `language`       |             | `string`  | `undefined` |
| `ticket`      | `ticket`         |             | `string`  | `undefined` |


## Events

| Event             | Description | Type                                                                                                 |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `closeSideBar`    |             | `CustomEvent<null>`                                                                                  |
| `resetBookingEvt` |             | `CustomEvent<null>`                                                                                  |
| `toast`           |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Depends on

- [ir-spinner](../ui/ir-spinner)
- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-title](../ir-title)
- [ir-input-text](../ui/ir-input-text)
- [ir-country-picker](../ui/ir-country-picker)
- [ir-phone-input](../ui/ir-phone-input)
- [ir-textarea](../ui/ir-textarea)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-guest-info --> ir-spinner
  ir-guest-info --> ir-toast
  ir-guest-info --> ir-interceptor
  ir-guest-info --> ir-title
  ir-guest-info --> ir-input-text
  ir-guest-info --> ir-country-picker
  ir-guest-info --> ir-phone-input
  ir-guest-info --> ir-textarea
  ir-guest-info --> ir-button
  ir-interceptor --> ir-spinner
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-title --> ir-icon
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  ir-phone-input --> ir-combobox
  style ir-guest-info fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
