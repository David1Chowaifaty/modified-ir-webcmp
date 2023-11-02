# igloo-calendar



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description | Type     | Default     |
| ---------------- | ----------------- | ----------- | -------- | ----------- |
| `baseurl`        | `baseurl`         |             | `string` | `undefined` |
| `currencyName`   | `currency-name`   |             | `string` | `undefined` |
| `from_date`      | `from_date`       |             | `string` | `undefined` |
| `language`       | `language`        |             | `string` | `undefined` |
| `loadingMessage` | `loading-message` |             | `string` | `undefined` |
| `propertyid`     | `propertyid`      |             | `number` | `undefined` |
| `ticket`         | `ticket`          |             | `string` | `""`        |
| `to_date`        | `to_date`         |             | `string` | `undefined` |


## Events

| Event                      | Description | Type               |
| -------------------------- | ----------- | ------------------ |
| `dragOverHighlightElement` |             | `CustomEvent<any>` |
| `moveBookingTo`            |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-common](../ir-common)
- [igl-to-be-assigned](igl-to-be-assigned)
- [igl-legends](igl-legends)
- [igl-cal-header](igl-cal-header)
- [igl-cal-body](igl-cal-body)
- [igl-cal-footer](igl-cal-footer)
- [igl-book-property](igl-book-property)

### Graph
```mermaid
graph TD;
  igloo-calendar --> ir-interceptor
  igloo-calendar --> ir-common
  igloo-calendar --> igl-to-be-assigned
  igloo-calendar --> igl-legends
  igloo-calendar --> igl-cal-header
  igloo-calendar --> igl-cal-body
  igloo-calendar --> igl-cal-footer
  igloo-calendar --> igl-book-property
  igl-to-be-assigned --> igl-tba-category-view
  igl-tba-category-view --> igl-tba-booking-view
  igl-cal-body --> igl-booking-event
  igl-booking-event --> igl-booking-event-hover
  igl-booking-event-hover --> igl-block-dates-view
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
  style igloo-calendar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
