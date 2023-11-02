# igl-book-property



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description | Type                            | Default     |
| ----------------- | ------------------- | ----------- | ------------------------------- | ----------- |
| `bookingData`     | --                  |             | `{ [key: string]: any; }`       | `undefined` |
| `countryNodeList` | `country-node-list` |             | `any`                           | `undefined` |
| `currency`        | --                  |             | `{ id: number; code: string; }` | `undefined` |
| `language`        | `language`          |             | `string`                        | `undefined` |
| `propertyid`      | `propertyid`        |             | `number`                        | `undefined` |


## Events

| Event                | Description | Type                                   |
| -------------------- | ----------- | -------------------------------------- |
| `closeBookingWindow` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [igl-date-range](../igl-date-range)
- [igl-booking-rooms](../igl-booking-rooms)
- [igl-block-dates-view](../igl-block-dates-view)
- [igl-pagetwo](../igl-pagetwo)

### Graph
```mermaid
graph TD;
  igl-book-property --> igl-date-range
  igl-book-property --> igl-booking-rooms
  igl-book-property --> igl-block-dates-view
  igl-book-property --> igl-pagetwo
  igl-date-range --> ir-date-picker
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-pagetwo --> igl-application-info
  igl-pagetwo --> igl-property-booked-by
  igl-application-info --> ir-tooltip
  igloo-calendar --> igl-book-property
  style igl-book-property fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
