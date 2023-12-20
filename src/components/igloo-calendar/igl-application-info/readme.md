# igl-application-info



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute       | Description | Type                        | Default          |
| ------------------- | --------------- | ----------- | --------------------------- | ---------------- |
| `bedPreferenceType` | --              |             | `any[]`                     | `[]`             |
| `bookingType`       | `booking-type`  |             | `string`                    | `'PLUS_BOOKING'` |
| `currency`          | `currency`      |             | `any`                       | `undefined`      |
| `defaultTexts`      | `default-texts` |             | `any`                       | `undefined`      |
| `guestInfo`         | --              |             | `{ [key: string]: any; }`   | `undefined`      |
| `guestRefKey`       | `guest-ref-key` |             | `string`                    | `undefined`      |
| `index`             | `index`         |             | `number`                    | `undefined`      |
| `roomsList`         | --              |             | `{ [key: string]: any; }[]` | `[]`             |
| `selectedUnits`     | --              |             | `number[]`                  | `[]`             |


## Events

| Event             | Description | Type                                   |
| ----------------- | ----------- | -------------------------------------- |
| `dataUpdateEvent` |             | `CustomEvent<{ [key: string]: any; }>` |


## Dependencies

### Used by

 - [igl-pagetwo](../igl-pagetwo)

### Depends on

- [ir-tooltip](../../ir-tooltip)

### Graph
```mermaid
graph TD;
  igl-application-info --> ir-tooltip
  igl-pagetwo --> igl-application-info
  style igl-application-info fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
