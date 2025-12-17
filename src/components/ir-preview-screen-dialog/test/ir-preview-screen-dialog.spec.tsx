import { newSpecPage } from '@stencil/core/testing';
import { IrPreviewScreenDialog } from '../ir-preview-screen-dialog';

describe('ir-preview-screen-dialog', () => {
  it('renders preview dialog shell with action button', async () => {
    const page = await newSpecPage({
      components: [IrPreviewScreenDialog],
      html: `<ir-preview-screen-dialog></ir-preview-screen-dialog>`,
    });

    const dialog = page.root.shadowRoot.querySelector('ir-dialog');
    expect(dialog).toBeTruthy();

    const actionButton = page.root.shadowRoot.querySelector('ir-custom-button');
    expect(actionButton).toBeTruthy();
    expect(actionButton.getAttribute('disabled')).toBeNull();
  });

  it('disables action button when action is download without url', async () => {
    const page = await newSpecPage({
      components: [IrPreviewScreenDialog],
      html: `<ir-preview-screen-dialog action="download"></ir-preview-screen-dialog>`,
    });

    const actionButton = page.root.shadowRoot.querySelector('ir-custom-button');
    expect(actionButton.getAttribute('disabled')).toBe('');
  });

  it('executes print action via triggerAction', async () => {
    const mockPrint = jest.fn();
    (window as any).print = mockPrint;

    const page = await newSpecPage({
      components: [IrPreviewScreenDialog],
      html: `<ir-preview-screen-dialog></ir-preview-screen-dialog>`,
    });

    const result = await page.rootInstance.triggerAction('print');
    expect(result).toBe(true);
    expect(mockPrint).toHaveBeenCalled();
  });

  it('executes download action via triggerAction when url supplied', async () => {
    const page = await newSpecPage({
      components: [IrPreviewScreenDialog],
      html: `<ir-preview-screen-dialog></ir-preview-screen-dialog>`,
    });

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const result = await page.rootInstance.triggerAction('download', 'https://example.com/sample.pdf');

    expect(result).toBe(true);
    expect(appendSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
  });
});
