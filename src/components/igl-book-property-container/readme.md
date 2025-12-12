# igl-book-property-container



<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute                       | Description | Type      | Default     |
| --------------------------- | ------------------------------- | ----------- | --------- | ----------- |
| `from_date`                 | `from_date`                     |             | `string`  | `undefined` |
| `language`                  | `language`                      |             | `string`  | `''`        |
| `p`                         | `p`                             |             | `string`  | `undefined` |
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

- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [igl-book-property](../igloo-calendar/igl-book-property)

### Graph
```mermaid
graph TD;
  igl-book-property-container --> ir-toast
  igl-book-property-container --> ir-interceptor
  igl-book-property-container --> igl-book-property
  ir-interceptor --> ir-spinner
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  igl-book-property --> igl-block-dates-view
  igl-book-property --> ir-spinner
  igl-book-property --> ir-icon
  igl-book-property --> igl-booking-overview-page
  igl-book-property --> igl-booking-form
  igl-book-property --> ir-button
  igl-book-property --> igl-book-property-footer
  igl-block-dates-view --> ir-date-view
  igl-booking-overview-page --> igl-book-property-header
  igl-booking-overview-page --> igl-room-type
  igl-book-property-header --> ir-picker
  igl-book-property-header --> ir-picker-item
  igl-book-property-header --> ir-custom-button
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-range
  igl-room-type --> igl-rate-plan
  igl-rate-plan --> ir-input
  igl-rate-plan --> ir-custom-button
  igl-booking-form --> ir-date-view
  igl-booking-form --> igl-application-info
  igl-booking-form --> igl-property-booked-by
  igl-application-info --> ir-input
  igl-property-booked-by --> ir-picker
  igl-property-booked-by --> ir-picker-item
  igl-property-booked-by --> ir-input
  igl-property-booked-by --> ir-country-picker
  igl-property-booked-by --> ir-mobile-input
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  igl-book-property-footer --> ir-custom-button
  ir-listing-header --> igl-book-property-container
  style igl-book-property-container fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
