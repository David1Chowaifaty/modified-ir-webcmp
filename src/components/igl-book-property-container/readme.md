# igl-book-property-container



<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute                       | Description | Type      | Default     |
| --------------------------- | ------------------------------- | ----------- | --------- | ----------- |
| `baseurl`                   | `baseurl`                       |             | `string`  | `''`        |
| `from_date`                 | `from_date`                     |             | `string`  | `undefined` |
| `language`                  | `language`                      |             | `string`  | `''`        |
| `propertyid`                | `propertyid`                    |             | `number`  | `undefined` |
| `ticket`                    | `ticket`                        |             | `string`  | `''`        |
| `to_date`                   | `to_date`                       |             | `string`  | `undefined` |
| `withIrToastAndInterceptor` | `with-ir-toast-and-interceptor` |             | `boolean` | `true`      |


## Events

| Event              | Description | Type                |
| ------------------ | ----------- | ------------------- |
| `resetBookingData` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-listing-header](../ir-booking-listing/ir-listing-header)

### Depends on

- [ir-toast](../ir-toast)
- [ir-interceptor](../ir-interceptor)
- [igl-book-property](../igloo-calendar/igl-book-property)

### Graph
```mermaid
graph TD;
  igl-book-property-container --> ir-toast
  igl-book-property-container --> ir-interceptor
  igl-book-property-container --> igl-book-property
  igl-book-property --> igl-block-dates-view
  igl-book-property --> ir-icon
  igl-book-property --> igl-booking-overview-page
  igl-book-property --> igl-pagetwo
  igl-block-dates-view --> ir-date-view
  igl-booking-overview-page --> igl-book-property-header
  igl-booking-overview-page --> igl-booking-rooms
  igl-booking-overview-page --> igl-book-property-footer
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> ir-select
  igl-book-property-header --> ir-button
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-picker
  igl-date-range --> ir-date-view
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-pagetwo --> ir-date-view
  igl-pagetwo --> igl-application-info
  igl-pagetwo --> igl-property-booked-by
  igl-pagetwo --> ir-button
  igl-application-info --> ir-tooltip
  igl-property-booked-by --> ir-autocomplete
  ir-listing-header --> igl-book-property-container
  style igl-book-property-container fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
