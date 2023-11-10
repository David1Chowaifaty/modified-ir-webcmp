# ir-date-picker



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type                                                            | Default                                                                                                                                                                           |
| ------------------ | -------------------- | ----------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applyLabel`       | `apply-label`        |             | `string`                                                        | `"Apply"`                                                                                                                                                                         |
| `autoApply`        | `auto-apply`         |             | `boolean`                                                       | `undefined`                                                                                                                                                                       |
| `cancelLabel`      | `cancel-label`       |             | `string`                                                        | `"Cancel"`                                                                                                                                                                        |
| `customRangeLabel` | `custom-range-label` |             | `string`                                                        | `"Custom"`                                                                                                                                                                        |
| `daysOfWeek`       | --                   |             | `string[]`                                                      | `[     "Su",     "Mo",     "Tu",     "We",     "Th",     "Fr",     "Sa",   ]`                                                                                                     |
| `firstDay`         | `first-day`          |             | `number`                                                        | `1`                                                                                                                                                                               |
| `format`           | `format`             |             | `string`                                                        | `"MMM DD,YYYY"`                                                                                                                                                                   |
| `fromDate`         | --                   |             | `Date`                                                          | `undefined`                                                                                                                                                                       |
| `fromLabel`        | `from-label`         |             | `string`                                                        | `"Form"`                                                                                                                                                                          |
| `maxSpan`          | `max-span`           |             | `Duration \| DurationInputObject \| FromTo \| number \| string` | `{     days: 240,   }`                                                                                                                                                            |
| `monthNames`       | --                   |             | `string[]`                                                      | `[     "January",     "February",     "March",     "April",     "May",     "June",     "July",     "August",     "September",     "October",     "November",     "December",   ]` |
| `opens`            | `opens`              |             | `"center" \| "left" \| "right"`                                 | `undefined`                                                                                                                                                                       |
| `separator`        | `separator`          |             | `string`                                                        | `"-"`                                                                                                                                                                             |
| `toDate`           | --                   |             | `Date`                                                          | `undefined`                                                                                                                                                                       |
| `toLabel`          | `to-label`           |             | `string`                                                        | `"To"`                                                                                                                                                                            |
| `weekLabel`        | `week-label`         |             | `string`                                                        | `"W"`                                                                                                                                                                             |


## Events

| Event         | Description | Type                                           |
| ------------- | ----------- | ---------------------------------------------- |
| `dateChanged` |             | `CustomEvent<{ start: Moment; end: Moment; }>` |


## Dependencies

### Used by

 - [igl-date-range](../igloo-calendar/igl-date-range)

### Graph
```mermaid
graph TD;
  igl-date-range --> ir-date-picker
  style ir-date-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*