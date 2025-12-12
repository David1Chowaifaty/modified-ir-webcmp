# igl-booking-overview-page



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                   | Description | Type                                                                       | Default     |
| ------------------------ | --------------------------- | ----------- | -------------------------------------------------------------------------- | ----------- |
| `adultChildConstraints`  | --                          |             | `{ adult_max_nbr: number; child_max_nbr: number; child_max_age: number; }` | `undefined` |
| `bookedByInfoData`       | `booked-by-info-data`       |             | `any`                                                                      | `undefined` |
| `bookingData`            | `booking-data`              |             | `any`                                                                      | `undefined` |
| `currency`               | `currency`                  |             | `any`                                                                      | `undefined` |
| `dateRangeData`          | `date-range-data`           |             | `any`                                                                      | `undefined` |
| `defaultDaterange`       | --                          |             | `{ from_date: string; to_date: string; }`                                  | `undefined` |
| `eventType`              | `event-type`                |             | `string`                                                                   | `undefined` |
| `initialRoomIds`         | `initial-room-ids`          |             | `any`                                                                      | `undefined` |
| `message`                | `message`                   |             | `string`                                                                   | `undefined` |
| `propertyId`             | `property-id`               |             | `number`                                                                   | `undefined` |
| `ratePricingMode`        | `rate-pricing-mode`         |             | `any`                                                                      | `undefined` |
| `selectedRooms`          | --                          |             | `Map<string, Map<string, any>>`                                            | `undefined` |
| `showSplitBookingOption` | `show-split-booking-option` |             | `boolean`                                                                  | `undefined` |
| `wasBlockedUnit`         | `was-blocked-unit`          |             | `boolean`                                                                  | `undefined` |


## Events

| Event             | Description | Type               |
| ----------------- | ----------- | ------------------ |
| `roomsDataUpdate` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [igl-book-property](..)

### Depends on

- [igl-book-property-header](../igl-book-property-header)
- [igl-room-type](igl-room-type)

### Graph
```mermaid
graph TD;
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
  igl-book-property --> igl-booking-overview-page
  style igl-booking-overview-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
