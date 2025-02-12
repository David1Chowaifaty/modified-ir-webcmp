# ir-combobox



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description | Type             | Default     |
| ------------- | ------------- | ----------- | ---------------- | ----------- |
| `autoFocus`   | `auto-focus`  |             | `boolean`        | `false`     |
| `data`        | --            |             | `ComboboxItem[]` | `[]`        |
| `disabled`    | `disabled`    |             | `boolean`        | `false`     |
| `duration`    | `duration`    |             | `number`         | `300`       |
| `input_id`    | `input_id`    |             | `string`         | `v4()`      |
| `placeholder` | `placeholder` |             | `string`         | `undefined` |
| `value`       | `value`       |             | `string`         | `undefined` |


## Events

| Event                 | Description | Type                                                                                                 |
| --------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `comboboxValueChange` |             | `CustomEvent<{ key: string; data: unknown; }>`                                                       |
| `inputCleared`        |             | `CustomEvent<null>`                                                                                  |
| `toast`               |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [ir-channel-general](../../ir-channel/ir-channel-general)
 - [ir-channel-mapping](../../ir-channel/ir-channel-mapping)
 - [ir-phone-input](../ir-phone-input)

### Graph
```mermaid
graph TD;
  ir-channel-general --> ir-combobox
  ir-channel-mapping --> ir-combobox
  ir-phone-input --> ir-combobox
  style ir-combobox fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
