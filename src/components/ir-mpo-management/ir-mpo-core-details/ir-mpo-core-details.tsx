import { Component, Host, State, h } from '@stencil/core';
import { z } from 'zod';

@Component({
  tag: 'ir-mpo-core-details',
  styleUrl: 'ir-mpo-core-details.css',
  scoped: true,
})
export class IrMpoCoreDetails {
  @State() password: string;
  render() {
    return (
      <Host>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <ir-validator schema={z.string().min(10)} autovalidate valueEvent="input-change" blurEvent="input-blur">
                <ir-input class="mpo-management__input " placeholder="Company name" label="Company name *" labelPosition="side"></ir-input>
              </ir-validator>
              <div class="mpo-management__credentials-container">
                <ir-input class="mpo-management__input flex-fill" readonly label="Credentials *" placeholder="Username" labelPosition="side"></ir-input>

                <ir-input
                  class="mpo-management__input mpo-management__input-password flex-fill"
                  label="Password *"
                  type="password"
                  placeholder="Password"
                  onInput-change={e => (this.password = e.detail)}
                  labelPosition="side"
                ></ir-input>
              </div>
              <div class={'d-flex justify-content-end'}>
                {this.password && <ir-password-validator password={this.password} style={{ marginLeft: 'calc(130px + 0.5rem)' }}></ir-password-validator>}
              </div>
            </div>
          </div>
        </section>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <div class="mpo-management__country-container">
                <ir-native-select
                  label="Country *"
                  class="mpo-management__input flex-fill"
                  options={[...Array(10)].map((_, i) => ({
                    label: i.toString() + ' aaaaaaa',
                    value: i,
                  }))}
                  labelPosition="side"
                ></ir-native-select>

                <ir-input class="mpo-management__input mpo-management__input-city flex-fill" label="City" placeholder="City" labelPosition="side"></ir-input>
              </div>
              <ir-input class="mpo-management__input " label="Billing *" labelPosition="side" placeholder="Billing"></ir-input>
              <ir-input class="mpo-management__input " label="Address *" labelPosition="side" placeholder="Address"></ir-input>
            </div>
          </div>
        </section>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <ir-input class="mpo-management__input " placeholder="Main contact" label="Main contact *" labelPosition="side"></ir-input>
              <ir-input class="mpo-management__input " type="email" label="Email *" placeholder="Email" labelPosition="side"></ir-input>

              <ir-input class="mpo-management__input " label="Phone *" placeholder="Phone" labelPosition="side"></ir-input>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
