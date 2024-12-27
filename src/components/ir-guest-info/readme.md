# ir-guest-info



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type      | Default     |
| ------------- | -------------- | ----------- | --------- | ----------- |
| `booking_nbr` | `booking_nbr`  |             | `string`  | `undefined` |
| `email`       | `email`        |             | `string`  | `undefined` |
| `headerShown` | `header-shown` |             | `boolean` | `undefined` |
| `language`    | `language`     |             | `string`  | `undefined` |
| `ticket`      | `ticket`       |             | `string`  | `undefined` |


## Events

| Event          | Description | Type                |
| -------------- | ----------- | ------------------- |
| `closeSideBar` |             | `CustomEvent<null>` |
| `resetbooking` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](../ir-booking-details)
 - [ir-booking-listing](../ir-booking-listing)

### Depends on

- [ir-icon](../ir-icon)
- [ir-input-text](../ir-input-text)
- [ir-select](../ir-select)
- [ir-textarea](../ir-textarea)
- [ir-button](../ir-button)

### Graph
```mermaid
graph TD;
  ir-guest-info --> ir-icon
  ir-guest-info --> ir-input-text
  ir-guest-info --> ir-select
  ir-guest-info --> ir-textarea
  ir-guest-info --> ir-button
  ir-button --> ir-icons
  ir-booking-details --> ir-guest-info
  ir-booking-listing --> ir-guest-info
  style ir-guest-info fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
