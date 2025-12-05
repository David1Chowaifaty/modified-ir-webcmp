# ir-extra-service-config-form



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                                                                                                                                                                     | Default     |
| --------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `booking` | --        |             | `{ currency: Currency; from_date: string; to_date: string; booking_nbr: string; }`                                                                                       | `undefined` |
| `service` | --        |             | `{ cost?: number; description?: string; booking_system_id?: number; currency_id?: number; end_date?: string; start_date?: string; price?: number; system_id?: number; }` | `undefined` |


## Events

| Event             | Description | Type                |
| ----------------- | ----------- | ------------------- |
| `closeModal`      |             | `CustomEvent<null>` |
| `resetBookingEvt` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-extra-service-config](..)

### Depends on

- [ir-validator](../../../../ui/ir-validator)
- [ir-custom-date-picker](../../../../ir-custom-date-picker)
- [ir-custom-input](../../../../ui/ir-custom-input)

### Graph
```mermaid
graph TD;
  ir-extra-service-config-form --> ir-validator
  ir-extra-service-config-form --> ir-custom-date-picker
  ir-extra-service-config-form --> ir-custom-input
  ir-custom-date-picker --> ir-custom-input
  ir-extra-service-config --> ir-extra-service-config-form
  style ir-extra-service-config-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
