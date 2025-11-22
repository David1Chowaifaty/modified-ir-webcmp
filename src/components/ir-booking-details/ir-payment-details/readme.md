# ir-payment-details



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute     | Description | Type                                                              | Default     |
| ---------------- | ------------- | ----------- | ----------------------------------------------------------------- | ----------- |
| `booking`        | --            |             | `Booking`                                                         | `undefined` |
| `paymentActions` | --            |             | `IPaymentAction[]`                                                | `undefined` |
| `paymentEntries` | --            |             | `{ types: IEntries[]; groups: IEntries[]; methods: IEntries[]; }` | `undefined` |
| `propertyId`     | `property-id` |             | `number`                                                          | `undefined` |


## Events

| Event                               | Description | Type                                                                                                                                            |
| ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `openPrintScreen`                   |             | `CustomEvent<{ mode: "printing" \| "invoice" \| "proforma" \| "creditnote"; } \| { mode: "receipt"; payload: { pid: string; rnb: string; }; }>` |
| `openSidebar`                       |             | `CustomEvent<{ type: "payment-folio"; payload: { payment: Payment; mode: FolioEntryMode; }; }>`                                                 |
| `resetBookingEvt`                   |             | `CustomEvent<null>`                                                                                                                             |
| `resetExposedCancellationDueAmount` |             | `CustomEvent<null>`                                                                                                                             |
| `toast`                             |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>`                                            |


## Dependencies

### Used by

 - [ir-booking-details](..)

### Depends on

- [ir-payment-summary](ir-payment-summary)
- [ir-booking-guarantee](ir-booking-guarantee)
- [ir-applicable-policies](ir-applicable-policies)
- [ir-button](../../ui/ir-button)
- [ir-payments-folio](ir-payments-folio)
- [ir-modal](../../ui/ir-modal)

### Graph
```mermaid
graph TD;
  ir-payment-details --> ir-payment-summary
  ir-payment-details --> ir-booking-guarantee
  ir-payment-details --> ir-applicable-policies
  ir-payment-details --> ir-button
  ir-payment-details --> ir-payments-folio
  ir-payment-details --> ir-modal
  ir-booking-guarantee --> ir-label
  ir-booking-guarantee --> ir-button
  ir-button --> ir-icons
  ir-applicable-policies --> ir-custom-button
  ir-applicable-policies --> ir-icons
  ir-payments-folio --> ir-payment-item
  ir-payments-folio --> ir-custom-button
  ir-payment-item --> ir-popover
  ir-payment-item --> ir-button
  ir-payment-item --> ir-custom-button
  ir-modal --> ir-button
  ir-booking-details --> ir-payment-details
  style ir-payment-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
