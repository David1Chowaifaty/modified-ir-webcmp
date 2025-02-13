# igl-cal-body



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                 | Description | Type                      | Default     |
| ---------------------- | ------------------------- | ----------- | ------------------------- | ----------- |
| `calendarData`         | --                        |             | `{ [key: string]: any; }` | `undefined` |
| `countryNodeList`      | `country-node-list`       |             | `any`                     | `undefined` |
| `currency`             | `currency`                |             | `any`                     | `undefined` |
| `highlightedDate`      | `highlighted-date`        |             | `string`                  | `undefined` |
| `isScrollViewDragging` | `is-scroll-view-dragging` |             | `boolean`                 | `undefined` |
| `language`             | `language`                |             | `string`                  | `undefined` |
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

- [ir-popover](../../ui/ir-popover)
- [igl-booking-event](../igl-booking-event)

### Graph
```mermaid
graph TD;
  igl-cal-body --> ir-popover
  igl-cal-body --> igl-booking-event
  igl-booking-event --> igl-booking-event-hover
  igl-booking-event-hover --> ota-label
  igl-booking-event-hover --> ir-date-view
  igl-booking-event-hover --> ir-label
  igl-booking-event-hover --> ir-icons
  igl-booking-event-hover --> igl-block-dates-view
  igl-block-dates-view --> ir-date-view
  igloo-calendar --> igl-cal-body
  style igl-cal-body fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
