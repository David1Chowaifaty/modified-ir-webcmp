import { newSpecPage } from '@stencil/core/testing';
import { IrNativeSelect } from '../ir-native-select';

describe('ir-native-select', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrNativeSelect],
      html: `<ir-native-select></ir-native-select>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-native-select>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-native-select>
    `);
  });
});
