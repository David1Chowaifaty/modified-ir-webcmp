import { Component, Prop, Event, EventEmitter, h, Listen, Method } from '@stencil/core';
import { v4 } from 'uuid';
import { TIcons } from '../ir-icons/icons';

@Component({
  tag: 'ir-button',
  styleUrl: 'ir-button.css',
  scoped: true,
})
export class IrButton {
  /**
   * The name of the button, used for identification purposes.
   */
  @Prop() name: string;
  /**
   * The text content displayed inside the button.
   */
  @Prop() text: string;

  /**
   * The color theme of the button.
   */
  @Prop() btn_color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline' | 'link' = 'primary';

  /**
   * The size of the button.
   */
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * The size of the text inside the button.
   */
  @Prop() textSize: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Whether the button should expand to the full width of its container.
   */
  @Prop() btn_block = true;

  /**
   * Disables the button when set to true.
   */
  @Prop() btn_disabled = false;

  /**
   * The button type attribute (`button`, `submit`, or `reset`).
   */
  @Prop() btn_type = 'button';

  /**
   * Displays a loading indicator when true and disables the button.
   */
  @Prop() isLoading: boolean = false;

  /**
   * Additional custom class names for the button.
   */
  @Prop() btn_styles: string;

  /**
   * A unique identifier for the button instance.
   */
  @Prop() btn_id: string = v4();

  /**
   * Visual variant of the button: either standard (`default`) or icon-only (`icon`).
   */
  @Prop() variant: 'default' | 'icon' = 'default';

  /**
   * The name of the icon to display.
   */
  @Prop() icon_name: TIcons;

  /**
   * If true, applies a visible background when hovered.
   */
  @Prop() visibleBackgroundOnHover: boolean = false;

  /**
   * Position of the icon relative to the button text.
   */
  @Prop() iconPosition: 'left' | 'right' = 'left';

  /**
   * Custom style object for the icon.
   */
  @Prop() icon_style: any;

  /**
   * Custom inline styles for the button element.
   */
  @Prop() btnStyle: { [key: string]: string };

  /**
   * Custom inline styles for the label/text inside the button.
   */
  @Prop() labelStyle: { [key: string]: string };

  /**
   * If true, renders the text property as raw HTML inside the button.
   */
  @Prop() renderContentAsHtml: boolean = false;

  /**
   * Emits a custom click event when the button is clicked.
   */
  @Event({ bubbles: true, composed: true }) clickHandler: EventEmitter<any>;

  private buttonEl: HTMLButtonElement;

  @Listen('animateIrButton', { target: 'body' })
  handleButtonAnimation(e: CustomEvent) {
    if (!this.buttonEl || e.detail !== this.btn_id) {
      return;
    }
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.buttonEl.classList.remove('bounce-3');
    void this.buttonEl.offsetWidth;
    this.buttonEl.classList.add('bounce-3');
  }

  /**
   * Triggers a bounce animation on the button.
   */
  @Method()
  async bounce() {
    this.buttonEl.classList.remove('bounce-3');
    void this.buttonEl.offsetWidth;
    this.buttonEl.classList.add('bounce-3');
  }

  render() {
    const disabled = this.btn_disabled || this.isLoading;
    if (this.variant === 'icon') {
      return (
        // <sl-icon-button class="icon-button" library="my-icons" name={this.icon_name} onclick={() => this.clickHandler.emit()}></sl-icon-button>
        <button
          id={this.btn_id}
          class={`icon-button ${this.btn_styles} ${this.visibleBackgroundOnHover ? 'hovered_bg' : ''}`}
          ref={el => (this.buttonEl = el)}
          onClick={() => this.clickHandler.emit()}
          type={this.btn_type}
          disabled={disabled}
        >
          {this.isLoading ? <span class="icon-loader"></span> : <ir-icons class={'m-0 p-0'} name={this.icon_name}></ir-icons>}
        </button>
      );
    }
    let blockClass = this.btn_block ? 'btn-block' : '';
    return (
      // <button
      //   id={this.btn_id}
      //   ref={el => (this.buttonEl = el)}
      //   onClick={() => this.clickHandler.emit()}
      //   class={`btn btn-${this.btn_color} ${this.btn_styles} ir-button-class  btn-${this.size} text-${this.textSize} ${blockClass}`}
      //   type={this.btn_type}
      //   style={this.btnStyle}
      //   disabled={disabled}
      // >
      //   {this.icon_name && this.iconPosition === 'left' && <ir-icons name={this.icon_name} style={this.icon_style}></ir-icons>}
      //   {this.text &&
      //     (this.renderContentAsHtml ? (
      //       <span class="button-text m-0" innerHTML={this.text} style={this.labelStyle}></span>
      //     ) : (
      //       <span style={this.labelStyle} class="button-text m-0">
      //         {this.text}
      //       </span>
      //     ))}
      //   {this.isLoading ? <div class="btn_loader m-0 p-0"></div> : this.iconPosition === 'right' && <ir-icons style={this.icon_style} name={this.icon_name}></ir-icons>}
      // </button>
      <sl-button size="small" variant="primary">
        {this.text}
      </sl-button>
    );
  }
}
