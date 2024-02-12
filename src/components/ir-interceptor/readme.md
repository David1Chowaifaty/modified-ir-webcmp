# ir-interceptor



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute | Description | Type                                                | Default                                                                                |
| ------------------ | --------- | ----------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `defaultMessage`   | --        |             | `{ loadingMessage: string; errorMessage: string; }` | `{     loadingMessage: 'Fetching Data',     errorMessage: 'Something Went Wrong',   }` |
| `handledEndpoints` | --        |             | `string[]`                                          | `['/Get_Exposed_Booking_Availability', '/ReAllocate_Exposed_Room']`                    |


## Events

| Event                             | Description | Type                                                                                                 |
| --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `fetchingIrInterceptorDataStatus` |             | `CustomEvent<"done" \| "pending">`                                                                   |
| `toast`                           |             | `CustomEvent<ICustomToast & Partial<IToastWithButton> \| IDefaultToast & Partial<IToastWithButton>>` |


## Dependencies

### Used by

 - [igloo-calendar](../igloo-calendar)

### Depends on

- [ir-loading-screen](../ir-loading-screen)

### Graph
```mermaid
graph TD;
  ir-interceptor --> ir-loading-screen
  igloo-calendar --> ir-interceptor
  style ir-interceptor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
