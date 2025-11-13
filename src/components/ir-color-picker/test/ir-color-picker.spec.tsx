import { newSpecPage } from '@stencil/core/testing';
import { IrColorPicker } from '../ir-color-picker';

describe('ir-color-picker', () => {
  it('renders label and inputs', async () => {
    const page = await newSpecPage({
      components: [IrColorPicker],
      html: `<ir-color-picker label="Brand color" message="Select a color"></ir-color-picker>`,
    });

    const label = page.root?.shadowRoot?.querySelector('.color-picker__label');
    expect(label?.textContent).toBe('Brand color');

    const hexInput = page.root?.shadowRoot?.querySelector('.color-picker__hex-input') as HTMLInputElement;
    expect(hexInput.value).toBe('#2563EB');
  });

  it('emits color-change when the native color input changes', async () => {
    const page = await newSpecPage({
      components: [IrColorPicker],
      html: `<ir-color-picker></ir-color-picker>`,
    });

    const spy = jest.fn();
    page.root?.addEventListener('color-change', spy);

    const colorInput = page.root?.shadowRoot?.querySelector('input[type="color"]') as HTMLInputElement;
    colorInput.value = '#ff0000';
    colorInput.dispatchEvent(new Event('input'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
    const detail = spy.mock.calls[0][0].detail;
    expect(detail.value).toBe('#FF0000');
    expect(detail.source).toBe('picker');
    expect(detail.isValid).toBe(true);
  });

  it('marks the hex input invalid when an incorrect value is entered', async () => {
    const page = await newSpecPage({
      components: [IrColorPicker],
      html: `<ir-color-picker></ir-color-picker>`,
    });

    const hexInput = page.root?.shadowRoot?.querySelector('.color-picker__hex-input') as HTMLInputElement;
    hexInput.value = '#12';
    hexInput.dispatchEvent(new Event('input'));
    await page.waitForChanges();

    const helper = page.root?.shadowRoot?.querySelector('.color-picker__helper--error');
    expect(helper).not.toBeNull();
    expect(hexInput.getAttribute('aria-invalid')).toBe('true');
  });
});
