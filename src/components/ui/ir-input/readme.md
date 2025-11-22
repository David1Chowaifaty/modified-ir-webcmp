# ir-input



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description                                                               | Type                                                             | Default     |
| --------------- | ---------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------- |
| `clearable`     | `clearable`      | If true, displays a clear (X) button when the input has a value.          | `boolean`                                                        | `undefined` |
| `disabled`      | `disabled`       |                                                                           | `boolean`                                                        | `undefined` |
| `label`         | `label`          | The label text displayed alongside or above the input.                    | `string`                                                         | `undefined` |
| `labelPosition` | `label-position` | Controls where the label is positioned: 'default', 'side', or 'floating'. | `"default" \| "floating" \| "side"`                              | `'default'` |
| `mask`          | `mask`           | Mask for the input field (optional)                                       | `FactoryArg \| MaskConfig<"date" \| "time" \| "price" \| "url">` | `undefined` |
| `max`           | `max`            | Maximum allowed value (for number or masked inputs).                      | `number`                                                         | `undefined` |
| `maxLength`     | `max-length`     | Maximum input length                                                      | `number`                                                         | `undefined` |
| `min`           | `min`            | Minimum allowed value (for number or masked inputs).                      | `number`                                                         | `undefined` |
| `placeholder`   | `placeholder`    | Placeholder text displayed inside the input when empty.                   | `string`                                                         | `undefined` |
| `prefixHidden`  | `prefix-hidden`  | Hides the prefix slot content from assistive technologies when true.      | `boolean`                                                        | `true`      |
| `readonly`      | `readonly`       |                                                                           | `boolean`                                                        | `undefined` |
| `required`      | `required`       |                                                                           | `boolean`                                                        | `undefined` |
| `suffixHidden`  | `suffix-hidden`  | Hides the suffix slot content from assistive technologies when true.      | `boolean`                                                        | `true`      |
| `type`          | `type`           | Type of input element — can be 'text', 'password', 'email', or 'number'.  | `"email" \| "number" \| "password" \| "text"`                    | `'text'`    |
| `value`         | `value`          | The value of the input.                                                   | `string`                                                         | `''`        |


## Events

| Event          | Description                                                     | Type                      |
| -------------- | --------------------------------------------------------------- | ------------------------- |
| `cleared`      | Fired only when the clear button is pressed.                    | `CustomEvent<void>`       |
| `input-blur`   | Fired only when the input is blurred.                           | `CustomEvent<FocusEvent>` |
| `input-change` | Fired on any value change (typing, programmatic set, or clear). | `CustomEvent<string>`     |
| `input-focus`  | Fired only when the input is focused.                           | `CustomEvent<FocusEvent>` |


## Shadow Parts

| Part                  | Description |
| --------------------- | ----------- |
| `"clear-button"`      |             |
| `"label"`             |             |
| `"prefix"`            |             |
| `"suffix"`            |             |
| `"visibility-button"` |             |
| `"wrapper"`           |             |


## CSS Custom Properties

| Name                            | Description                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--ir-clear-padding`            | Inner padding of the clear button.                                                                                                   |
| `--ir-clear-size`               | Size (width/height) of the clear button.                                                                                             |
| `--ir-danger`                   | Error color for borders and text.                                                                                                    |
| `--ir-floating-offset-block`    | Vertical distance from the top when the label floats. (No longer used for positioning, but can be kept for other purposes if needed) |
| `--ir-floating-offset-inline`   | Horizontal inset alignment for the floating label.                                                                                   |
| `--ir-floating-transition`      | Transition speed and easing for label animations.                                                                                    |
| `--ir-gap`                      | Spacing between the label, input, and any adjacent elements.                                                                         |
| `--ir-input-bg`                 | Background color of the input field.                                                                                                 |
| `--ir-input-border`             | Default input border (complete shorthand).                                                                                           |
| `--ir-input-border-focus`       | Border color when the input is focused.                                                                                              |
| `--ir-input-color`              | Text color used inside the input field.                                                                                              |
| `--ir-input-padding-block`      | Vertical padding inside the input field.                                                                                             |
| `--ir-input-padding-inline`     | Horizontal padding inside the input field.                                                                                           |
| `--ir-input-placeholder-color`  | Input placeholder color.                                                                                                             |
| `--ir-input-radius`             | Corner radius of the input field.                                                                                                    |
| `--ir-input-ring-color-focus`   | Color of the focus ring.                                                                                                             |
| `--ir-input-ring-width-focus`   | Width of the focus ring.                                                                                                             |
| `--ir-label-color`              | Default color of the label text.                                                                                                     |
| `--ir-label-floating-color`     | Label text color when active or floated.                                                                                             |
| `--ir-label-floating-font-size` | Font size of the label when floating above the input.                                                                                |
| `--ir-label-font-size`          | Default font size of the label.                                                                                                      |
| `--ir-prefix-width`             | (Internal) Width of the prefix slot content. Should be set by JS.                                                                    |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
