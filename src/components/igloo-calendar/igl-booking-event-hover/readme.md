# igl-booking-event-hover



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute            | Description | Type                      | Default     |
| -------------------- | -------------------- | ----------- | ------------------------- | ----------- |
| `bookingEvent`       | --                   |             | `{ [key: string]: any; }` | `undefined` |
| `bubbleInfoTop`      | `bubble-info-top`    |             | `boolean`                 | `false`     |
| `countryNodeList`    | --                   |             | `ICountry[]`              | `undefined` |
| `currency`           | `currency`           |             | `any`                     | `undefined` |
| `is_vacation_rental` | `is_vacation_rental` |             | `boolean`                 | `false`     |


## Events

| Event              | Description | Type                                                                                                                                                                                       |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bookingCreated`   |             | `CustomEvent<{ pool?: string; data: any[]; }>`                                                                                                                                             |
| `deleteButton`     |             | `CustomEvent<string>`                                                                                                                                                                      |
| `hideBubbleInfo`   |             | `CustomEvent<any>`                                                                                                                                                                         |
| `showBookingPopup` |             | `CustomEvent<any>`                                                                                                                                                                         |
| `showDialog`       |             | `CustomEvent<{ reason: "checkin" \| "checkout"; bookingNumber: string; roomIdentifier: string; roomUnit: string; roomName: string; } \| { reason: "reallocate"; } & IReallocationPayload>` |


## Dependencies

### Used by

 - [igl-booking-event](../igl-booking-event)

### Depends on

- [ota-label](../../ota-label)
- [ir-date-view](../../ir-date-view)
- [ir-button](../../ir-button)
- [igl-block-dates-view](../igl-block-dates-view)

### Graph
```mermaid
graph TD;
  igl-booking-event-hover --> ota-label
  igl-booking-event-hover --> ir-date-view
  igl-booking-event-hover --> ir-button
  igl-booking-event-hover --> igl-block-dates-view
  ir-button --> ir-icons
  igl-block-dates-view --> ir-date-view
  igl-booking-event --> igl-booking-event-hover
  style igl-booking-event-hover fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
