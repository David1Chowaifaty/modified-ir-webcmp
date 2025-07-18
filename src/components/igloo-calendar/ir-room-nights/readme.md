# ir-room-nights



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                                      | Default     |
| --------------- | ---------------- | ----------- | ----------------------------------------- | ----------- |
| `bookingNumber` | `booking-number` |             | `string`                                  | `undefined` |
| `defaultDates`  | --               |             | `{ from_date: string; to_date: string; }` | `undefined` |
| `fromDate`      | `from-date`      |             | `string`                                  | `undefined` |
| `identifier`    | `identifier`     |             | `string`                                  | `undefined` |
| `language`      | `language`       |             | `string`                                  | `undefined` |
| `pool`          | `pool`           |             | `string`                                  | `undefined` |
| `propertyId`    | `property-id`    |             | `number`                                  | `undefined` |
| `ticket`        | `ticket`         |             | `string`                                  | `undefined` |
| `toDate`        | `to-date`        |             | `string`                                  | `undefined` |


## Events

| Event                   | Description | Type                                       |
| ----------------------- | ----------- | ------------------------------------------ |
| `closeRoomNightsDialog` |             | `CustomEvent<IRoomNightsDataEventPayload>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [ir-price-input](../../ui/ir-price-input)
- [ir-loading-screen](../../ir-loading-screen)
- [ir-title](../../ir-title)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-room-nights --> ir-price-input
  ir-room-nights --> ir-loading-screen
  ir-room-nights --> ir-title
  ir-room-nights --> ir-button
  ir-title --> ir-icon
  ir-button --> ir-icons
  igloo-calendar --> ir-room-nights
  style ir-room-nights fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
