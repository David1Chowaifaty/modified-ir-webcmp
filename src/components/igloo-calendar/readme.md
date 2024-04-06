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
| `ticket`         | `ticket`          |             | `string` | `''`        |
| `to_date`        | `to_date`         |             | `string` | `undefined` |


## Events

| Event                      | Description | Type                                                 |
| -------------------------- | ----------- | ---------------------------------------------------- |
| `calculateUnassignedDates` |             | `CustomEvent<any>`                                   |
| `dragOverHighlightElement` |             | `CustomEvent<any>`                                   |
| `moveBookingTo`            |             | `CustomEvent<any>`                                   |
| `reduceAvailableUnitEvent` |             | `CustomEvent<{ fromDate: string; toDate: string; }>` |
| `revertBooking`            |             | `CustomEvent<any>`                                   |


## Dependencies

### Depends on

- [ir-toast](../ir-toast)
- [ir-interceptor](../ir-interceptor)
- [igl-to-be-assigned](igl-to-be-assigned)
- [igl-legends](igl-legends)
- [igl-cal-header](igl-cal-header)
- [igl-cal-body](igl-cal-body)
- [igl-cal-footer](igl-cal-footer)
- [ir-loading-screen](../ir-loading-screen)
- [igl-book-property](igl-book-property)
- [ir-sidebar](../ir-sidebar)
- [ir-room-nights](../ir-room-nights)
- [ir-booking-details](../ir-booking-details)
- [ir-modal](../ir-modal)

### Graph
```mermaid
graph TD;
  igloo-calendar --> ir-toast
  igloo-calendar --> ir-interceptor
  igloo-calendar --> igl-to-be-assigned
  igloo-calendar --> igl-legends
  igloo-calendar --> igl-cal-header
  igloo-calendar --> igl-cal-body
  igloo-calendar --> igl-cal-footer
  igloo-calendar --> ir-loading-screen
  igloo-calendar --> igl-book-property
  igloo-calendar --> ir-sidebar
  igloo-calendar --> ir-room-nights
  igloo-calendar --> ir-booking-details
  igloo-calendar --> ir-modal
  igl-to-be-assigned --> igl-tba-category-view
  igl-to-be-assigned --> ir-icon
  igl-tba-category-view --> igl-tba-booking-view
  igl-tba-booking-view --> ir-button
  igl-cal-header --> ir-date-picker
  igl-cal-body --> ir-popover
  igl-cal-body --> igl-booking-event
  igl-booking-event --> igl-booking-event-hover
  igl-booking-event-hover --> ota-label
  igl-booking-event-hover --> ir-date-view
  igl-booking-event-hover --> igl-block-dates-view
  igl-block-dates-view --> ir-date-view
  igl-book-property --> igl-block-dates-view
  igl-book-property --> ir-icon
  igl-book-property --> igl-booking-overview-page
  igl-book-property --> igl-pagetwo
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
  igl-property-booked-by --> ir-tooltip
  ir-sidebar --> ir-icon
  ir-room-nights --> ir-loading-screen
  ir-room-nights --> ir-icon
  ir-room-nights --> ir-button
  ir-booking-details --> ir-toast
  ir-booking-details --> ir-interceptor
  ir-booking-details --> ir-select
  ir-booking-details --> ir-button
  ir-booking-details --> ir-icon
  ir-booking-details --> ir-label
  ir-booking-details --> ota-label
  ir-booking-details --> ir-date-view
  ir-booking-details --> ir-room
  ir-booking-details --> ir-payment-details
  ir-booking-details --> ir-sidebar
  ir-booking-details --> ir-guest-info
  ir-booking-details --> ir-pickup
  ir-booking-details --> igl-book-property
  ir-label --> ir-icon
  ir-room --> ir-icon
  ir-room --> ir-date-view
  ir-room --> ir-button
  ir-room --> ir-label
  ir-room --> ir-modal
  ir-modal --> ir-button
  ir-payment-details --> ir-date-picker
  ir-payment-details --> ir-icon
  ir-payment-details --> ir-modal
  ir-guest-info --> ir-icon
  ir-guest-info --> ir-input-text
  ir-guest-info --> ir-select
  ir-guest-info --> ir-button
  ir-pickup --> ir-title
  ir-pickup --> ir-select
  ir-pickup --> ir-date-picker
  ir-pickup --> ir-input-text
  ir-pickup --> ir-button
  ir-title --> ir-icon
  style igloo-calendar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
