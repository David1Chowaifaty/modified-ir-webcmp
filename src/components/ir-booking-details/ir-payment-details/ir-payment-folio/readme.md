# ir-payment-folio



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type                                                                                                                                                                                                                                                                        | Default                                                                                                                                          |
| ---------------- | ---------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bookingNumber`  | `booking-number` |             | `string`                                                                                                                                                                                                                                                                    | `undefined`                                                                                                                                      |
| `mode`           | `mode`           |             | `"edit" \| "new" \| "payment-action"`                                                                                                                                                                                                                                       | `undefined`                                                                                                                                      |
| `payment`        | --               |             | `{ id: number; date: string; amount: number; currency: ICurrency; designation: string; reference: string; book_nbr?: string; payment_gateway_code?: number; payment_type?: PaymentType; payment_method?: PaymentType; receipt_nbr?: string; is_receipt_issued?: boolean; }` | `{     date: moment().format('YYYY-MM-DD'),     amount: 0,     designation: undefined,     currency: null,     reference: null,     id: -1,   }` |
| `paymentEntries` | --               |             | `{ types: IEntries[]; groups: IEntries[]; methods: IEntries[]; }`                                                                                                                                                                                                           | `undefined`                                                                                                                                      |


## Events

| Event                               | Description | Type                |
| ----------------------------------- | ----------- | ------------------- |
| `closeModal`                        |             | `CustomEvent<null>` |
| `resetBookingEvt`                   |             | `CustomEvent<null>` |
| `resetExposedCancellationDueAmount` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-details](../..)
 - [ir-financial-actions](../../../ir-financial-actions)

### Depends on

- [ir-date-picker](../../../ui/ir-date-picker)
- [ir-custom-date-picker](../../../ir-custom-date-picker)
- [ir-validator](../../../ui/ir-validator)
- [ir-custom-input](../../../ui/ir-custom-input)

### Graph
```mermaid
graph TD;
  ir-payment-folio --> ir-date-picker
  ir-payment-folio --> ir-custom-date-picker
  ir-payment-folio --> ir-validator
  ir-payment-folio --> ir-custom-input
  ir-custom-date-picker --> ir-custom-button
  ir-booking-details --> ir-payment-folio
  ir-financial-actions --> ir-payment-folio
  style ir-payment-folio fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
