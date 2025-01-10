# ir-textarea



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute            | Description | Type                                                    | Default           |
| ------------------- | -------------------- | ----------- | ------------------------------------------------------- | ----------------- |
| `cols`              | `cols`               |             | `number`                                                | `5`               |
| `label`             | `label`              |             | `string`                                                | `'<label>'`       |
| `labelWidth`        | `label-width`        |             | `1 \| 10 \| 11 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9` | `3`               |
| `maxLength`         | `max-length`         |             | `number`                                                | `250`             |
| `placeholder`       | `placeholder`        |             | `string`                                                | `'<placeholder>'` |
| `rows`              | `rows`               |             | `number`                                                | `3`               |
| `text`              | `text`               |             | `string`                                                | `''`              |
| `textareaClassname` | `textarea-classname` |             | `string`                                                | `undefined`       |
| `value`             | `value`              |             | `string`                                                | `''`              |
| `variant`           | `variant`            |             | `"default" \| "prepend"`                                | `'default'`       |


## Events

| Event        | Description | Type                  |
| ------------ | ----------- | --------------------- |
| `textChange` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-booking-extra-note](../ir-booking-details/ir-booking-extra-note)
 - [ir-guest-info](../ir-guest-info)

### Graph
```mermaid
graph TD;
  ir-booking-extra-note --> ir-textarea
  ir-guest-info --> ir-textarea
  style ir-textarea fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
