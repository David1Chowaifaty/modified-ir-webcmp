# ir-booking-number-cell



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description | Type     | Default     |
| ---------------------- | ------------------------ | ----------- | -------- | ----------- |
| `bookingNumber`        | `booking-number`         |             | `string` | `undefined` |
| `channelBookingNumber` | `channel-booking-number` |             | `string` | `undefined` |


## Events

| Event                | Description | Type                  |
| -------------------- | ----------- | --------------------- |
| `openBookingDetails` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-arrivals-table](../../../ir-arrivals/ir-arrivals-table)
 - [ir-booking-listing-table](../../../ir-booking-listing/ir-booking-listing-table)
 - [ir-departures-table](../../../ir-departures/ir-departures-table)

### Depends on

- [ir-custom-button](../../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-booking-number-cell --> ir-custom-button
  ir-arrivals-table --> ir-booking-number-cell
  ir-booking-listing-table --> ir-booking-number-cell
  ir-departures-table --> ir-booking-number-cell
  style ir-booking-number-cell fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
