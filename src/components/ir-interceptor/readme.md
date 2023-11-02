# ir-interceptor



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute | Description | Type                                                                        | Default                                                                                                               |
| ------------------ | --------- | ----------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `defaultMessage`   | --        |             | `{ loadingMessage: string; successMessage: string; errorMessage: string; }` | `{     loadingMessage: "Fetching Data",     successMessage: "Success",     errorMessage: "Something Went Wrong",   }` |
| `handledEndpoints` | --        |             | `string[]`                                                                  | `[     "/Get_Exposed_Booking_Availability",     "/Get_Aggregated_UnAssigned_Rooms",   ]`                              |


## Dependencies

### Used by

 - [igloo-calendar](../igloo-calendar)

### Graph
```mermaid
graph TD;
  igloo-calendar --> ir-interceptor
  style ir-interceptor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
