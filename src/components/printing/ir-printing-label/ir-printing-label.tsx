import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-printing-label',
  styleUrl: 'ir-printing-label.css',
  shadow: true,
})
export class IrPrintingLabel {
  /**
   * Fallback label text (used if no label slot is provided)
   */
  @Prop() label?: string;
  @Prop({ attribute: 'as-html' }) asHtml: boolean;

  @Prop({ reflect: true }) display: 'inline' | 'flex' = 'flex';

  /**
   * Fallback content text (used if no content slot is provided)
   */
  @Prop() content?: string;

  render() {
    if (!this.content) {
      return null;
    }
    return (
      <Host class="ir-printing-label">
        <section part="container" class="ir-printing-label__container">
          {/* <header part="header" class="ir-printing-label__header">
            <slot name="label">
              {this.label && (
                <h5 part="label" class="ir-printing-label__label">
                  {this.label}
                </h5>
              )}
            </slot>
          </header>

          <div part="content" class="ir-printing-label__content">
            <slot name="content">
              {this.content && (
                <p part="text" class="ir-printing-label__text">
                  {this.content}
                </p>
              )}
            </slot> 
          </div>*/}
          {this.label && (
            <p class="ir-printing-label__label" part="label">
              {this.label}
            </p>
          )}
          {this.asHtml ? (
            <p part="content" class="ir-printing-label__text" innerHTML={this.content}></p>
          ) : (
            <p part="content" class="ir-printing-label__text">
              {this.content}
            </p>
          )}
          {/* 
          <footer part="footer" class="ir-printing-label__footer">
            <slot name="footer"></slot>
          </footer> */}
        </section>
      </Host>
    );
  }
}
