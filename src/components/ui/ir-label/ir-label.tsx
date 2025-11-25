import { Component, Prop, h, Host } from '@stencil/core';

@Component({
  tag: 'ir-label',
  styleUrl: 'ir-label.css',
  scoped: true,
})
export class IrLabel {
  // -- Props --
  /** The text to display as the label's title */
  @Prop() labelText: string;

  /** The main text or HTML content to display */
  @Prop() content: string;

  @Prop() display: 'inline' | 'flex' = 'flex';

  /** If true, will render `content` as HTML */
  @Prop() renderContentAsHtml: boolean = false;

  /** Object representing the image used within the label */
  @Prop() image?: { src: string; alt: string; style?: string } | null = null;

  /** Renders a country-type image style (vs. a 'logo') */
  @Prop() isCountryImage: boolean = false;

  /** Additional CSS classes or style for the image */
  @Prop() imageStyle: string = '';

  /** If true, label will ignore checking for an empty content */
  @Prop() ignoreEmptyContent: boolean = false;

  /** Placeholder text to display if content is empty */
  @Prop() placeholder: string;

  /** inline styles for the component container */
  @Prop() containerStyle: {
    [key: string]: string;
  };

  render() {
    // If we have no content and no placeholder, and we are NOT ignoring the empty content, return null.
    if (!this.placeholder && !this.content && !this.ignoreEmptyContent) {
      return <Host data-empty></Host>;
    }

    return (
      <Host class={this.image ? 'align-items-center' : ''}>
        {/* Label title */}
        <div class={`${this.display === 'inline' ? 'label_wrapper_inline' : 'label_wrapper_flex'} `} style={this.containerStyle}>
          {this.labelText && <p class="label_title">{this.labelText}</p>}

          {/* Slot BEFORE content (prefix slot) */}
          <slot name="prefix" />

          {/* Optional image */}
          {this.image && (
            <img
              src={this.image.src}
              alt={this.image.alt ?? this.image.src}
              class={`p-0 m-0 ${this.isCountryImage ? 'country' : 'logo'} ${this.image.style ?? ''} ${this.imageStyle ?? ''}`}
            />
          )}

          {/* Main content or placeholder */}
          {this.content ? (
            this.renderContentAsHtml ? (
              <p class="label_message" innerHTML={this.content}></p>
            ) : (
              <p class="label_message">{this.content}</p>
            )
          ) : (
            <p class="label_placeholder">{this.placeholder}</p>
          )}

          {/* Default slot goes after the main content, but before suffix */}
          <slot />

          {/* Slot AFTER content (suffix slot) */}
          <slot name="suffix" />
        </div>
      </Host>
    );
  }
}
