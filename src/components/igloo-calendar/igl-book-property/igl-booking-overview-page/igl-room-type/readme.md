# igl-room-type



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type       | Default          |
| ----------------- | ------------------ | ----------- | ---------- | ---------------- |
| `bookingType`     | `booking-type`     |             | `string`   | `'PLUS_BOOKING'` |
| `currency`        | `currency`         |             | `any`      | `undefined`      |
| `isBookDisabled`  | `is-book-disabled` |             | `boolean`  | `undefined`      |
| `ratePricingMode` | --                 |             | `any[]`    | `[]`             |
| `roomType`        | --                 |             | `RoomType` | `undefined`      |
| `roomTypeId`      | `room-type-id`     |             | `number`   | `null`           |


## Dependencies

### Used by

 - [igl-booking-overview-page](..)
 - [ir-booking-editor](../../../ir-booking-editor)

### Depends on

- [igl-rate-plan](igl-rate-plan)

### Graph
```mermaid
graph TD;
  igl-room-type --> igl-rate-plan
  igl-rate-plan --> ir-input
  igl-rate-plan --> ir-custom-button
  igl-booking-overview-page --> igl-room-type
  ir-booking-editor --> igl-room-type
  style igl-room-type fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
