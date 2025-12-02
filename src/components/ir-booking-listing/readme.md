# ir-booking-listing



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type     | Default     |
| ------------ | ------------ | ----------- | -------- | ----------- |
| `baseUrl`    | `base-url`   |             | `string` | `undefined` |
| `language`   | `language`   |             | `string` | `''`        |
| `p`          | `p`          |             | `string` | `undefined` |
| `propertyid` | `propertyid` |             | `number` | `undefined` |
| `rowCount`   | `row-count`  |             | `number` | `10`        |
| `ticket`     | `ticket`     |             | `string` | `''`        |
| `userType`   | `user-type`  |             | `number` | `undefined` |


## Dependencies

### Used by

 - [ir-secure-tasks](../ir-secure-tasks)

### Depends on

- [ir-loading-screen](../ir-loading-screen)
- [ir-interceptor](../ir-interceptor)
- [ir-toast](../ui/ir-toast)
- [ir-listing-header](ir-listing-header)
- [ir-booking-listing-table](ir-booking-listing-table)
- [ir-drawer](../ir-drawer)
- [ir-booking-details](../ir-booking-details)
- [ir-guest-info-drawer](../ir-guest-info/ir-guest-info-drawer)
- [ir-payment-folio](../ir-booking-details/ir-payment-details/ir-payment-folio)

### Graph
```mermaid
graph TD;
  ir-booking-listing --> ir-loading-screen
  ir-booking-listing --> ir-interceptor
  ir-booking-listing --> ir-toast
  ir-booking-listing --> ir-listing-header
  ir-booking-listing --> ir-booking-listing-table
  ir-booking-listing --> ir-drawer
  ir-booking-listing --> ir-booking-details
  ir-booking-listing --> ir-guest-info-drawer
  ir-booking-listing --> ir-payment-folio
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-listing-header --> igl-book-property-container
  ir-listing-header --> ir-button
  ir-listing-header --> ir-input-text
  ir-listing-header --> ir-select
  ir-listing-header --> ir-range-picker
  igl-book-property-container --> ir-toast
  igl-book-property-container --> ir-interceptor
  igl-book-property-container --> igl-book-property
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
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> ir-select
  igl-book-property-header --> ir-button
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-range
  igl-room-type --> igl-rate-plan
  igl-rate-plan --> ir-tooltip
  igl-rate-plan --> ir-price-input
  igl-booking-form --> ir-date-view
  igl-booking-form --> igl-application-info
  igl-booking-form --> igl-property-booked-by
  igl-application-info --> ir-tooltip
  igl-property-booked-by --> ir-autocomplete
  igl-property-booked-by --> ir-tooltip
  igl-property-booked-by --> ir-country-picker
  igl-property-booked-by --> ir-phone-input
  igl-property-booked-by --> ir-select
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  ir-phone-input --> ir-combobox
  igl-book-property-footer --> ir-button
  ir-range-picker --> ir-date-picker
  ir-booking-listing-table --> ir-booking-number-cell
  ir-booking-listing-table --> ir-booked-on-cell
  ir-booking-listing-table --> ir-booked-by-source-cell
  ir-booking-listing-table --> ir-unit-cell
  ir-booking-listing-table --> ir-dates-cell
  ir-booking-listing-table --> ir-balance-cell
  ir-booking-listing-table --> ir-status-activity-cell
  ir-booking-listing-table --> ir-actions-cell
  ir-booking-listing-table --> ir-pagination
  ir-booking-listing-table --> ir-dialog
  ir-booking-listing-table --> ir-custom-button
  ir-booking-number-cell --> ir-custom-button
  ir-booked-by-source-cell --> ir-custom-button
  ir-unit-cell --> ir-unit-tag
  ir-balance-cell --> ir-custom-button
  ir-status-activity-cell --> ir-booking-status-tag
  ir-actions-cell --> ir-custom-button
  ir-pagination --> ir-select
  ir-pagination --> ir-custom-button
  ir-booking-details --> ir-guest-info
  ir-booking-details --> ir-pickup
  ir-booking-details --> ir-extra-service-config
  ir-booking-details --> ir-room-guests
  ir-booking-details --> ir-room
  ir-booking-details --> ir-spinner
  ir-booking-details --> ir-toast
  ir-booking-details --> ir-interceptor
  ir-booking-details --> ir-booking-header
  ir-booking-details --> ir-reservation-information
  ir-booking-details --> ir-date-view
  ir-booking-details --> ir-custom-button
  ir-booking-details --> ir-pickup-view
  ir-booking-details --> ir-extra-services
  ir-booking-details --> ir-payment-details
  ir-booking-details --> ir-modal
  ir-booking-details --> ir-sidebar
  ir-booking-details --> ir-payment-folio
  ir-booking-details --> igl-book-property
  ir-guest-info --> ir-spinner
  ir-guest-info --> ir-toast
  ir-guest-info --> ir-interceptor
  ir-guest-info --> ir-title
  ir-guest-info --> ir-input-text
  ir-guest-info --> ir-country-picker
  ir-guest-info --> ir-phone-input
  ir-guest-info --> ir-textarea
  ir-guest-info --> ir-button
  ir-title --> ir-icon
  ir-pickup --> ir-title
  ir-pickup --> ir-select
  ir-pickup --> ir-date-picker
  ir-pickup --> ir-input-text
  ir-pickup --> ir-price-input
  ir-pickup --> ir-button
  ir-extra-service-config --> ir-title
  ir-extra-service-config --> ir-date-picker
  ir-extra-service-config --> ir-button
  ir-extra-service-config --> ir-price-input
  ir-room-guests --> ir-spinner
  ir-room-guests --> ir-title
  ir-room-guests --> ir-input-text
  ir-room-guests --> ir-country-picker
  ir-room-guests --> ir-select
  ir-room-guests --> ir-button
  ir-room --> ir-custom-button
  ir-room --> ir-date-view
  ir-room --> ir-tooltip
  ir-room --> ir-label
  ir-room --> ir-modal
  ir-modal --> ir-button
  ir-booking-header --> ir-pms-logs
  ir-booking-header --> ir-events-log
  ir-booking-header --> ir-booking-status-tag
  ir-booking-header --> ir-popover
  ir-booking-header --> ir-custom-button
  ir-booking-header --> ir-dialog
  ir-booking-header --> ir-modal
  ir-pms-logs --> ir-spinner
  ir-events-log --> ir-spinner
  ir-reservation-information --> ir-label
  ir-reservation-information --> ir-custom-button
  ir-reservation-information --> ota-label
  ir-reservation-information --> ir-booking-extra-note
  ir-reservation-information --> ir-booking-company-form
  ir-booking-extra-note --> ir-dialog
  ir-booking-extra-note --> ir-custom-button
  ir-booking-company-form --> ir-dialog
  ir-booking-company-form --> ir-custom-input
  ir-booking-company-form --> ir-custom-button
  ir-pickup-view --> ir-custom-button
  ir-pickup-view --> ir-label
  ir-extra-services --> ir-custom-button
  ir-extra-services --> ir-extra-service
  ir-extra-service --> ir-custom-button
  ir-extra-service --> ir-date-view
  ir-extra-service --> ir-modal
  ir-payment-details --> ir-payment-summary
  ir-payment-details --> ir-booking-guarantee
  ir-payment-details --> ir-applicable-policies
  ir-payment-details --> ir-button
  ir-payment-details --> ir-payments-folio
  ir-payment-details --> ir-modal
  ir-booking-guarantee --> ir-label
  ir-booking-guarantee --> ir-button
  ir-applicable-policies --> ir-custom-button
  ir-applicable-policies --> ir-icons
  ir-payments-folio --> ir-payment-item
  ir-payments-folio --> ir-custom-button
  ir-payment-item --> ir-popover
  ir-payment-item --> ir-button
  ir-payment-item --> ir-custom-button
  ir-sidebar --> ir-icon
  ir-payment-folio --> ir-drawer
  ir-payment-folio --> ir-custom-date-picker
  ir-payment-folio --> ir-validator
  ir-payment-folio --> ir-custom-input
  ir-payment-folio --> ir-custom-button
  ir-custom-date-picker --> ir-custom-input
  ir-guest-info-drawer --> ir-drawer
  ir-guest-info-drawer --> ir-spinner
  ir-guest-info-drawer --> ir-guest-info-form
  ir-guest-info-drawer --> ir-custom-button
  ir-guest-info-form --> ir-custom-input
  ir-guest-info-form --> ir-country-picker
  ir-guest-info-form --> ir-mobile-input
  ir-secure-tasks --> ir-booking-listing
  style ir-booking-listing fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
