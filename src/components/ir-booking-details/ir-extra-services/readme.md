# ir-extra-services



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                                                                                                                                                                                                                                     | Default     |
| --------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `booking` | --        |             | `{ currency: Currency; booking_nbr: string; extra_services: { system_id?: number; cost?: number; description?: string; booking_system_id?: number; currency_id?: number; end_date?: string; start_date?: string; price?: number; }[]; }` | `undefined` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-custom-button](../../ui/ir-custom-button)
- [ir-empty-state](../../ir-empty-state)
- [ir-extra-service](ir-extra-service)

### Graph
```mermaid
graph TD;
  ir-extra-services --> ir-custom-button
  ir-extra-services --> ir-empty-state
  ir-extra-services --> ir-extra-service
  ir-extra-service --> ir-custom-button
  ir-extra-service --> ir-date-view
  ir-extra-service --> ir-dialog
  ir-booking-details --> ir-extra-services
  style ir-extra-services fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
