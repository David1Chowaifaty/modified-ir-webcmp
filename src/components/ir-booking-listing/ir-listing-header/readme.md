# ir-listing-header



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type     | Default     |
| ------------ | ------------- | ----------- | -------- | ----------- |
| `baseurl`    | `baseurl`     |             | `string` | `undefined` |
| `language`   | `language`    |             | `string` | `undefined` |
| `propertyId` | `property-id` |             | `number` | `undefined` |


## Dependencies

### Used by

 - [ir-booking-listing](..)

### Depends on

- [igl-book-property-container](../../igl-book-property-container)
- [ir-input-text](../../ir-input-text)
- [ir-select](../../ir-select)
- [igl-date-range](../../igloo-calendar/igl-date-range)
- [ir-icon](../../ir-icon)

### Graph
```mermaid
graph TD;
  ir-listing-header --> igl-book-property-container
  ir-listing-header --> ir-input-text
  ir-listing-header --> ir-select
  ir-listing-header --> igl-date-range
  ir-listing-header --> ir-icon
  igl-book-property-container --> ir-toast
  igl-book-property-container --> ir-interceptor
  igl-book-property-container --> igl-book-property
  ir-interceptor --> ir-loading-screen
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
  ir-booking-listing --> ir-listing-header
  style ir-listing-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
