import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import { FileRejectReason } from '../ir-image-upload/ir-image-upload';

@Component({
  tag: 'ir-brand-uploader',
  styleUrl: 'ir-brand-uploader.css',
  shadow: true,
})
export class IrBrandUploader {
  @Element() el: HTMLIrBrandUploaderElement;

  @Prop() src: string;
  /** Fired whenever the list of selected files changes. */
  @Event() filesSelected: EventEmitter<File[]>;

  /** Fired when a file is rejected due to type, size, or exceeding the limit. */
  @Event() fileRejected: EventEmitter<{ fileName: string; reason: FileRejectReason }>;

  @Watch('src')
  handleSourceChange(newSource: string, oldSource: string) {
    if (newSource === oldSource) {
      return;
    }
    console.log(newSource);
    this.el.style.setProperty('--ir-uploader-img', `url("${newSource}")`);
  }

  render() {
    return (
      <Host>
        <ir-image-upload
          data-has-image={this.src ? 'true' : 'false'}
          class="brand-uploader__image-upload"
          maxFiles={1}
          onFilesSelected={event => {
            event.stopImmediatePropagation();
            event.stopPropagation();
            this.filesSelected.emit(event.detail);
          }}
          onFileRejected={event => {
            event.stopImmediatePropagation();
            event.stopPropagation();
            console.warn('Logo upload rejected', event.detail);
            this.fileRejected.emit(event.detail);
          }}
        ></ir-image-upload>
      </Host>
    );
  }
}
