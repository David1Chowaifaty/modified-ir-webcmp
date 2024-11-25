# ir-extra-service-config



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                                                                                                                                                                     | Default     |
| --------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `booking` | --        |             | `{ from_date: string; to_date: string; currency: Currency; booking_nbr: string; }`                                                                                       | `undefined` |
| `service` | --        |             | `{ description?: string; booking_system_id?: number; cost?: number; currency_id?: number; end_date?: string; price?: number; start_date?: string; system_id?: number; }` | `undefined` |


## Events

| Event              | Description | Type                |
| ------------------ | ----------- | ------------------- |
| `closeModal`       |             | `CustomEvent<null>` |
| `resetBookingData` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](../..)

### Depends on

- [ir-title](../../../ir-title)
- [ir-date-picker](../../../ir-date-picker)
- [ir-button](../../../ir-button)

### Graph
```mermaid
graph TD;
  ir-extra-service-config --> ir-title
  ir-extra-service-config --> ir-date-picker
  ir-extra-service-config --> ir-button
  ir-title --> ir-icon
  ir-button --> ir-icons
  ir-booking-details --> ir-extra-service-config
  style ir-extra-service-config fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
