import { newSpecPage } from '@stencil/core/testing';
import { RequirementCheck } from '../requirement-check';

describe('requirement-check', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [RequirementCheck],
      html: `<requirement-check></requirement-check>`,
    });
    expect(page.root).toEqualHtml(`
      <requirement-check>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </requirement-check>
    `);
  });
});
