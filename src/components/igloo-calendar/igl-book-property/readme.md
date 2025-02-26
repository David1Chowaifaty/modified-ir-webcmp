# igl-book-property



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                 | Description | Type                                                                       | Default     |
| ----------------------- | ------------------------- | ----------- | -------------------------------------------------------------------------- | ----------- |
| `adultChildConstraints` | --                        |             | `{ adult_max_nbr: number; child_max_nbr: number; child_max_age: number; }` | `undefined` |
| `allowedBookingSources` | `allowed-booking-sources` |             | `any`                                                                      | `undefined` |
| `bookingData`           | --                        |             | `{ [key: string]: any; }`                                                  | `undefined` |
| `countries`             | --                        |             | `ICountry[]`                                                               | `undefined` |
| `currency`              | --                        |             | `ICurrency`                                                                | `undefined` |
| `language`              | `language`                |             | `string`                                                                   | `undefined` |
| `propertyid`            | `propertyid`              |             | `number`                                                                   | `undefined` |
| `showPaymentDetails`    | `show-payment-details`    |             | `boolean`                                                                  | `false`     |


## Events

| Event                | Description | Type                                                                                                 |
| -------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `animateIrButton`    |             | `CustomEvent<string>`                                                                                |
| `animateIrSelect`    |             | `CustomEvent<string>`                                                                                |
| `blockedCreated`     |             | `CustomEvent<RoomBlockDetails>`                                                                      |
| `closeBookingWindow` |             | `CustomEvent<{ [key: string]: any; }>`                                                               |
| `resetBookingEvt`    |             | `CustomEvent<null>`                                                                                  |
| `toast`              |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igl-book-property-container](../../igl-book-property-container)
 - [igloo-calendar](..)
 - [ir-booking-details](../../ir-booking-details)

### Depends on

- [igl-block-dates-view](../igl-block-dates-view)
- [ir-button](../../ui/ir-button)
- [ir-icon](../../ui/ir-icon)
- [igl-booking-overview-page](igl-booking-overview-page)
- [igl-booking-form](igl-booking-form)

### Graph
```mermaid
graph TD;
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
  igl-date-range --> ir-date-range
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
  igl-property-booked-by --> ir-country-picker
  igl-property-booked-by --> ir-phone-input
  ir-country-picker --> ir-input-text
  ir-phone-input --> ir-combobox
  igl-book-property-container --> igl-book-property
  igloo-calendar --> igl-book-property
  ir-booking-details --> igl-book-property
  style igl-book-property fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
