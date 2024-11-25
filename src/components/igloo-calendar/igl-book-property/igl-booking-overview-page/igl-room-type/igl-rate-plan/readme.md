# igl-rate-plan



<!-- Auto Generated Below -->


## Properties

| Property                        | Attribute            | Description | Type                                              | Default          |
| ------------------------------- | -------------------- | ----------- | ------------------------------------------------- | ---------------- |
| `bookingType`                   | `booking-type`       |             | `string`                                          | `'PLUS_BOOKING'` |
| `currency` _(required)_         | --                   |             | `{ symbol: string; }`                             | `undefined`      |
| `isBookDisabled`                | `is-book-disabled`   |             | `boolean`                                         | `false`          |
| `ratePlan` _(required)_         | --                   |             | `RatePlan`                                        | `undefined`      |
| `ratePricingMode`               | --                   |             | `{ CODE_NAME: string; CODE_VALUE_EN: string; }[]` | `[]`             |
| `roomTypeId` _(required)_       | `room-type-id`       |             | `number`                                          | `undefined`      |
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

- [ir-tooltip](../../../../../ir-tooltip)

### Graph
```mermaid
graph TD;
  igl-rate-plan --> ir-tooltip
  igl-room-type --> igl-rate-plan
  style igl-rate-plan fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
