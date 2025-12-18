import type * as WebAwesomeEvents from '@awesome.me/webawesome/dist/events/events.d.ts';
import type { CustomElements } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { JSX as StencilJSX } from '@stencil/core';
declare global {
  type WaAfterCollapseEvent = WebAwesomeEvents.WaAfterCollapseEvent;
  type WaAfterExpandEvent = WebAwesomeEvents.WaAfterExpandEvent;
  type WaAfterHideEvent = WebAwesomeEvents.WaAfterHideEvent;
  type WaAfterShowEvent = WebAwesomeEvents.WaAfterShowEvent;
  type WaCancelEvent = WebAwesomeEvents.WaCancelEvent;
  type WaClearEvent = WebAwesomeEvents.WaClearEvent;
  type WaCollapseEvent = WebAwesomeEvents.WaCollapseEvent;
  type WaCopyEvent = WebAwesomeEvents.WaCopyEvent;
  type WaErrorEvent = WebAwesomeEvents.WaErrorEvent;
  type WaExpandEvent = WebAwesomeEvents.WaExpandEvent;
  type WaFinishEvent = WebAwesomeEvents.WaFinishEvent;
  type WaHideEvent = WebAwesomeEvents.WaHideEvent;
  type WaHoverEvent = WebAwesomeEvents.WaHoverEvent;
  type WaIncludeErrorEvent = WebAwesomeEvents.WaIncludeErrorEvent;
  type WaIntersectEvent = WebAwesomeEvents.WaIntersectEvent;
  type WaInvalidEvent = WebAwesomeEvents.WaInvalidEvent;
  type WaLazyChangeEvent = WebAwesomeEvents.WaLazyChangeEvent;
  type WaLazyLoadEvent = WebAwesomeEvents.WaLazyLoadEvent;
  type WaLoadEvent = WebAwesomeEvents.WaLoadEvent;
  type WaMutationEvent = WebAwesomeEvents.WaMutationEvent;
  type WaRemoveEvent = WebAwesomeEvents.WaRemoveEvent;
  type WaRepositionEvent = WebAwesomeEvents.WaRepositionEvent;
  type WaResizeEvent = WebAwesomeEvents.WaResizeEvent;
  type WaSelectEvent = WebAwesomeEvents.WaSelectEvent;
  type WaSelectionChangeEvent = WebAwesomeEvents.WaSelectionChangeEvent;
  type WaShowEvent = WebAwesomeEvents.WaShowEvent;
  type WaSlideChangeEvent = WebAwesomeEvents.WaSlideChangeEvent;
  type WaStartEvent = WebAwesomeEvents.WaStartEvent;
  type WaTabHideEvent = WebAwesomeEvents.WaTabHideEvent;
  type WaTabShowEvent = WebAwesomeEvents.WaTabShowEvent;
}

type WithHTMLEvents<T> = T & {
  onClick?: (event: MouseEvent) => void;
  onDblClick?: (event: MouseEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
};

declare module '@stencil/core' {
  export namespace JSX {
    interface IntrinsicElements {
      'wa-button': WithHTMLEvents<CustomElements['wa-button']>;
    }
  }
}
export type WebAwesomeElements = CustomElements;
