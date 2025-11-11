import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import { FileRejectReason } from '../ir-image-upload/ir-image-upload';

@Component({
  tag: 'ir-brand-uploader',
  styleUrl: 'ir-brand-uploader.css',
  shadow: true,
})
export class IrBrandUploader {
  @Element() el: HTMLIrBrandUploaderElement;

  /** Source URL of the uploaded image (logo or favicon). */
  @Prop() src: string;
  /**
   * Comma separated list of accepted mime types or file extensions.
   * Defaults to the most common image formats.
   */
  @Prop() accept: string = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

  /** Max file size in bytes. Default is 10MB. */
  @Prop() maxFileSize = 10 * 1024 * 1024;

  /** Fired whenever the list of selected files changes. */
  @Event() filesSelected: EventEmitter<File[]>;

  /** Fired when a file is rejected due to type, size, or exceeding the limit. */
  @Event() fileRejected: EventEmitter<{ fileName: string; reason: FileRejectReason }>;

  @Watch('src')
  handleSourceChange(newSource: string, oldSource: string) {
    if (newSource === oldSource) {
      return;
    }
    this.el.style.setProperty('--ir-uploader-img', `url("${newSource}")`);
  }

  render() {
    return (
      <Host>
        <ir-image-upload
          maxFileSize={this.maxFileSize}
          accept={this.accept}
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
