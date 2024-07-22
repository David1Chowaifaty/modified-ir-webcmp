# igl-to-be-assigned



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute               | Description | Type                      | Default     |
| --------------------- | ----------------------- | ----------- | ------------------------- | ----------- |
| `calendarData`        | --                      |             | `{ [key: string]: any; }` | `undefined` |
| `from_date`           | `from_date`             |             | `string`                  | `undefined` |
| `propertyid`          | `propertyid`            |             | `number`                  | `undefined` |
| `to_date`             | `to_date`               |             | `string`                  | `undefined` |
| `unassignedDatesProp` | `unassigned-dates-prop` |             | `any`                     | `undefined` |


## Events

| Event                               | Description | Type                                   |
| ----------------------------------- | ----------- | -------------------------------------- |
| `addToBeAssignedEvent`              |             | `CustomEvent<any>`                     |
| `highlightToBeAssignedBookingEvent` |             | `CustomEvent<any>`                     |
| `optionEvent`                       |             | `CustomEvent<{ [key: string]: any; }>` |
| `reduceAvailableUnitEvent`          |             | `CustomEvent<{ [key: string]: any; }>` |
| `showBookingPopup`                  |             | `CustomEvent<any>`                     |


## Dependencies

### Used by

 - [igloo-calendar](..)

### Depends on

- [igl-tba-category-view](igl-tba-category-view)
- [ir-button](../../ir-button)

### Graph
```mermaid
graph TD;
  igl-to-be-assigned --> igl-tba-category-view
  igl-to-be-assigned --> ir-button
  igl-tba-category-view --> igl-tba-booking-view
  igl-tba-booking-view --> ir-button
  ir-button --> ir-icons
  igloo-calendar --> igl-to-be-assigned
  style igl-to-be-assigned fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
