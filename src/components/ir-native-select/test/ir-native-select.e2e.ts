import { newE2EPage } from '@stencil/core/testing';

describe('ir-native-select', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-native-select></ir-native-select>');

    const element = await page.find('ir-native-select');
    expect(element).toHaveClass('hydrated');
  });
});
