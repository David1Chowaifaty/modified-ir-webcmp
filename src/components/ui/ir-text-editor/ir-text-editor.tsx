import { Component, h, Element, Event, EventEmitter, Host, Prop, Watch } from '@stencil/core';
import {
  ClassicEditor,
  AccessibilityHelp,
  Autoformat,
  AutoLink,
  Autosave,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  SelectAll,
  TextTransformation,
  Undo,
  Underline,
  PageBreak,
  Enter,
  EditorConfig,
  GeneralHtmlSupport,
  ShiftEnter,
  SourceEditing,
  FullPage,
  PluginConstructor,
  ToolbarConfigItem,
} from 'ckeditor5';
@Component({
  tag: 'ir-text-editor',
  styleUrl: 'ir-text-editor.css',
  shadow: false,
})
export class IrTextEditor {
  @Element() el: HTMLElement;
  @Prop() value: string;
  @Prop() error: boolean;
  @Prop() placeholder: string;

  @Prop() plugins: (string | PluginConstructor)[] = [];
  @Prop() pluginsMode: 'replace' | 'add' = 'add';
  @Prop() toolbarItems: ToolbarConfigItem[] = [];
  @Prop() toolbarItemsMode: 'replace' | 'add' = 'add';

  @Event() textChange: EventEmitter<string>;

  private editorInstance: ClassicEditor;
  private baseToolbarItems: ToolbarConfigItem[] = ['undo', 'redo', '|', 'sourceEditing', '|', 'bold', 'italic', 'underline'];
  private basePlugins: (string | PluginConstructor)[] = [
    SourceEditing,
    GeneralHtmlSupport,
    AccessibilityHelp,
    Autoformat,
    AutoLink,
    Autosave,
    Bold,
    Underline,
    PageBreak,
    Essentials,
    Enter,
    Italic,
    Paragraph,
    SelectAll,
    TextTransformation,
    Undo,
    ShiftEnter,
    FullPage,
  ];
  componentDidLoad() {
    this.initEditor();
  }

  @Watch('value')
  onValueChanged(newValue: string) {
    if (this.editorInstance) {
      const currentEditorValue = this.editorInstance.getData();
      if (newValue !== currentEditorValue) {
        this.editorInstance.setData(newValue);
      }
    }
  }
  @Watch('error')
  onErrorChanged(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      const editorElement = this.el.querySelector('.ck-content') as HTMLDivElement;
      if (editorElement) {
        console.log('first');
        editorElement.classList.toggle('error', newValue);
      }
    }
  }

  async initEditor() {
    const plugins = this.pluginsMode === 'replace' ? this.plugins : this.basePlugins.concat(this.plugins);
    const items = this.toolbarItemsMode === 'replace' ? this.toolbarItems : this.baseToolbarItems.concat(this.toolbarItems);
    const editorConfig: EditorConfig = {
      toolbar: {
        items,
        shouldNotGroupWhenFull: false,
      },
      plugins,
      initialData: this.value,
      htmlSupport: {
        allow: [
          {
            name: /^(b|strong|br|p)$/,
            attributes: true,
            classes: true,
            styles: true,
          },
        ],
      },
      // licenseKey: '',
      placeholder: this.placeholder,
    };

    if (this.editorInstance) {
      return;
    }

    const editorElement = this.el.querySelector('#editor') as HTMLDivElement;

    try {
      this.editorInstance = await ClassicEditor.create(editorElement, editorConfig);
      this.editorInstance.editing.view.document.on('clipboardInput', (evt, data) => {
        const textData = data.dataTransfer.getData('text/plain');
        const htmlRegex = /<\/?[a-z][\s\S]*>/i;

        if (htmlRegex.test(textData)) {
          // Process the text containing HTML tags
          const fragment = this.editorInstance.data.htmlProcessor.toView(textData);
          data.content = fragment;

          // Prevent the default handling
          evt.stop();

          // Fire the 'inputTransformation' event manually
          this.editorInstance.plugins.get('ClipboardPipeline').fire('inputTransformation', { content: fragment });
        }
      });
      this.editorInstance.model.document.on('change:data', () => {
        const editorData = this.editorInstance.getData();
        this.handletextChange(editorData);
      });
      this.editorInstance.plugins.get('Enter').fire('');
    } catch (error) {
      console.error('There was a problem initializing the editor:', error);
    }
  }
  handletextChange(data: string) {
    this.textChange.emit(data);
  }

  disconnectedCallback() {
    if (this.editorInstance) {
      this.editorInstance.destroy().catch((error: any) => {
        console.error('Error destroying editor:', error);
      });
    }
  }

  render() {
    return (
      <Host>
        <div id="editor"></div>
      </Host>
    );
  }
}
