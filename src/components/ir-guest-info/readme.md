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

| Event             | Description | Type                |
| ----------------- | ----------- | ------------------- |
| `closeSideBar`    |             | `CustomEvent<null>` |
| `resetBookingEvt` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](../ir-booking-details)
 - [ir-booking-listing](../ir-booking-listing)

### Depends on

- [ir-spinner](../ui/ir-spinner)
- [ir-icon](../ui/ir-icon)
- [ir-input-text](../ui/ir-input-text)
- [ir-country-picker](../ui/ir-country-picker)
- [ir-phone-input](../ui/ir-phone-input)
- [ir-textarea](../ui/ir-textarea)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-guest-info --> ir-spinner
  ir-guest-info --> ir-icon
  ir-guest-info --> ir-input-text
  ir-guest-info --> ir-country-picker
  ir-guest-info --> ir-phone-input
  ir-guest-info --> ir-textarea
  ir-guest-info --> ir-button
  ir-country-picker --> ir-input-text
  ir-phone-input --> ir-combobox
  ir-button --> ir-icons
  ir-booking-details --> ir-guest-info
  ir-booking-listing --> ir-guest-info
  style ir-guest-info fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
