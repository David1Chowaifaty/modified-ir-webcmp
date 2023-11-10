# igl-cal-body



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                 | Description | Type                      | Default     |
| ---------------------- | ------------------------- | ----------- | ------------------------- | ----------- |
| `calendarData`         | --                        |             | `{ [key: string]: any; }` | `undefined` |
| `countryNodeList`      | `country-node-list`       |             | `any`                     | `undefined` |
| `currency`             | `currency`                |             | `any`                     | `undefined` |
| `isScrollViewDragging` | `is-scroll-view-dragging` |             | `boolean`                 | `undefined` |
| `today`                | --                        |             | `String`                  | `undefined` |


## Events

| Event              | Description | Type               |
| ------------------ | ----------- | ------------------ |
| `scrollPageToRoom` |             | `CustomEvent<any>` |
| `showBookingPopup` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [igl-booking-event](../igl-booking-event)

### Graph
```mermaid
graph TD;
  igl-cal-body --> igl-booking-event
  igl-booking-event --> igl-booking-event-hover
  igl-booking-event-hover --> igl-block-dates-view
  igloo-calendar --> igl-cal-body
  style igl-cal-body fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*