# igl-property-booked-by



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description | Type                      | Default     |
| -------------------- | ---------------------- | ----------- | ------------------------- | ----------- |
| `countries`          | --                     |             | `ICountry[]`              | `[]`        |
| `defaultData`        | --                     |             | `{ [key: string]: any; }` | `undefined` |
| `language`           | `language`             |             | `string`                  | `undefined` |
| `propertyId`         | `property-id`          |             | `number`                  | `undefined` |
| `showPaymentDetails` | `show-payment-details` |             | `boolean`                 | `false`     |


## Events

| Event             | Description | Type                                   |
| ----------------- | ----------- | -------------------------------------- |
| `dataUpdateEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igl-booking-form](..)

### Depends on

- [ir-picker](../../../../ui/ir-picker)
- [ir-picker-item](../../../../ui/ir-picker/ir-picker-item)
- [ir-input](../../../../ui/ir-input)
- [ir-country-picker](../../../../ui/ir-country-picker)
- [ir-mobile-input](../../../../ui/ir-mobile-input)

### Graph
```mermaid
graph TD;
  igl-property-booked-by --> ir-picker
  igl-property-booked-by --> ir-picker-item
  igl-property-booked-by --> ir-input
  igl-property-booked-by --> ir-country-picker
  igl-property-booked-by --> ir-mobile-input
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  igl-booking-form --> igl-property-booked-by
  style igl-property-booked-by fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
