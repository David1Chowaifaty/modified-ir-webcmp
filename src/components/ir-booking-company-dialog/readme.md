# ir-booking-company-dialog



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default     |
| --------- | --------- | ----------- | --------- | ----------- |
| `booking` | --        |             | `Booking` | `undefined` |


## Events

| Event               | Description | Type                   |
| ------------------- | ----------- | ---------------------- |
| `companyFormClosed` |             | `CustomEvent<void>`    |
| `resetBookingEvt`   |             | `CustomEvent<Booking>` |


## Methods

### `closeCompanyForm() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `openCompanyForm() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-booking-billing-recipient](../ir-booking-billing-recipient)
 - [ir-reservation-information](../ir-booking-details/ir-reservation-information)

### Depends on

- [ir-dialog](../ui/ir-dialog)
- [ir-booking-company-form](ir-booking-company-form)
- [ir-custom-button](../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-booking-company-dialog --> ir-dialog
  ir-booking-company-dialog --> ir-booking-company-form
  ir-booking-company-dialog --> ir-custom-button
  ir-booking-company-form --> ir-input
  ir-booking-billing-recipient --> ir-booking-company-dialog
  ir-reservation-information --> ir-booking-company-dialog
  style ir-booking-company-dialog fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
