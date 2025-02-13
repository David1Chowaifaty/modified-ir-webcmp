# igl-property-booked-by



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description | Type                      | Default     |
| -------------------- | ---------------------- | ----------- | ------------------------- | ----------- |
| `countryNodeList`    | --                     |             | `ICountry[]`              | `[]`        |
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

- [ir-autocomplete](../../../../ui/ir-autocomplete)
- [ir-tooltip](../../../../ui/ir-tooltip)
- [ir-country-picker](../../../../ui/ir-country-picker)
- [ir-phone-input](../../../../ui/ir-phone-input)

### Graph
```mermaid
graph TD;
  igl-property-booked-by --> ir-autocomplete
  igl-property-booked-by --> ir-tooltip
  igl-property-booked-by --> ir-country-picker
  igl-property-booked-by --> ir-phone-input
  ir-country-picker --> ir-input-text
  ir-phone-input --> ir-combobox
  igl-booking-form --> igl-property-booked-by
  style igl-property-booked-by fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
