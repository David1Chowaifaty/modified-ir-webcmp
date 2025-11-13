import { newSpecPage } from '@stencil/core/testing';
import { IrColorPicker } from '../ir-color-picker';
import { IrInput } from '@/components/ui/ir-input/ir-input';

describe('ir-color-picker', () => {
  it('renders empty state with checker background', async () => {
    const page = await newSpecPage({
      components: [IrColorPicker, IrInput],
      html: `<ir-color-picker></ir-color-picker>`,
    });

    const input = page.root?.shadowRoot?.querySelector('ir-input') as HTMLIrInputElement;
    expect(input.value).toBe('');
    const swatch = page.root?.shadowRoot?.querySelector('.picker__swatch-bg') as HTMLElement;
    expect(swatch?.classList.contains('picker__swatch-bg--empty')).toBe(true);
  });

  it('emits color-change when hex input receives a valid value', async () => {
    const page = await newSpecPage({
      components: [IrColorPicker, IrInput],
      html: `<ir-color-picker></ir-color-picker>`,
    });

    const spy = jest.fn();
    page.root?.addEventListener('color-change', spy);

    const input = page.root?.shadowRoot?.querySelector('ir-input');
    input?.dispatchEvent(new CustomEvent('input-change', { detail: '#aabbcc', bubbles: true }));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
    const detail = spy.mock.calls[spy.mock.calls.length - 1][0].detail;
    expect(detail.value).toBe('#AABBCC');
    expect(detail.source).toBe('input');
    expect(detail.isValid).toBe(true);
  });

  it('clears the value when the input clear button is used', async () => {
    const page = await newSpecPage({
      components: [IrColorPicker, IrInput],
      html: `<ir-color-picker value="#123456"></ir-color-picker>`,
    });

    const spy = jest.fn();
    page.root?.addEventListener('color-change', spy);

    const input = page.root?.shadowRoot?.querySelector('ir-input');
    input?.dispatchEvent(new CustomEvent('cleared', { bubbles: true }));
    await page.waitForChanges();

    const detail = spy.mock.calls[spy.mock.calls.length - 1][0].detail;
    expect(detail.value).toBeUndefined();
    expect(detail.source).toBe('clear');
    expect(detail.isValid).toBe(false);
  });
});
