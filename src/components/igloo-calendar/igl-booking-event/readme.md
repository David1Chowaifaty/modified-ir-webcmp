# igl-booking-event



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute            | Description | Type                      | Default     |
| -------------------- | -------------------- | ----------- | ------------------------- | ----------- |
| `allBookingEvents`   | --                   |             | `{ [key: string]: any; }` | `[]`        |
| `bookingEvent`       | --                   |             | `{ [key: string]: any; }` | `undefined` |
| `countryNodeList`    | `country-node-list`  |             | `any`                     | `undefined` |
| `currency`           | `currency`           |             | `any`                     | `undefined` |
| `is_vacation_rental` | `is_vacation_rental` |             | `boolean`                 | `false`     |
| `language`           | `language`           |             | `string`                  | `undefined` |


## Events

| Event                   | Description | Type                                                                                                                                                                                       |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dragOverEventData`     |             | `CustomEvent<any>`                                                                                                                                                                         |
| `hideBubbleInfo`        |             | `CustomEvent<any>`                                                                                                                                                                         |
| `resetStreachedBooking` |             | `CustomEvent<string>`                                                                                                                                                                      |
| `showDialog`            |             | `CustomEvent<{ reason: "checkin" \| "checkout"; bookingNumber: string; roomIdentifier: string; roomUnit: string; roomName: string; } \| { reason: "reallocate"; } & IReallocationPayload>` |
| `showRoomNightsDialog`  |             | `CustomEvent<IRoomNightsData>`                                                                                                                                                             |
| `toast`                 |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>`                                                                                       |
| `updateBookingEvent`    |             | `CustomEvent<{ [key: string]: any; }>`                                                                                                                                                     |
| `updateEventData`       |             | `CustomEvent<any>`                                                                                                                                                                         |


## Dependencies

### Used by

 - [igl-cal-body](../igl-cal-body)

### Depends on

- [igl-booking-event-hover](../igl-booking-event-hover)

### Graph
```mermaid
graph TD;
  igl-booking-event --> igl-booking-event-hover
  igl-booking-event-hover --> ota-label
  igl-booking-event-hover --> ir-date-view
  igl-booking-event-hover --> ir-icons
  igl-booking-event-hover --> igl-block-dates-view
  igl-block-dates-view --> ir-date-view
  igl-cal-body --> igl-booking-event
  style igl-booking-event fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
