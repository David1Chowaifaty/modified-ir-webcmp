# igl-booking-overview-page



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                   | Description | Type      | Default     |
| ------------------------ | --------------------------- | ----------- | --------- | ----------- |
| `bookingData`            | `booking-data`              |             | `any`     | `undefined` |
| `currency`               | `currency`                  |             | `any`     | `undefined` |
| `dateRangeData`          | `date-range-data`           |             | `any`     | `undefined` |
| `eventType`              | `event-type`                |             | `string`  | `undefined` |
| `message`                | `message`                   |             | `string`  | `undefined` |
| `ratePricingMode`        | `rate-pricing-mode`         |             | `any`     | `undefined` |
| `selectedRooms`          | `selected-rooms`            |             | `any`     | `{}`        |
| `showSplitBookingOption` | `show-split-booking-option` |             | `boolean` | `undefined` |


## Events

| Event             | Description | Type                              |
| ----------------- | ----------- | --------------------------------- |
| `buttonClicked`   |             | `CustomEvent<"cancel" \| "next">` |
| `dateRangeSelect` |             | `CustomEvent<any>`                |
| `roomsDataUpdate` |             | `CustomEvent<any>`                |


## Dependencies

### Used by

 - [igl-book-property](..)

### Depends on

- [igl-booking-rooms](../../igl-booking-rooms)
- [igl-book-property-footer](../igl-book-property-footer)

### Graph
```mermaid
graph TD;
  igl-booking-overview-page --> igl-booking-rooms
  igl-booking-overview-page --> igl-book-property-footer
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-book-property --> igl-booking-overview-page
  style igl-booking-overview-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
