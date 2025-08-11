// Stencil JSX typings for ALL Shoelace custom elements
// - Provides strong typings for each `sl-*` tag using the exported component classes
// - Includes a generic fallback for any `sl-*` tag not explicitly listed

import type { EventEmitter, JSXBase } from '@stencil/core/internal';

import type SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import type SlAnimatedImage from '@shoelace-style/shoelace/dist/components/animated-image/animated-image.js';
import type SlAnimation from '@shoelace-style/shoelace/dist/components/animation/animation.js';
import type SlAvatar from '@shoelace-style/shoelace/dist/components/avatar/avatar.js';
import type SlBadge from '@shoelace-style/shoelace/dist/components/badge/badge.js';
import type SlBreadcrumb from '@shoelace-style/shoelace/dist/components/breadcrumb/breadcrumb.js';
import type SlBreadcrumbItem from '@shoelace-style/shoelace/dist/components/breadcrumb-item/breadcrumb-item.js';
import type SlButton from '@shoelace-style/shoelace/dist/components/button/button.js';
import type SlButtonGroup from '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import type SlCard from '@shoelace-style/shoelace/dist/components/card/card.js';
import type SlCarousel from '@shoelace-style/shoelace/dist/components/carousel/carousel.js';
import type SlCarouselItem from '@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.js';
import type SlCheckbox from '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import type SlColorPicker from '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
import type SlCopyButton from '@shoelace-style/shoelace/dist/components/copy-button/copy-button.js';
import type SlDetails from '@shoelace-style/shoelace/dist/components/details/details.js';
import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import type SlDivider from '@shoelace-style/shoelace/dist/components/divider/divider.js';
import type SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import type SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import type SlFormatBytes from '@shoelace-style/shoelace/dist/components/format-bytes/format-bytes.js';
import type SlFormatDate from '@shoelace-style/shoelace/dist/components/format-date/format-date.js';
import type SlFormatNumber from '@shoelace-style/shoelace/dist/components/format-number/format-number.js';
import type SlIcon from '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type SlIconButton from '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import type SlImageComparer from '@shoelace-style/shoelace/dist/components/image-comparer/image-comparer.js';
import type SlInclude from '@shoelace-style/shoelace/dist/components/include/include.js';
import type SlInput from '@shoelace-style/shoelace/dist/components/input/input.js';
import type SlMenu from '@shoelace-style/shoelace/dist/components/menu/menu.js';
import type SlMenuItem from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import type SlMenuLabel from '@shoelace-style/shoelace/dist/components/menu-label/menu-label.js';
import type SlMutationObserver from '@shoelace-style/shoelace/dist/components/mutation-observer/mutation-observer.js';
import type SlOption from '@shoelace-style/shoelace/dist/components/option/option.js';
import type SlPopup from '@shoelace-style/shoelace/dist/components/popup/popup.js';
import type SlProgressBar from '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';
import type SlProgressRing from '@shoelace-style/shoelace/dist/components/progress-ring/progress-ring.js';
import type SlQrCode from '@shoelace-style/shoelace/dist/components/qr-code/qr-code.js';
import type SlRadio from '@shoelace-style/shoelace/dist/components/radio/radio.js';
import type SlRadioButton from '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import type SlRadioGroup from '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import type SlRange from '@shoelace-style/shoelace/dist/components/range/range.js';
import type SlRating from '@shoelace-style/shoelace/dist/components/rating/rating.js';
import type SlRelativeTime from '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import type SlResizeObserver from '@shoelace-style/shoelace/dist/components/resize-observer/resize-observer.js';
import type SlSelect from '@shoelace-style/shoelace/dist/components/select/select.js';
import type SlSkeleton from '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import type SlSpinner from '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import type SlSplitPanel from '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js';
import type SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';
import type SlTab from '@shoelace-style/shoelace/dist/components/tab/tab.js';
import type SlTabGroup from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import type SlTabPanel from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import type SlTag from '@shoelace-style/shoelace/dist/components/tag/tag.js';
import type SlTextarea from '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import type SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import type SlTree from '@shoelace-style/shoelace/dist/components/tree/tree.js';
import type SlTreeItem from '@shoelace-style/shoelace/dist/components/tree-item/tree-item.js';
import type SlVisuallyHidden from '@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden.js';

type ShoelaceElementProps<TElement> = Partial<TElement> & JSXBase.HTMLAttributes<TElement>;

declare module '@stencil/core' {
  export namespace JSX {
    interface IntrinsicElements {
      'sl-alert': ShoelaceElementProps<SlAlert>;
      'sl-animated-image': ShoelaceElementProps<SlAnimatedImage>;
      'sl-animation': ShoelaceElementProps<SlAnimation>;
      'sl-avatar': ShoelaceElementProps<SlAvatar>;
      'sl-badge': ShoelaceElementProps<SlBadge>;
      'sl-breadcrumb': ShoelaceElementProps<SlBreadcrumb>;
      'sl-breadcrumb-item': ShoelaceElementProps<SlBreadcrumbItem>;
      'sl-button': ShoelaceElementProps<SlButton>;
      'sl-button-group': ShoelaceElementProps<SlButtonGroup>;
      'sl-card': ShoelaceElementProps<SlCard>;
      'sl-carousel': ShoelaceElementProps<SlCarousel>;
      'sl-carousel-item': ShoelaceElementProps<SlCarouselItem>;
      'sl-checkbox': ShoelaceElementProps<SlCheckbox>;
      'sl-color-picker': ShoelaceElementProps<SlColorPicker>;
      'sl-copy-button': ShoelaceElementProps<SlCopyButton>;
      'sl-details': ShoelaceElementProps<SlDetails>;
      'sl-dialog': ShoelaceElementProps<SlDialog>;
      'sl-divider': ShoelaceElementProps<SlDivider>;
      'sl-drawer': ShoelaceElementProps<SlDrawer>;
      'sl-dropdown': ShoelaceElementProps<SlDropdown>;
      'sl-format-bytes': ShoelaceElementProps<SlFormatBytes>;
      'sl-format-date': ShoelaceElementProps<SlFormatDate>;
      'sl-format-number': ShoelaceElementProps<SlFormatNumber>;
      'sl-icon': ShoelaceElementProps<SlIcon>;
      'sl-icon-button': ShoelaceElementProps<SlIconButton>;
      'sl-image-comparer': ShoelaceElementProps<SlImageComparer>;
      'sl-include': ShoelaceElementProps<SlInclude>;
      'sl-input': ShoelaceElementProps<SlInput>;
      'sl-menu': ShoelaceElementProps<SlMenu>;
      'sl-menu-item': ShoelaceElementProps<SlMenuItem>;
      'sl-menu-label': ShoelaceElementProps<SlMenuLabel>;
      'sl-mutation-observer': ShoelaceElementProps<SlMutationObserver>;
      'sl-option': ShoelaceElementProps<SlOption>;
      'sl-popup': ShoelaceElementProps<SlPopup>;
      'sl-progress-bar': ShoelaceElementProps<SlProgressBar>;
      'sl-progress-ring': ShoelaceElementProps<SlProgressRing>;
      'sl-qr-code': ShoelaceElementProps<SlQrCode>;
      'sl-radio': ShoelaceElementProps<SlRadio>;
      'sl-radio-button': ShoelaceElementProps<SlRadioButton>;
      'sl-radio-group': ShoelaceElementProps<SlRadioGroup>;
      'sl-range': ShoelaceElementProps<SlRange>;
      'sl-rating': ShoelaceElementProps<SlRating>;
      'sl-relative-time': ShoelaceElementProps<SlRelativeTime>;
      'sl-resize-observer': ShoelaceElementProps<SlResizeObserver>;
      'sl-select': ShoelaceElementProps<SlSelect>;
      'sl-skeleton': ShoelaceElementProps<SlSkeleton>;
      'sl-spinner': ShoelaceElementProps<SlSpinner>;
      'sl-split-panel': ShoelaceElementProps<SlSplitPanel>;
      'sl-switch': ShoelaceElementProps<SlSwitch>;
      'sl-tab': ShoelaceElementProps<SlTab>;
      'sl-tab-group': ShoelaceElementProps<SlTabGroup>;
      'sl-tab-panel': ShoelaceElementProps<SlTabPanel>;
      'sl-tag': ShoelaceElementProps<SlTag>;
      'sl-textarea': ShoelaceElementProps<SlTextarea>;
      'sl-tooltip': ShoelaceElementProps<SlTooltip>;
      'sl-tree': ShoelaceElementProps<SlTree>;
      'sl-tree-item': ShoelaceElementProps<SlTreeItem>;
      'sl-visually-hidden': ShoelaceElementProps<SlVisuallyHidden>;

      // Generic fallback for any other `sl-*` tags
      [tagName: `sl-${string}`]: JSXBase.HTMLAttributes<HTMLElement>;
    }
  }
}
