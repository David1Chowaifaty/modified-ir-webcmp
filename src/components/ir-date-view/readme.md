# ir-date-view



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description | Type                       | Default        |
| -------------------- | ---------------------- | ----------- | -------------------------- | -------------- |
| `dateOption`         | `date-option`          |             | `string`                   | `'YYYY-MM-DD'` |
| `from_date`          | `from_date`            |             | `Date \| Moment \| string` | `undefined`    |
| `showDateDifference` | `show-date-difference` |             | `boolean`                  | `true`         |
| `to_date`            | `to_date`              |             | `Date \| Moment \| string` | `undefined`    |


## Dependencies

### Used by

 - [igl-block-dates-view](../igloo-calendar/igl-block-dates-view)
 - [igl-booking-event-hover](../igloo-calendar/igl-booking-event-hover)
 - [igl-booking-form](../igloo-calendar/igl-book-property/igl-booking-form)
 - [igl-split-booking](../igloo-calendar/igl-split-booking)
 - [ir-booking-details](../ir-booking-details)
 - [ir-booking-editor-form](../igloo-calendar/ir-booking-editor/ir-booking-editor-form)
 - [ir-extra-service](../ir-booking-details/ir-extra-services/ir-extra-service)
 - [ir-room](../ir-booking-details/ir-room)

### Graph
```mermaid
graph TD;
  igl-block-dates-view --> ir-date-view
  igl-booking-event-hover --> ir-date-view
  igl-booking-form --> ir-date-view
  igl-split-booking --> ir-date-view
  ir-booking-details --> ir-date-view
  ir-booking-editor-form --> ir-date-view
  ir-extra-service --> ir-date-view
  ir-room --> ir-date-view
  style ir-date-view fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
