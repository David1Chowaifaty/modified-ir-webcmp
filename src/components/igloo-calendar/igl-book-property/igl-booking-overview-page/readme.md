# igl-booking-overview-page



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                   | Description | Type                                                                       | Default     |
| ------------------------ | --------------------------- | ----------- | -------------------------------------------------------------------------- | ----------- |
| `adultChildConstraints`  | --                          |             | `{ adult_max_nbr: number; child_max_nbr: number; child_max_age: number; }` | `undefined` |
| `adultChildCount`        | --                          |             | `{ adult: number; child: number; }`                                        | `undefined` |
| `bookedByInfoData`       | `booked-by-info-data`       |             | `any`                                                                      | `undefined` |
| `bookingData`            | `booking-data`              |             | `any`                                                                      | `undefined` |
| `currency`               | `currency`                  |             | `any`                                                                      | `undefined` |
| `dateRangeData`          | `date-range-data`           |             | `any`                                                                      | `undefined` |
| `defaultDaterange`       | --                          |             | `{ from_date: string; to_date: string; }`                                  | `undefined` |
| `eventType`              | `event-type`                |             | `string`                                                                   | `undefined` |
| `message`                | `message`                   |             | `string`                                                                   | `undefined` |
| `propertyId`             | `property-id`               |             | `number`                                                                   | `undefined` |
| `ratePricingMode`        | `rate-pricing-mode`         |             | `any`                                                                      | `undefined` |
| `selectedRooms`          | --                          |             | `Map<string, Map<string, any>>`                                            | `undefined` |
| `showSplitBookingOption` | `show-split-booking-option` |             | `boolean`                                                                  | `undefined` |
| `sourceOptions`          | --                          |             | `TSourceOptions[]`                                                         | `undefined` |


## Events

| Event             | Description | Type               |
| ----------------- | ----------- | ------------------ |
| `roomsDataUpdate` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [igl-book-property](..)

### Depends on

- [igl-book-property-header](../igl-book-property-header)
- [igl-booking-rooms](../../igl-booking-rooms)
- [igl-book-property-footer](../igl-book-property-footer)

### Graph
```mermaid
graph TD;
  igl-booking-overview-page --> igl-book-property-header
  igl-booking-overview-page --> igl-booking-rooms
  igl-booking-overview-page --> igl-book-property-footer
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> igl-date-range
  igl-date-range --> ir-date-picker
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-book-property --> igl-booking-overview-page
  style igl-booking-overview-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
