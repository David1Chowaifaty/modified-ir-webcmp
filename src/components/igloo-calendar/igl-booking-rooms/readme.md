# igl-booking-rooms



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute         | Description | Type                      | Default          |
| ----------------- | ----------------- | ----------- | ------------------------- | ---------------- |
| `bookingType`     | `booking-type`    |             | `string`                  | `'PLUS_BOOKING'` |
| `currency`        | `currency`        |             | `any`                     | `undefined`      |
| `dateDifference`  | `date-difference` |             | `number`                  | `undefined`      |
| `defaultData`     | --                |             | `{ [key: string]: any; }` | `undefined`      |
| `ratePricingMode` | --                |             | `any[]`                   | `[]`             |
| `roomTypeData`    | --                |             | `{ [key: string]: any; }` | `undefined`      |


## Events

| Event             | Description | Type                                   |
| ----------------- | ----------- | -------------------------------------- |
| `dataUpdateEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igl-booking-overview-page](../igl-book-property/igl-booking-overview-page)

### Depends on

- [igl-booking-room-rate-plan](../igl-booking-room-rate-plan)

### Graph
```mermaid
graph TD;
  igl-booking-rooms --> igl-booking-room-rate-plan
  igl-booking-room-rate-plan --> ir-tooltip
  igl-booking-overview-page --> igl-booking-rooms
  style igl-booking-rooms fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
