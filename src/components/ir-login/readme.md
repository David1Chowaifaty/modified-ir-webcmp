# ir-login



<!-- Auto Generated Below -->


## Events

| Event        | Description | Type                                                           |
| ------------ | ----------- | -------------------------------------------------------------- |
| `authFinish` |             | `CustomEvent<{ token: string; code: "error" \| "succsess"; }>` |


## Dependencies

### Used by

 - [ir-booking](../ir-booking)
 - [ir-secure-tasks](../ir-secure-tasks)

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-toast](../ui/ir-toast)
- [ir-input-text](../ui/ir-input-text)
- [ir-icons](../ui/ir-icons)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-login --> ir-interceptor
  ir-login --> ir-toast
  ir-login --> ir-input-text
  ir-login --> ir-icons
  ir-login --> ir-button
  ir-button --> ir-icons
  ir-booking --> ir-login
  ir-secure-tasks --> ir-login
  style ir-login fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
