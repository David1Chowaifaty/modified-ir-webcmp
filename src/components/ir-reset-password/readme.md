# ir-reset-password



<!-- Auto Generated Below -->


## Events

| Event        | Description | Type                                                           |
| ------------ | ----------- | -------------------------------------------------------------- |
| `authFinish` |             | `CustomEvent<{ token: string; code: "error" \| "succsess"; }>` |


## Dependencies

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-toast](../ui/ir-toast)
- [ir-input-text](../ui/ir-input-text)
- [ir-password-validator](../ir-password-validator)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-reset-password --> ir-interceptor
  ir-reset-password --> ir-toast
  ir-reset-password --> ir-input-text
  ir-reset-password --> ir-password-validator
  ir-reset-password --> ir-button
  ir-password-validator --> requirement-check
  requirement-check --> ir-icons
  ir-button --> ir-icons
  style ir-reset-password fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
