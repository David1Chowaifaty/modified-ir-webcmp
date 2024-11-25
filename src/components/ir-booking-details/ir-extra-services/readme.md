# ir-extra-services



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                                                                                                                                                                                                                                     | Default     |
| --------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `booking` | --        |             | `{ currency: Currency; booking_nbr: string; extra_services: { description?: string; booking_system_id?: number; cost?: number; currency_id?: number; end_date?: string; price?: number; start_date?: string; system_id?: number; }[]; }` | `undefined` |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-extra-service](ir-extra-service)

### Graph
```mermaid
graph TD;
  ir-extra-services --> ir-extra-service
  ir-extra-service --> ir-button
  ir-extra-service --> ir-date-view
  ir-extra-service --> ir-modal
  ir-button --> ir-icons
  ir-modal --> ir-button
  ir-booking-details --> ir-extra-services
  style ir-extra-services fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
