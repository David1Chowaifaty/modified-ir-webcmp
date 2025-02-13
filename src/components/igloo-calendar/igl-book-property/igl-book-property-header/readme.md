# igl-book-property-header



<!-- Auto Generated Below -->


## Properties

| Property                      | Attribute                   | Description | Type                                                                       | Default     |
| ----------------------------- | --------------------------- | ----------- | -------------------------------------------------------------------------- | ----------- |
| `adultChildConstraints`       | --                          |             | `{ adult_max_nbr: number; child_max_nbr: number; child_max_age: number; }` | `undefined` |
| `adultChildCount`             | --                          |             | `{ adult: number; child: number; }`                                        | `undefined` |
| `bookedByInfoData`            | `booked-by-info-data`       |             | `any`                                                                      | `undefined` |
| `bookingData`                 | `booking-data`              |             | `any`                                                                      | `''`        |
| `bookingDataDefaultDateRange` | --                          |             | `{ [key: string]: any; }`                                                  | `undefined` |
| `dateRangeData`               | `date-range-data`           |             | `any`                                                                      | `undefined` |
| `defaultDaterange`            | --                          |             | `{ from_date: string; to_date: string; }`                                  | `undefined` |
| `message`                     | `message`                   |             | `string`                                                                   | `undefined` |
| `minDate`                     | `min-date`                  |             | `string`                                                                   | `undefined` |
| `propertyId`                  | `property-id`               |             | `number`                                                                   | `undefined` |
| `showSplitBookingOption`      | `show-split-booking-option` |             | `boolean`                                                                  | `false`     |
| `sourceOptions`               | --                          |             | `TSourceOptions[]`                                                         | `[]`        |
| `splitBookingId`              | `split-booking-id`          |             | `any`                                                                      | `''`        |
| `splitBookings`               | --                          |             | `any[]`                                                                    | `undefined` |


## Events

| Event                        | Description | Type                                                                                                 |
| ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `adultChild`                 |             | `CustomEvent<any>`                                                                                   |
| `animateIrButton`            |             | `CustomEvent<string>`                                                                                |
| `animateIrSelect`            |             | `CustomEvent<string>`                                                                                |
| `buttonClicked`              |             | `CustomEvent<{ key: TPropertyButtonsTypes; }>`                                                       |
| `checkClicked`               |             | `CustomEvent<any>`                                                                                   |
| `sourceDropDownChange`       |             | `CustomEvent<string>`                                                                                |
| `spiltBookingSelected`       |             | `CustomEvent<{ key: string; data: unknown; }>`                                                       |
| `splitBookingDropDownChange` |             | `CustomEvent<any>`                                                                                   |
| `toast`                      |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igl-booking-overview-page](../igl-booking-overview-page)

### Depends on

- [ir-autocomplete](../../../ui/ir-autocomplete)
- [ir-select](../../../ui/ir-select)
- [ir-button](../../../ui/ir-button)
- [igl-date-range](../../igl-date-range)

### Graph
```mermaid
graph TD;
  igl-book-property-header --> ir-autocomplete
  igl-book-property-header --> ir-select
  igl-book-property-header --> ir-button
  igl-book-property-header --> igl-date-range
  ir-button --> ir-icons
  igl-date-range --> ir-date-range
  igl-date-range --> ir-date-picker
  igl-date-range --> ir-date-view
  igl-booking-overview-page --> igl-book-property-header
  style igl-book-property-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
