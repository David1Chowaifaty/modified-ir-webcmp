# ir-text-editor



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type                              | Default     |
| ------------------ | -------------------- | ----------- | --------------------------------- | ----------- |
| `error`            | `error`              |             | `boolean`                         | `undefined` |
| `placeholder`      | `placeholder`        |             | `string`                          | `undefined` |
| `plugins`          | --                   |             | `(string \| PluginConstructor)[]` | `[]`        |
| `pluginsMode`      | `plugins-mode`       |             | `"add" \| "replace"`              | `'add'`     |
| `toolbarItems`     | --                   |             | `ToolbarConfigItem[]`             | `[]`        |
| `toolbarItemsMode` | `toolbar-items-mode` |             | `"add" \| "replace"`              | `'add'`     |
| `value`            | `value`              |             | `string`                          | `undefined` |


## Events

| Event        | Description | Type                  |
| ------------ | ----------- | --------------------- |
| `textChange` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-option-details](../../ir-payment-option/ir-option-details)

### Graph
```mermaid
graph TD;
  ir-option-details --> ir-text-editor
  style ir-text-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
