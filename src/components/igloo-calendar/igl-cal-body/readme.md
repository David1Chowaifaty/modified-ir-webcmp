# igl-cal-body



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                 | Description | Type                      | Default     |
| ---------------------- | ------------------------- | ----------- | ------------------------- | ----------- |
| `calendarData`         | --                        |             | `{ [key: string]: any; }` | `undefined` |
| `countries`            | --                        |             | `ICountry[]`              | `undefined` |
| `currency`             | `currency`                |             | `any`                     | `undefined` |
| `highlightedDate`      | `highlighted-date`        |             | `string`                  | `undefined` |
| `isScrollViewDragging` | `is-scroll-view-dragging` |             | `boolean`                 | `undefined` |
| `language`             | `language`                |             | `string`                  | `undefined` |
| `propertyId`           | `property-id`             |             | `number`                  | `undefined` |
| `today`                | --                        |             | `String`                  | `undefined` |


## Events

| Event                  | Description | Type                 |
| ---------------------- | ----------- | -------------------- |
| `addBookingDatasEvent` |             | `CustomEvent<any[]>` |
| `scrollPageToRoom`     |             | `CustomEvent<any>`   |
| `showBookingPopup`     |             | `CustomEvent<any>`   |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [ir-interactive-title](../../ui/ir-interactive-title)
- [igl-booking-event](../igl-booking-event)
- [ir-modal](../../ui/ir-modal)

### Graph
```mermaid
graph TD;
  igl-cal-body --> ir-interactive-title
  igl-cal-body --> igl-booking-event
  igl-cal-body --> ir-modal
  igl-booking-event --> igl-booking-event-hover
  igl-booking-event-hover --> ir-date-view
  igl-booking-event-hover --> ir-label
  igl-booking-event-hover --> ir-button
  igl-booking-event-hover --> igl-block-dates-view
  ir-button --> ir-icons
  igl-block-dates-view --> ir-date-view
  ir-modal --> ir-button
  igloo-calendar --> igl-cal-body
  style igl-cal-body fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
