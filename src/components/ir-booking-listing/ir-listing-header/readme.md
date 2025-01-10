# ir-listing-header



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type     | Default     |
| ------------ | ------------- | ----------- | -------- | ----------- |
| `language`   | `language`    |             | `string` | `undefined` |
| `p`          | `p`           |             | `string` | `undefined` |
| `propertyId` | `property-id` |             | `number` | `undefined` |


## Events

| Event             | Description | Type                  |
| ----------------- | ----------- | --------------------- |
| `preventPageLoad` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-booking-listing](..)

### Depends on

- [igl-book-property-container](../../igl-book-property-container)
- [ir-button](../../ir-button)
- [ir-input-text](../../ir-input-text)
- [ir-select](../../ir-select)
- [ir-date-picker](../../ir-date-picker)

### Graph
```mermaid
graph TD;
  ir-listing-header --> igl-book-property-container
  ir-listing-header --> ir-button
  ir-listing-header --> ir-input-text
  ir-listing-header --> ir-select
  ir-listing-header --> ir-date-picker
  igl-book-property-container --> ir-toast
  igl-book-property-container --> ir-interceptor
  igl-book-property-container --> igl-book-property
  igl-book-property --> igl-block-dates-view
  igl-book-property --> ir-button
  igl-book-property --> ir-icon
  igl-book-property --> igl-booking-overview-page
  igl-book-property --> igl-booking-form
  igl-block-dates-view --> ir-date-view
  ir-button --> ir-icons
  igl-booking-overview-page --> igl-book-property-header
  igl-booking-overview-page --> igl-room-type
  igl-booking-overview-page --> igl-book-property-footer
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> ir-select
  igl-book-property-header --> ir-button
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-picker
  igl-date-range --> ir-date-view
  igl-room-type --> igl-rate-plan
  igl-rate-plan --> ir-tooltip
  igl-rate-plan --> ir-price-input
  igl-book-property-footer --> ir-button
  igl-booking-form --> ir-date-view
  igl-booking-form --> igl-application-info
  igl-booking-form --> igl-property-booked-by
  igl-booking-form --> ir-button
  igl-application-info --> ir-tooltip
  igl-property-booked-by --> ir-autocomplete
  igl-property-booked-by --> ir-tooltip
  igl-property-booked-by --> ir-phone-input
  ir-phone-input --> ir-combobox
  ir-booking-listing --> ir-listing-header
  style ir-listing-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
