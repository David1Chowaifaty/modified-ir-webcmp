import { PaymentOption } from '@/models/payment-options';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-option-details',
  styleUrl: 'ir-option-details.css',
  scoped: true,
})
export class IrOptionDetails {
  @Prop() selectedOption: PaymentOption | null;
  render() {
    if (!this.selectedOption) {
      return null;
    }
    console.log(this.selectedOption);
    return (
      <Host>
        <form>
          {this.selectedOption.code === '005' ? (
            <ir-textarea></ir-textarea>
          ) : (
            <div>
              {this.selectedOption.data?.map(d => {
                return (
                  <fieldset key={d.key}>
                    <ir-input-text id={`input_${d.key}`} label={d.key} placeholder=""></ir-input-text>
                  </fieldset>
                );
              })}
            </div>
          )}
        </form>
      </Host>
    );
  }
}
