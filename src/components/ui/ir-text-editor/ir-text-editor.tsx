import { Component, h, Element, Event, EventEmitter, Prop, Watch, State } from '@stencil/core';
import Quill, { QuillOptions } from 'quill';

export type QuillToolbarButton = 'bold' | 'italic' | 'underline' | 'strike' | 'link' | 'image' | 'video' | 'clean';

export interface ToolbarConfig {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  link?: boolean;
  image?: boolean;
  video?: boolean;
  clean?: boolean;
}

function buildToolbar(config: ToolbarConfig): any[] {
  const toolbar = [];
  const textFormats: string[] = [];
  if (config.bold) textFormats.push('bold');
  if (config.italic) textFormats.push('italic');
  if (config.underline) textFormats.push('underline');
  if (config.strike) textFormats.push('strike');
  if (textFormats.length) {
    toolbar.push(textFormats);
  }
  if (config.link) toolbar.push(['link']);
  if (config.image) toolbar.push(['image']);
  if (config.video) toolbar.push(['video']);
  if (config.clean) toolbar.push(['clean']);
  return toolbar;
}
@Component({
  tag: 'ir-text-editor',
  styleUrls: ['ir-text-editor.css', 'quill.snow.css'],
  shadow: false,
})
export class IrTextEditor {
  @Element() el: HTMLElement;

  @Prop() error: boolean;

  @Prop() maxLength: number;

  /** Initial HTML content */
  @Prop() value: string = '';

  /** If true, makes the editor read-only */
  @Prop() readOnly: boolean = false;

  /** Determines if the current user can edit the content */
  @Prop() userCanEdit: boolean = true;

  /** Placeholder text */
  @Prop() placeholder: string;

  /**
   * Type-safe toolbar configuration.
   * For example, you can pass:
   *
   * {
   *   bold: true,
   *   italic: true,
   *   underline: true,
   *   strike: false,
   *   link: true,
   *   clean: true
   * }
   */
  @Prop() toolbarConfig?: ToolbarConfig;

  /** Emits current HTML content whenever it changes */
  @Event() textChange: EventEmitter<string>;

  @State() editorValue = '';

  /** Private, non-reactive Quill editor instance */
  private editor: Quill;

  private editorContainer!: HTMLDivElement;

  componentDidLoad() {
    const options: QuillOptions = {
      modules: {
        toolbar: {
          container: this.computedToolbar,
          handlers: {
            undo: () => {
              if (this.editor) {
                this.editor.history.undo();
                this.updateHistoryButtons();
              }
            },
            redo: () => {
              if (this.editor) {
                this.editor.history.redo();
                this.updateHistoryButtons();
              }
            },
          },
        },
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true,
        },
      },
      placeholder: this.placeholder,
      readOnly: !this.userCanEdit || this.readOnly,
      theme: 'snow',
    };
    const icons = Quill.import('ui/icons');
    icons['undo'] =
      '<svg title="undo" xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 512 512"><path class="ql-fill" d="M48.5 224L40 224c-13.3 0-24-10.7-24-24L16 72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8L48.5 224z" /></svg>'; // Replace '...' with actual SVG path
    icons['redo'] =
      '<svg title="redo" xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 512 512"><path class="ql-fill" d="M463.5 224l8.5 0c13.3 0 24-10.7 24-24l0-128c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8l119.5 0z"/></svg>';
    this.editor = new Quill(this.editorContainer, options);
    (this.editor.getModule('toolbar') as any).addHandler('undo', () => {
      this.editor.history.undo();
    });
    (this.editor.getModule('toolbar') as any).addHandler('redo', () => {
      this.editor.history.redo();
    });
    if (this.value) {
      this.setEditorValue(this.value);
    }
    this.editor.on('text-change', (_, __, source) => {
      if (source === 'user' && this.maxLength) {
        const plainText = this.editor.getText();
        const effectiveLength = plainText.endsWith('\n') ? plainText.length - 1 : plainText.length;
        if (effectiveLength > this.maxLength) {
          const excess = effectiveLength - this.maxLength;
          this.editor.deleteText(this.maxLength, excess, 'user');
          return;
        }
      }
      const html = this.editor.root.innerHTML;
      this.editorValue = html;
      this.textChange.emit(html);
    });
  }

  @Watch('value')
  handleValueChange(newValue: string, oldValue: string) {
    if (!newValue) {
      this.setEditorValue(newValue);
      return;
    }
    if (newValue !== oldValue && newValue !== this.editorValue) {
      this.setEditorValue(newValue);
    }
  }
  @Watch('readOnly')
  onReadOnlyChange(newVal: boolean) {
    if (this.editor) {
      this.editor.enable(this.userCanEdit && !newVal);
    }
  }

  @Watch('userCanEdit')
  onUserCanEditChange(newVal: boolean) {
    if (this.editor) {
      this.editor.enable(newVal && !this.readOnly);
    }
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor = null;
    }
  }
  private get computedToolbar() {
    return this.toolbarConfig ? buildToolbar(this.toolbarConfig) : [[{ undo: 'ql-undo' }, { redo: 'ql-redo' }], ['bold', 'italic', 'underline', 'strike'], ['link'], ['clean']];
  }
  private setEditorValue(value: string) {
    if (!this.editor) {
      return;
    }
    this.editor.clipboard.dangerouslyPasteHTML(value);
    requestAnimationFrame(() => {
      const length = this.editor.getLength();
      this.editor.setSelection(length - 1, 0);
    });
  }
  private updateHistoryButtons() {
    const undoButton = this.el.querySelector('.ql-undo') as HTMLButtonElement;
    const redoButton = this.el.querySelector('.ql-redo') as HTMLButtonElement;
    if (!this.editor) return;

    // Disable undo if there is no undo history
    if (this.editor.history.stack.undo.length === 0) {
      undoButton && (undoButton.disabled = true);
    } else {
      undoButton && (undoButton.disabled = false);
    }

    // Disable redo if there is no redo history
    if (this.editor.history.stack.redo.length === 0) {
      redoButton && (redoButton.disabled = true);
    } else {
      redoButton && (redoButton.disabled = false);
    }
  }
  render() {
    return (
      <div class={{ 'editor-wrapper': true, 'error': this.error }}>
        <div ref={el => (this.editorContainer = el as HTMLDivElement)} class="editor-container"></div>
      </div>
    );
  }
}
