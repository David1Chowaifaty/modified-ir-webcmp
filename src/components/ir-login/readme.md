# ir-login



<!-- Auto Generated Below -->


## Events

| Event        | Description | Type                                                           |
| ------------ | ----------- | -------------------------------------------------------------- |
| `authFinish` |             | `CustomEvent<{ token: string; code: "error" \| "succsess"; }>` |


## Dependencies

### Used by

 - [igloo-calendar](../igloo-calendar)
 - [ir-booking](../ir-booking)

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-toast](../ir-toast)
- [ir-input-text](../ir-input-text)
- [ir-icons](../ui/ir-icons)
- [ir-button](../ir-button)

### Graph
```mermaid
graph TD;
  ir-login --> ir-interceptor
  ir-login --> ir-toast
  ir-login --> ir-input-text
  ir-login --> ir-icons
  ir-login --> ir-button
  ir-button --> ir-icons
  igloo-calendar --> ir-login
  ir-booking --> ir-login
  style ir-login fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
