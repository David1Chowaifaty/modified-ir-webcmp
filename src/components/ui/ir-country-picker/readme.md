# ir-country-picker



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute | Description | Type         | Default     |
| ----------------- | --------- | ----------- | ------------ | ----------- |
| `countries`       | --        |             | `ICountry[]` | `[]`        |
| `country`         | --        |             | `ICountry`   | `undefined` |
| `error`           | `error`   |             | `boolean`    | `undefined` |
| `label`           | `label`   |             | `string`     | `undefined` |
| `propertyCountry` | --        |             | `ICountry`   | `undefined` |


## Events

| Event           | Description | Type                    |
| --------------- | ----------- | ----------------------- |
| `countryChange` |             | `CustomEvent<ICountry>` |


## Dependencies

### Used by

 - [igl-property-booked-by](../../igloo-calendar/igl-book-property/igl-booking-form/igl-property-booked-by)
 - [ir-guest-info](../../ir-guest-info)
 - [ir-room-guests](../../ir-booking-details/ir-room-guests)

### Depends on

- [ir-input-text](../ir-input-text)

### Graph
```mermaid
graph TD;
  ir-country-picker --> ir-input-text
  igl-property-booked-by --> ir-country-picker
  ir-guest-info --> ir-country-picker
  ir-room-guests --> ir-country-picker
  style ir-country-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
