# ir-room-nights



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type     | Default     |
| --------------- | ---------------- | ----------- | -------- | ----------- |
| `baseUrl`       | `base-url`       |             | `string` | `undefined` |
| `bookingNumber` | `booking-number` |             | `string` | `undefined` |
| `fromDate`      | `from-date`      |             | `string` | `undefined` |
| `identifier`    | `identifier`     |             | `string` | `undefined` |
| `language`      | `language`       |             | `string` | `undefined` |
| `pool`          | `pool`           |             | `string` | `undefined` |
| `propertyId`    | `property-id`    |             | `number` | `undefined` |
| `ticket`        | `ticket`         |             | `string` | `undefined` |
| `toDate`        | `to-date`        |             | `string` | `undefined` |


## Events

| Event                   | Description | Type                                       |
| ----------------------- | ----------- | ------------------------------------------ |
| `closeRoomNightsDialog` |             | `CustomEvent<IRoomNightsDataEventPayload>` |


## Dependencies

### Used by

 - [igloo-calendar](../igloo-calendar)

### Depends on

- [ir-icon](../ir-icon)

### Graph
```mermaid
graph TD;
  ir-room-nights --> ir-icon
  igloo-calendar --> ir-room-nights
  style ir-room-nights fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
