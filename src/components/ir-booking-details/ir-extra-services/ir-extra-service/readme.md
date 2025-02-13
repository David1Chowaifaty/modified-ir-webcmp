# ir-extra-service



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description | Type                                                                                                                                                                     | Default     |
| ---------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `bookingNumber`  | `booking-number`  |             | `string`                                                                                                                                                                 | `undefined` |
| `currencySymbol` | `currency-symbol` |             | `string`                                                                                                                                                                 | `undefined` |
| `service`        | --                |             | `{ description?: string; booking_system_id?: number; cost?: number; currency_id?: number; end_date?: string; price?: number; start_date?: string; system_id?: number; }` | `undefined` |


## Events

| Event              | Description | Type                                                                                                                                                                                  |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `editExtraService` |             | `CustomEvent<{ description?: string; booking_system_id?: number; cost?: number; currency_id?: number; end_date?: string; price?: number; start_date?: string; system_id?: number; }>` |
| `resetBookingEvt`  |             | `CustomEvent<null>`                                                                                                                                                                   |


## Dependencies

### Used by

 - [ir-extra-services](..)

### Depends on

- [ir-button](../../../ui/ir-button)
- [ir-date-view](../../../ir-date-view)
- [ir-modal](../../../ui/ir-modal)

### Graph
```mermaid
graph TD;
  ir-extra-service --> ir-button
  ir-extra-service --> ir-date-view
  ir-extra-service --> ir-modal
  ir-button --> ir-icons
  ir-modal --> ir-button
  ir-extra-services --> ir-extra-service
  style ir-extra-service fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
