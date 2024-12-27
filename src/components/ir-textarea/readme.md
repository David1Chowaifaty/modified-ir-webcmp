# ir-textarea



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute            | Description | Type                     | Default           |
| ------------------- | -------------------- | ----------- | ------------------------ | ----------------- |
| `cols`              | `cols`               |             | `number`                 | `5`               |
| `label`             | `label`              |             | `string`                 | `'<label>'`       |
| `maxLength`         | `max-length`         |             | `number`                 | `250`             |
| `placeholder`       | `placeholder`        |             | `string`                 | `'<placeholder>'` |
| `rows`              | `rows`               |             | `number`                 | `3`               |
| `text`              | `text`               |             | `string`                 | `''`              |
| `textareaClassname` | `textarea-classname` |             | `string`                 | `undefined`       |
| `value`             | `value`              |             | `string`                 | `''`              |
| `variant`           | `variant`            |             | `"default" \| "prepend"` | `'default'`       |


## Events

| Event        | Description | Type                  |
| ------------ | ----------- | --------------------- |
| `textChange` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-booking-extra-note](../ir-booking-extra-note)
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
