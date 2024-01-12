# igl-book-property



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                 | Description | Type                                                                       | Default     |
| ----------------------- | ------------------------- | ----------- | -------------------------------------------------------------------------- | ----------- |
| `adultChildConstraints` | --                        |             | `{ adult_max_nbr: number; child_max_nbr: number; child_max_age: number; }` | `undefined` |
| `allowedBookingSources` | `allowed-booking-sources` |             | `any`                                                                      | `undefined` |
| `bookingData`           | --                        |             | `{ [key: string]: any; }`                                                  | `undefined` |
| `countryNodeList`       | `country-node-list`       |             | `any`                                                                      | `undefined` |
| `currency`              | --                        |             | `{ id: number; code: string; }`                                            | `undefined` |
| `language`              | `language`                |             | `string`                                                                   | `undefined` |
| `propertyid`            | `propertyid`              |             | `number`                                                                   | `undefined` |
| `showPaymentDetails`    | `show-payment-details`    |             | `boolean`                                                                  | `false`     |


## Events

| Event                | Description | Type                                                          |
| -------------------- | ----------- | ------------------------------------------------------------- |
| `blockedCreated`     |             | `CustomEvent<RoomBlockDetails>`                               |
| `bookingCreated`     |             | `CustomEvent<{ pool?: string; data: RoomBookingDetails[]; }>` |
| `closeBookingWindow` |             | `CustomEvent<{ [key: string]: any; }>`                        |
| `editFinished`       |             | `CustomEvent<null>`                                           |


## Dependencies

### Used by

 - [igloo-calendar](..)
 - [ir-booking-details](../../ir-booking-details)

### Depends on

- [igl-block-dates-view](../igl-block-dates-view)
- [igl-booking-overview-page](igl-booking-overview-page)
- [igl-pagetwo](../igl-pagetwo)

### Graph
```mermaid
graph TD;
  igl-book-property --> igl-block-dates-view
  igl-book-property --> igl-booking-overview-page
  igl-book-property --> igl-pagetwo
  igl-booking-overview-page --> igl-book-property-header
  igl-booking-overview-page --> igl-booking-rooms
  igl-booking-overview-page --> igl-book-property-footer
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-picker
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-pagetwo --> igl-application-info
  igl-pagetwo --> igl-property-booked-by
  igl-application-info --> ir-tooltip
  igl-property-booked-by --> ir-autocomplete
  igloo-calendar --> igl-book-property
  ir-booking-details --> igl-book-property
  style igl-book-property fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
