// HelpDocButton.tsx
import { FunctionalComponent, h } from '@stencil/core';

type HelpDocButtonProps = {
  /** Tooltip message */
  message?: string;
  /** Link to open in a new tab */
  href?: string;
  /** Optional wrapper class for layout tweaks */
  class?: string;
};

export const HelpDocButton: FunctionalComponent<HelpDocButtonProps> = ({ message, href, class: wrapperClass }) => (
  <div class={wrapperClass}>
    <style>
      {`.documentation-btn{
          display:flex;
          align-items:center;
          justify-content:center;
          height:1rem;
          width:1rem;
          border:1px solid #6b6f82;
          color:#6b6f82;
          padding:0.1rem;
          border-radius:0.5rem;
          background:transparent;
        }
        .documentation-btn:hover{
          border-color:#104064;
          background:transparent;
          color:#104064 !important;
        }`}
    </style>

    <ir-tooltip customSlot message={message}>
      <a slot="tooltip-trigger" class="documentation-btn" target="_blank" rel="noopener" href={href} aria-label={message}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path
            fill="currentColor"
            d="M224 224C224 171 267 128 320 128C373 128 416 171 416 224C416 266.7 388.1 302.9 349.5 315.4C321.1 324.6 288 350.7 288 392L288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416L352 392C352 390.3 352.6 387.9 355.5 384.7C358.5 381.4 363.4 378.2 369.2 376.3C433.5 355.6 480 295.3 480 224C480 135.6 408.4 64 320 64C231.6 64 160 135.6 160 224C160 241.7 174.3 256 192 256C209.7 256 224 241.7 224 224zM320 576C342.1 576 360 558.1 360 536C360 513.9 342.1 496 320 496C297.9 496 280 513.9 280 536C280 558.1 297.9 576 320 576z"
          />
        </svg>
      </a>
    </ir-tooltip>
  </div>
);
