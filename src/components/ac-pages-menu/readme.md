# ac-pages-menu



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type               | Default |
| ---------- | ---------- | ----------- | ------------------ | ------- |
| `location` | `location` |             | `"nav" \| "sheet"` | `'nav'` |
| `pages`    | --         |             | `ACPages[]`        | `[]`    |


## Events

| Event          | Description | Type                      |
| -------------- | ----------- | ------------------------- |
| `link-clicked` |             | `CustomEvent<MouseEvent>` |


## Dependencies

### Used by

 - [ir-test-cmp](../ir-test-cmp)

### Depends on

- [ir-icons](../ui/ir-icons)

### Graph
```mermaid
graph TD;
  ac-pages-menu --> ir-icons
  ir-test-cmp --> ac-pages-menu
  style ac-pages-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
