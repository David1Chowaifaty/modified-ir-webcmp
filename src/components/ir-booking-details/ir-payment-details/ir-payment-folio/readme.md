# ir-payment-folio



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type                                                                                                                                                                                                                                                                        | Default                                                                                                                                         |
| ---------------- | ---------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookingNumber`  | `booking-number` |             | `string`                                                                                                                                                                                                                                                                    | `undefined`                                                                                                                                     |
| `mode`           | `mode`           |             | `"edit" \| "new" \| "payment-action"`                                                                                                                                                                                                                                       | `undefined`                                                                                                                                     |
| `payment`        | --               |             | `{ id: number; date: string; amount: number; currency: ICurrency; designation: string; reference: string; book_nbr?: string; payment_gateway_code?: number; payment_type?: PaymentType; payment_method?: PaymentType; receipt_nbr?: string; is_receipt_issued?: boolean; }` | `{     date: moment().format(DATE_FORMAT),     amount: 0,     designation: undefined,     currency: null,     reference: null,     id: -1,   }` |
| `paymentEntries` | --               |             | `{ types: IEntries[]; groups: IEntries[]; methods: IEntries[]; }`                                                                                                                                                                                                           | `undefined`                                                                                                                                     |


## Events

| Event                               | Description | Type                |
| ----------------------------------- | ----------- | ------------------- |
| `closeModal`                        |             | `CustomEvent<null>` |
| `resetBookingEvt`                   |             | `CustomEvent<null>` |
| `resetExposedCancellationDueAmount` |             | `CustomEvent<null>` |


## Methods

### `closeFolio() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `openFolio() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-arrivals](../../../ir-arrivals)
 - [ir-booking-details](../..)
 - [ir-booking-listing](../../../ir-booking-listing)
 - [ir-departures](../../../ir-departures)
 - [ir-financial-actions](../../../ir-financial-actions)

### Depends on

- [ir-drawer](../../../ir-drawer)
- [ir-custom-date-picker](../../../ir-custom-date-picker)
- [ir-validator](../../../ui/ir-validator)
- [ir-custom-input](../../../ui/ir-custom-input)
- [ir-custom-button](../../../ui/ir-custom-button)

### Graph
```mermaid
graph TD;
  ir-payment-folio --> ir-drawer
  ir-payment-folio --> ir-custom-date-picker
  ir-payment-folio --> ir-validator
  ir-payment-folio --> ir-custom-input
  ir-payment-folio --> ir-custom-button
  ir-custom-date-picker --> ir-custom-input
  ir-arrivals --> ir-payment-folio
  ir-booking-details --> ir-payment-folio
  ir-booking-listing --> ir-payment-folio
  ir-departures --> ir-payment-folio
  ir-financial-actions --> ir-payment-folio
  style ir-payment-folio fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
