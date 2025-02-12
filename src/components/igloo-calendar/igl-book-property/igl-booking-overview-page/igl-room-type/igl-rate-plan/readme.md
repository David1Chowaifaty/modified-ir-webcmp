# igl-rate-plan



<!-- Auto Generated Below -->


## Properties

| Property                        | Attribute            | Description | Type                                              | Default          |
| ------------------------------- | -------------------- | ----------- | ------------------------------------------------- | ---------------- |
| `bookingType`                   | `booking-type`       |             | `string`                                          | `'PLUS_BOOKING'` |
| `currency` _(required)_         | --                   |             | `{ symbol: string; }`                             | `undefined`      |
| `isBookDisabled`                | `is-book-disabled`   |             | `boolean`                                         | `false`          |
| `ratePlan`                      | --                   |             | `RatePlan`                                        | `undefined`      |
| `ratePricingMode`               | --                   |             | `{ CODE_NAME: string; CODE_VALUE_EN: string; }[]` | `[]`             |
| `roomTypeId`                    | `room-type-id`       |             | `number`                                          | `undefined`      |
| `shouldBeDisabled` _(required)_ | `should-be-disabled` |             | `boolean`                                         | `undefined`      |
| `visibleInventory` _(required)_ | --                   |             | `IRatePlanSelection`                              | `undefined`      |


## Events

| Event                   | Description | Type                                   |
| ----------------------- | ----------- | -------------------------------------- |
| `gotoSplitPageTwoEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igl-room-type](..)

### Depends on

- [ir-tooltip](../../../../../ui/ir-tooltip)
- [ir-price-input](../../../../../ui/ir-price-input)

### Graph
```mermaid
graph TD;
  igl-rate-plan --> ir-tooltip
  igl-rate-plan --> ir-price-input
  igl-room-type --> igl-rate-plan
  style igl-rate-plan fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
