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
        toolbar: this.computedToolbar,
      },
      placeholder: this.placeholder,
      readOnly: !this.userCanEdit || this.readOnly,
      theme: 'snow',
    };
    this.editor = new Quill(this.editorContainer, options);
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
    return this.toolbarConfig ? buildToolbar(this.toolbarConfig) : [['bold', 'italic', 'underline', 'strike'], ['link'], ['clean']];
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
  render() {
    return (
      <div class={{ 'editor-wrapper': true, 'error': this.error }}>
        <div ref={el => (this.editorContainer = el as HTMLDivElement)} class="editor-container"></div>
      </div>
    );
  }
}
