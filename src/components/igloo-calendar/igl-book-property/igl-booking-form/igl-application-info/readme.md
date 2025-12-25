# igl-application-info



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute         | Description | Type                                                           | Default          |
| ------------------- | ----------------- | ----------- | -------------------------------------------------------------- | ---------------- |
| `autoFillGuest`     | `auto-fill-guest` |             | `boolean`                                                      | `undefined`      |
| `baseData`          | --                |             | `{ unit: { id: string; name: string; }; roomtypeId: number; }` | `undefined`      |
| `bedPreferenceType` | --                |             | `any[]`                                                        | `[]`             |
| `bookingType`       | `booking-type`    |             | `string`                                                       | `'PLUS_BOOKING'` |
| `currency`          | --                |             | `ICurrency`                                                    | `undefined`      |
| `guestInfo`         | --                |             | `RatePlanGuest`                                                | `undefined`      |
| `rateplanSelection` | --                |             | `IRatePlanSelection`                                           | `undefined`      |
| `roomIndex`         | `room-index`      |             | `number`                                                       | `undefined`      |
| `totalNights`       | `total-nights`    |             | `number`                                                       | `1`              |


## Dependencies

### Used by

 - [igl-booking-form](..)
 - [ir-booking-editor-form](../../../ir-booking-editor/ir-booking-editor-form)

### Depends on

- [ir-validator](../../../../ui/ir-validator)
- [ir-input](../../../../ui/ir-input)

### Graph
```mermaid
graph TD;
  igl-application-info --> ir-validator
  igl-application-info --> ir-input
  igl-booking-form --> igl-application-info
  ir-booking-editor-form --> igl-application-info
  style igl-application-info fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
