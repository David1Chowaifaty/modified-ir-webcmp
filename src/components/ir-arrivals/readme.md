# ir-arrivals



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                                                                                                           | Type     | Default     |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| `language`   | `language`   | Two-letter language code (ISO) used for translations and API locale. Defaults to `'en'`.                                              | `string` | `'en'`      |
| `p`          | `p`          | Property alias or short identifier used by backend endpoints (aname). Passed to `getExposedProperty` when initializing the component. | `string` | `undefined` |
| `pageSize`   | `page-size`  | Number of arrivals to load per page in the arrivals table. Used to configure pagination via Arrivals Store. Defaults to `20`.         | `number` | `20`        |
| `propertyid` | `propertyid` | ID of the property (hotel) for which arrivals should be displayed. Used in API calls related to rooms, bookings, and check-ins.       | `number` | `undefined` |
| `ticket`     | `ticket`     | Authentication token issued by the PMS backend. Required for initializing the component and making API calls.                         | `string` | `undefined` |


## Dependencies

### Used by

 - [ir-secure-tasks](../ir-secure-tasks)

### Depends on

- [ir-loading-screen](../ir-loading-screen)
- [ir-toast](../ui/ir-toast)
- [ir-interceptor](../ir-interceptor)
- [ir-arrivals-table](ir-arrivals-table)
- [ir-drawer](../ir-drawer)
- [ir-booking-details](../ir-booking-details)
- [ir-payment-folio](../ir-booking-details/ir-payment-details/ir-payment-folio)
- [ir-room-guests](../ir-booking-details/ir-room-guests)

### Graph
```mermaid
graph TD;
  ir-arrivals --> ir-loading-screen
  ir-arrivals --> ir-toast
  ir-arrivals --> ir-interceptor
  ir-arrivals --> ir-arrivals-table
  ir-arrivals --> ir-drawer
  ir-arrivals --> ir-booking-details
  ir-arrivals --> ir-payment-folio
  ir-arrivals --> ir-room-guests
  ir-interceptor --> ir-spinner
  ir-interceptor --> ir-otp-modal
  ir-otp-modal --> ir-spinner
  ir-otp-modal --> ir-otp
  ir-otp-modal --> ir-button
  ir-button --> ir-icons
  ir-arrivals-table --> ir-booking-number-cell
  ir-arrivals-table --> ir-booked-by-cell
  ir-arrivals-table --> ir-guest-name-cell
  ir-arrivals-table --> ir-unit-cell
  ir-arrivals-table --> ir-dates-cell
  ir-arrivals-table --> ir-balance-cell
  ir-arrivals-table --> ir-actions-cell
  ir-arrivals-table --> ir-pagination
  ir-booking-number-cell --> ir-custom-button
  ir-booked-by-cell --> ir-custom-button
  ir-unit-cell --> ir-unit-tag
  ir-balance-cell --> ir-custom-button
  ir-actions-cell --> ir-custom-button
  ir-pagination --> ir-select
  ir-pagination --> ir-custom-button
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
  ir-booking-details --> ir-dialog
  ir-booking-details --> ir-room-guests
  ir-booking-details --> ir-extra-service-config
  ir-booking-details --> ir-pickup
  ir-booking-details --> ir-billing-drawer
  ir-booking-details --> ir-guest-info-drawer
  ir-booking-details --> ir-payment-folio
  ir-booking-details --> igl-book-property
  ir-room --> ir-custom-button
  ir-room --> ir-date-view
  ir-room --> ir-unit-tag
  ir-room --> ir-label
  ir-room --> ir-dialog
  ir-room --> ir-checkout-dialog
  ir-room --> ir-invoice
  ir-checkout-dialog --> ir-dialog
  ir-checkout-dialog --> ir-spinner
  ir-checkout-dialog --> ir-custom-button
  ir-invoice --> ir-drawer
  ir-invoice --> ir-invoice-form
  ir-invoice --> ir-custom-button
  ir-invoice-form --> ir-spinner
  ir-invoice-form --> ir-custom-date-picker
  ir-invoice-form --> ir-booking-billing-recipient
  ir-custom-date-picker --> ir-input
  ir-booking-billing-recipient --> ir-booking-company-dialog
  ir-booking-company-dialog --> ir-dialog
  ir-booking-company-dialog --> ir-booking-company-form
  ir-booking-company-dialog --> ir-custom-button
  ir-booking-company-form --> ir-input
  ir-booking-header --> ir-pms-logs
  ir-booking-header --> ir-events-log
  ir-booking-header --> ir-custom-button
  ir-booking-header --> ir-booking-status-tag
  ir-booking-header --> ir-popover
  ir-booking-header --> ir-dialog
  ir-pms-logs --> ir-spinner
  ir-events-log --> ir-spinner
  ir-reservation-information --> ir-label
  ir-reservation-information --> ir-custom-button
  ir-reservation-information --> ota-label
  ir-reservation-information --> ir-booking-extra-note
  ir-reservation-information --> ir-booking-company-dialog
  ir-booking-extra-note --> ir-dialog
  ir-booking-extra-note --> ir-custom-button
  ir-pickup-view --> ir-custom-button
  ir-pickup-view --> ir-label
  ir-extra-services --> ir-custom-button
  ir-extra-services --> ir-extra-service
  ir-extra-service --> ir-custom-button
  ir-extra-service --> ir-date-view
  ir-extra-service --> ir-dialog
  ir-payment-details --> ir-payment-summary
  ir-payment-details --> ir-booking-guarantee
  ir-payment-details --> ir-applicable-policies
  ir-payment-details --> ir-custom-button
  ir-payment-details --> ir-payments-folio
  ir-payment-details --> ir-dialog
  ir-booking-guarantee --> ir-label
  ir-booking-guarantee --> ir-button
  ir-applicable-policies --> ir-custom-button
  ir-applicable-policies --> ir-icons
  ir-payments-folio --> ir-payment-item
  ir-payments-folio --> ir-custom-button
  ir-payment-item --> ir-custom-button
  ir-room-guests --> ir-drawer
  ir-room-guests --> ir-room-guests-form
  ir-room-guests --> ir-custom-button
  ir-room-guests-form --> ir-spinner
  ir-room-guests-form --> ir-validator
  ir-room-guests-form --> ir-input
  ir-room-guests-form --> ir-country-picker
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  ir-extra-service-config --> ir-drawer
  ir-extra-service-config --> ir-extra-service-config-form
  ir-extra-service-config --> ir-custom-button
  ir-extra-service-config-form --> ir-validator
  ir-extra-service-config-form --> ir-custom-date-picker
  ir-extra-service-config-form --> ir-input
  ir-pickup --> ir-drawer
  ir-pickup --> ir-pickup-form
  ir-pickup --> ir-custom-button
  ir-pickup-form --> ir-validator
  ir-pickup-form --> ir-custom-date-picker
  ir-pickup-form --> ir-input
  ir-billing-drawer --> ir-drawer
  ir-billing-drawer --> ir-billing
  ir-billing --> ir-spinner
  ir-billing --> ir-custom-button
  ir-billing --> ir-empty-state
  ir-billing --> ir-invoice
  ir-billing --> ir-dialog
  ir-guest-info-drawer --> ir-drawer
  ir-guest-info-drawer --> ir-guest-info-form
  ir-guest-info-drawer --> ir-custom-button
  ir-guest-info-form --> ir-validator
  ir-guest-info-form --> ir-input
  ir-guest-info-form --> ir-country-picker
  ir-guest-info-form --> ir-mobile-input
  ir-payment-folio --> ir-drawer
  ir-payment-folio --> ir-payment-folio-form
  ir-payment-folio --> ir-custom-button
  ir-payment-folio-form --> ir-custom-date-picker
  ir-payment-folio-form --> ir-validator
  ir-payment-folio-form --> ir-input
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
  igl-book-property-footer --> ir-custom-button
  ir-secure-tasks --> ir-arrivals
  style ir-arrivals fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
