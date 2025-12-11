# ir-extra-service-config



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                                                                                                                                                                     | Default     |
| --------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `booking` | --        |             | `{ currency: Currency; from_date: string; to_date: string; booking_nbr: string; }`                                                                                       | `undefined` |
| `open`    | `open`    |             | `boolean`                                                                                                                                                                | `undefined` |
| `service` | --        |             | `{ cost?: number; system_id?: number; description?: string; booking_system_id?: number; currency_id?: number; end_date?: string; start_date?: string; price?: number; }` | `undefined` |


## Events

| Event        | Description | Type                |
| ------------ | ----------- | ------------------- |
| `closeModal` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](../..)

### Depends on

- [ir-drawer](../../../ir-drawer)
- [ir-extra-service-config-form](ir-extra-service-config-form)
- [ir-custom-button](../../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-extra-service-config --> ir-drawer
  ir-extra-service-config --> ir-extra-service-config-form
  ir-extra-service-config --> ir-custom-button
  ir-extra-service-config-form --> ir-validator
  ir-extra-service-config-form --> ir-custom-date-picker
  ir-extra-service-config-form --> ir-input
  ir-custom-date-picker --> ir-input
  ir-booking-details --> ir-extra-service-config
  style ir-extra-service-config fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
