# ir-country-picker



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute       | Description                                                    | Type                             | Default     |
| ----------------- | --------------- | -------------------------------------------------------------- | -------------------------------- | ----------- |
| `autoValidate`    | `auto-validate` | Whether to automatically validate the input.                   | `boolean`                        | `false`     |
| `countries`       | --              | List of countries to display in the dropdown.                  | `ICountry[]`                     | `[]`        |
| `country`         | --              | Currently selected country.                                    | `ICountry`                       | `undefined` |
| `error`           | `error`         | Whether to show an error state on the input.                   | `boolean`                        | `undefined` |
| `label`           | `label`         | The label to display for the input.                            | `string`                         | `undefined` |
| `propertyCountry` | --              | The property-associated country, shown separately if relevant. | `ICountry`                       | `undefined` |
| `size`            | `size`          | The input's size.                                              | `"large" \| "medium" \| "small"` | `undefined` |
| `testId`          | `test-id`       | Test ID for automated testing.                                 | `string`                         | `undefined` |
| `variant`         | `variant`       |                                                                | `"default" \| "modern"`          | `'default'` |


## Events

| Event           | Description                               | Type                    |
| --------------- | ----------------------------------------- | ----------------------- |
| `countryChange` | Event emitted when a country is selected. | `CustomEvent<ICountry>` |


## Dependencies

### Used by

 - [igl-property-booked-by](../../igloo-calendar/igl-book-property/igl-booking-form/igl-property-booked-by)
 - [ir-guest-info](../../ir-guest-info)
 - [ir-guest-info-form](../../ir-guest-info/ir-guest-info-form)
 - [ir-room-guests-form](../../ir-booking-details/ir-room-guests/ir-room-guests-form)

### Depends on

- [ir-picker](../ir-picker)
- [ir-picker-item](../ir-picker/ir-picker-item)
- [ir-input-text](../ir-input-text)

### Graph
```mermaid
graph TD;
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  igl-property-booked-by --> ir-country-picker
  ir-guest-info --> ir-country-picker
  ir-guest-info-form --> ir-country-picker
  ir-room-guests-form --> ir-country-picker
  style ir-country-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
