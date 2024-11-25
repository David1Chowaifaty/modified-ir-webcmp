# igl-room-type



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type       | Default          |
| ----------------- | ------------------ | ----------- | ---------- | ---------------- |
| `bookingType`     | `booking-type`     |             | `string`   | `'PLUS_BOOKING'` |
| `currency`        | `currency`         |             | `any`      | `undefined`      |
| `dateDifference`  | `date-difference`  |             | `number`   | `undefined`      |
| `initialRoomIds`  | `initial-room-ids` |             | `any`      | `undefined`      |
| `isBookDisabled`  | `is-book-disabled` |             | `boolean`  | `undefined`      |
| `ratePricingMode` | --                 |             | `any[]`    | `[]`             |
| `roomInfoId`      | `room-info-id`     |             | `number`   | `null`           |
| `roomType`        | --                 |             | `RoomType` | `undefined`      |


## Events

| Event             | Description | Type                                   |
| ----------------- | ----------- | -------------------------------------- |
| `dataUpdateEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igl-booking-overview-page](..)

### Depends on

- [igl-rate-plan](igl-rate-plan)

### Graph
```mermaid
graph TD;
  igl-room-type --> igl-rate-plan
  igl-rate-plan --> ir-tooltip
  igl-booking-overview-page --> igl-room-type
  style igl-room-type fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
