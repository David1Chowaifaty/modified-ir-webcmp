# ir-drawer



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                 | Type                | Default     |
| ------------- | -------------- | --------------------------- | ------------------- | ----------- |
| `drawerTitle` | `drawer-title` | The title of the drawer     | `string`            | `undefined` |
| `open`        | `open`         | Is the drawer open?         | `boolean`           | `false`     |
| `placement`   | `placement`    | The placement of the drawer | `"left" \| "right"` | `'right'`   |


## Events

| Event                  | Description                                                    | Type                   |
| ---------------------- | -------------------------------------------------------------- | ---------------------- |
| `drawerChange`         | Emitted when the drawer visibility changes.                    | `CustomEvent<boolean>` |
| `drawerCloseRequested` | Emitted when the drawer is requested to be closed via keyboard | `CustomEvent<void>`    |


## Methods

### `closeDrawer() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
