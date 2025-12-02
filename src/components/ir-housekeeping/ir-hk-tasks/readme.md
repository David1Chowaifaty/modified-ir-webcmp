# ir-hk-tasks



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type     | Default     |
| ------------ | ------------ | ----------- | -------- | ----------- |
| `baseUrl`    | `base-url`   |             | `string` | `undefined` |
| `language`   | `language`   |             | `string` | `''`        |
| `p`          | `p`          |             | `string` | `undefined` |
| `propertyid` | `propertyid` |             | `number` | `undefined` |
| `ticket`     | `ticket`     |             | `string` | `''`        |


## Events

| Event                  | Description | Type                |
| ---------------------- | ----------- | ------------------- |
| `clearSelectedHkTasks` |             | `CustomEvent<void>` |


## Dependencies

### Used by

 - [ir-secure-tasks](../../ir-secure-tasks)

### Depends on

- [ir-loading-screen](../../ir-loading-screen)
- [ir-toast](../../ui/ir-toast)
- [ir-interceptor](../../ir-interceptor)
- [ir-tasks-filters](ir-tasks-filters)
- [ir-tasks-table](ir-tasks-table)
- [ir-modal](../../ui/ir-modal)
- [ir-sidebar](../../ui/ir-sidebar)
- [ir-hk-archive](ir-hk-archive)

### Graph
```mermaid
graph TD;
  ir-hk-tasks --> ir-loading-screen
  ir-hk-tasks --> ir-toast
  ir-hk-tasks --> ir-interceptor
  ir-hk-tasks --> ir-tasks-filters
  ir-hk-tasks --> ir-tasks-table
  ir-hk-tasks --> ir-modal
  ir-hk-tasks --> ir-sidebar
  ir-hk-tasks --> ir-hk-archive
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-tasks-filters --> ir-button
  ir-tasks-filters --> ir-select
  ir-tasks-table --> ir-tasks-header
  ir-tasks-table --> ir-tasks-card
  ir-tasks-table --> ir-tasks-table-pagination
  ir-tasks-table --> ir-checkbox
  ir-tasks-table --> ir-button
  ir-tasks-header --> ir-input-text
  ir-tasks-header --> ir-icons
  ir-tasks-header --> ir-button
  ir-tasks-card --> ir-button
  ir-tasks-table-pagination --> ir-button
  ir-tasks-table-pagination --> ir-pagination
  ir-pagination --> ir-select
  ir-pagination --> ir-custom-button
  ir-modal --> ir-button
  ir-sidebar --> ir-icon
  ir-hk-archive --> ir-title
  ir-hk-archive --> ir-select
  ir-hk-archive --> ir-range-picker
  ir-hk-archive --> ir-button
  ir-hk-archive --> ir-tooltip
  ir-hk-archive --> ir-sidebar
  ir-hk-archive --> ir-booking-details
  ir-title --> ir-icon
  ir-range-picker --> ir-date-picker
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
  ir-booking-details --> ir-guest-info-drawer
  ir-booking-details --> ir-payment-folio
  ir-booking-details --> igl-book-property
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
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  ir-room --> ir-custom-button
  ir-room --> ir-date-view
  ir-room --> ir-tooltip
  ir-room --> ir-label
  ir-room --> ir-modal
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
  ir-guest-info-drawer --> ir-drawer
  ir-guest-info-drawer --> ir-guest-info-form
  ir-guest-info-drawer --> ir-custom-button
  ir-guest-info-form --> ir-validator
  ir-guest-info-form --> ir-custom-input
  ir-guest-info-form --> ir-country-picker
  ir-guest-info-form --> ir-mobile-input
  ir-payment-folio --> ir-drawer
  ir-payment-folio --> ir-custom-date-picker
  ir-payment-folio --> ir-validator
  ir-payment-folio --> ir-custom-input
  ir-payment-folio --> ir-custom-button
  ir-custom-date-picker --> ir-custom-input
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
  ir-phone-input --> ir-combobox
  igl-book-property-footer --> ir-button
  ir-secure-tasks --> ir-hk-tasks
  style ir-hk-tasks fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
