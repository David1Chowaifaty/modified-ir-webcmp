# ir-extra-service-config



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                                                                                                                                                                     | Default     |
| --------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `booking` | --        |             | `{ currency: Currency; from_date: string; to_date: string; booking_nbr: string; }`                                                                                       | `undefined` |
| `open`    | `open`    |             | `boolean`                                                                                                                                                                | `undefined` |
| `service` | --        |             | `{ cost?: number; description?: string; booking_system_id?: number; currency_id?: number; end_date?: string; start_date?: string; price?: number; system_id?: number; }` | `undefined` |


## Events

| Event             | Description | Type                |
| ----------------- | ----------- | ------------------- |
| `closeModal`      |             | `CustomEvent<null>` |
| `resetBookingEvt` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](../..)

### Depends on

- [ir-drawer](../../../ir-drawer)
- [ir-validator](../../../ui/ir-validator)
- [ir-custom-date-picker](../../../ir-custom-date-picker)
- [ir-custom-input](../../../ui/ir-custom-input)
- [ir-custom-button](../../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-extra-service-config --> ir-drawer
  ir-extra-service-config --> ir-validator
  ir-extra-service-config --> ir-custom-date-picker
  ir-extra-service-config --> ir-custom-input
  ir-extra-service-config --> ir-custom-button
  ir-custom-date-picker --> ir-custom-input
  ir-booking-details --> ir-extra-service-config
  style ir-extra-service-config fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
