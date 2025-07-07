# ir-room



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute               | Description | Type         | Default     |
| ------------------- | ----------------------- | ----------- | ------------ | ----------- |
| `bedPreferences`    | --                      |             | `IEntries[]` | `undefined` |
| `booking`           | --                      |             | `Booking`    | `undefined` |
| `bookingIndex`      | `booking-index`         |             | `number`     | `undefined` |
| `currency`          | `currency`              |             | `string`     | `'USD'`     |
| `hasCheckIn`        | `has-check-in`          |             | `boolean`    | `false`     |
| `hasCheckOut`       | `has-check-out`         |             | `boolean`    | `false`     |
| `hasRoomAdd`        | `has-room-add`          |             | `boolean`    | `false`     |
| `hasRoomDelete`     | `has-room-delete`       |             | `boolean`    | `false`     |
| `hasRoomEdit`       | `has-room-edit`         |             | `boolean`    | `false`     |
| `isEditable`        | `is-editable`           |             | `boolean`    | `undefined` |
| `language`          | `language`              |             | `string`     | `'en'`      |
| `legendData`        | `legend-data`           |             | `any`        | `undefined` |
| `mealCodeName`      | `meal-code-name`        |             | `string`     | `undefined` |
| `myRoomTypeFoodCat` | `my-room-type-food-cat` |             | `string`     | `undefined` |
| `room`              | --                      |             | `Room`       | `undefined` |
| `roomsInfo`         | `rooms-info`            |             | `any`        | `undefined` |


## Events

| Event            | Description | Type                                                                                                                                                                                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `deleteFinished` |             | `CustomEvent<string>`                                                                                                                                                                                                                |
| `editInitiated`  |             | `CustomEvent<IglBookPropertyPayloadAddRoom \| IglBookPropertyPayloadBarBooking \| IglBookPropertyPayloadBlockDates \| IglBookPropertyPayloadEditBooking \| IglBookPropertyPayloadPlusBooking \| IglBookPropertyPayloadSplitBooking>` |
| `openSidebar`    |             | `CustomEvent<{ type: BookingDetailsSidebarEvents; payload?: RoomGuestsPayload; }>`                                                                                                                                                   |
| `pressCheckIn`   |             | `CustomEvent<any>`                                                                                                                                                                                                                   |
| `pressCheckOut`  |             | `CustomEvent<any>`                                                                                                                                                                                                                   |
| `resetbooking`   |             | `CustomEvent<null>`                                                                                                                                                                                                                  |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-button](../../ui/ir-button)
- [ir-date-view](../../ir-date-view)
- [ir-tooltip](../../ui/ir-tooltip)
- [ir-label](../../ui/ir-label)
- [ir-modal](../../ui/ir-modal)

### Graph
```mermaid
graph TD;
  ir-room --> ir-button
  ir-room --> ir-date-view
  ir-room --> ir-tooltip
  ir-room --> ir-label
  ir-room --> ir-modal
  ir-button --> ir-icons
  ir-modal --> ir-button
  ir-booking-details --> ir-room
  style ir-room fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
