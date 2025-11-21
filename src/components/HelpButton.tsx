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
    <wa-tooltip for="help-button">{message}</wa-tooltip>
    <wa-button id="help-button" href={href} size="small" target="_blank" aria-label={message} appearance="plain" variant="neutral">
      <wa-icon name="circle-info" style={{ fontSize: '1rem' }}></wa-icon>
    </wa-button>
  </div>
);
