import { Component, Host, State, h } from '@stencil/core';
import { z, ZodError } from 'zod';
const userSchema = z.object({ password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+]).{8,16}$/) });
type User = z.infer<typeof userSchema>;
@Component({
  tag: 'ir-test-cmp',
  styleUrl: 'ir-test-cmp.css',
  scoped: true,
})
export class IrTestCmp {
  @State() user: User = {
    password: '',
  };
  @State() error: Record<keyof User, boolean>;
  @State() autoValidate = false;
  render() {
    return (
      <Host class="card p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            try {
              this.error = null;
              this.autoValidate = true;
              console.log('here');
              userSchema.parse(this.user);
              alert('passed');
            } catch (error) {
              const er = {};
              if (error instanceof ZodError) {
                error.issues.forEach(e => {
                  er[e.path[0]] = true;
                });
                this.error = er as any;
              }
              console.log(error);
            }
          }}
        >
          <ir-input-text
            value={this.user.password}
            autoValidate={this.autoValidate}
            zod={userSchema.pick({ password: true })}
            wrapKey="password"
            error={this.error?.password}
            type="password"
            label="Password"
            onTextChange={e => (this.user = { ...this.user, password: e.detail })}
            maxLength={14}
          ></ir-input-text>
          <p> {this.user.password}</p> <button class={'btn btn-primary'}>Submit</button>
        </form>
      </Host>
    );
  }
}
