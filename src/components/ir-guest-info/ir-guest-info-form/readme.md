# ir-guest-info-form



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type         | Default     |
| -------------- | --------------- | ----------- | ------------ | ----------- |
| `autoValidate` | `auto-validate` |             | `boolean`    | `false`     |
| `countries`    | --              |             | `ICountry[]` | `undefined` |
| `guest`        | --              |             | `Guest`      | `undefined` |
| `language`     | `language`      |             | `string`     | `undefined` |


## Events

| Event          | Description | Type                 |
| -------------- | ----------- | -------------------- |
| `guestChanged` |             | `CustomEvent<Guest>` |


## Dependencies

### Used by

 - [ir-guest-info-drawer](../ir-guest-info-drawer)

### Depends on

- [ir-validator](../../ui/ir-validator)
- [ir-custom-input](../../ui/ir-custom-input)
- [ir-country-picker](../../ui/ir-country-picker)
- [ir-mobile-input](../../ui/ir-mobile-input)

### Graph
```mermaid
graph TD;
  ir-guest-info-form --> ir-validator
  ir-guest-info-form --> ir-custom-input
  ir-guest-info-form --> ir-country-picker
  ir-guest-info-form --> ir-mobile-input
  ir-country-picker --> ir-picker
  ir-country-picker --> ir-picker-item
  ir-country-picker --> ir-input-text
  ir-guest-info-drawer --> ir-guest-info-form
  style ir-guest-info-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
