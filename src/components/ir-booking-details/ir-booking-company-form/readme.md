# ir-booking-company-form



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default     |
| --------- | --------- | ----------- | --------- | ----------- |
| `booking` | --        |             | `Booking` | `undefined` |


## Methods

### `openCompanyForm() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-reservation-information](../ir-reservation-information)

### Depends on

- [ir-dialog](../../ui/ir-dialog)
- [ir-custom-input](../../ui/ir-custom-input)
- [ir-custom-button](../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-booking-company-form --> ir-dialog
  ir-booking-company-form --> ir-custom-input
  ir-booking-company-form --> ir-custom-button
  ir-reservation-information --> ir-booking-company-form
  style ir-booking-company-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
