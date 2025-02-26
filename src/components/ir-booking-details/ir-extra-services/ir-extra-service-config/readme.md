# ir-extra-service-config



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                                                                                                                                                                     | Default     |
| --------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `booking` | --        |             | `{ from_date: string; to_date: string; currency: Currency; booking_nbr: string; }`                                                                                       | `undefined` |
| `service` | --        |             | `{ description?: string; cost?: number; booking_system_id?: number; currency_id?: number; end_date?: string; price?: number; start_date?: string; system_id?: number; }` | `undefined` |


## Events

| Event             | Description | Type                |
| ----------------- | ----------- | ------------------- |
| `closeModal`      |             | `CustomEvent<null>` |
| `resetBookingEvt` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](../..)

### Depends on

- [ir-title](../../../ir-title)
- [ir-date-picker](../../../ui/ir-date-picker)
- [ir-button](../../../ui/ir-button)
- [ir-price-input](../../../ui/ir-price-input)

### Graph
```mermaid
graph TD;
  ir-extra-service-config --> ir-title
  ir-extra-service-config --> ir-date-picker
  ir-extra-service-config --> ir-button
  ir-extra-service-config --> ir-price-input
  ir-title --> ir-icon
  ir-button --> ir-icons
  ir-booking-details --> ir-extra-service-config
  style ir-extra-service-config fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
