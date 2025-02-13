# igl-tba-booking-view



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type                      | Default     |
| ---------------- | ---------------- | ----------- | ------------------------- | ----------- |
| `calendarData`   | --               |             | `{ [key: string]: any; }` | `undefined` |
| `categoriesData` | --               |             | `{ [key: string]: any; }` | `{}`        |
| `categoryId`     | `category-id`    |             | `any`                     | `undefined` |
| `categoryIndex`  | `category-index` |             | `any`                     | `undefined` |
| `eventData`      | --               |             | `{ [key: string]: any; }` | `{}`        |
| `eventIndex`     | `event-index`    |             | `any`                     | `undefined` |
| `selectedDate`   | `selected-date`  |             | `any`                     | `undefined` |


## Events

| Event                               | Description | Type                                   |
| ----------------------------------- | ----------- | -------------------------------------- |
| `addToBeAssignedEvent`              |             | `CustomEvent<any>`                     |
| `assignRoomEvent`                   |             | `CustomEvent<{ [key: string]: any; }>` |
| `highlightToBeAssignedBookingEvent` |             | `CustomEvent<any>`                     |
| `scrollPageToRoom`                  |             | `CustomEvent<any>`                     |


## Dependencies

### Used by

 - [igl-tba-category-view](../igl-tba-category-view)

### Depends on

- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  igl-tba-booking-view --> ir-button
  ir-button --> ir-icons
  igl-tba-category-view --> igl-tba-booking-view
  style igl-tba-booking-view fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
