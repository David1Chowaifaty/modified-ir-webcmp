import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'requirement-check',
  styleUrl: 'requirement-check.css',
  scoped: true,
})
export class RequirementCheck {
  /**
   * Whether this requirement has been satisfied (true/false).
   */
  @Prop() isValid: boolean = false;

  /**
   * The requirement text to display (e.g. "At least one lowercase letter").
   */
  @Prop() text: string = '';

  render() {
    return (
      <div class={{ requirement: true, valid: this.isValid }}>
        <ir-icons style={{ '--icon-size': '0.875rem' }} name={this.isValid ? 'check' : 'xmark'}></ir-icons>
        <span>{this.text}</span>
      </div>
    );
  }
}
