import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';

export type FileRejectReason = 'file-type' | 'file-size' | 'max-files';

@Component({
  tag: 'ir-image-upload',
  styleUrl: 'ir-image-upload.css',
  shadow: true,
})
export class IrImageUpload {
  @Element() host: HTMLIrImageUploadElement;

  /** Accessible label displayed above the dropzone. */
  @Prop() label: string;

  /** Helper text rendered beneath the dropzone. */
  @Prop() helperText: string;

  /** Extra message shown below the helper text (useful for accepted formats, size limits, etc.). */
  @Prop() footerText: string;

  /**
   * Comma separated list of accepted mime types or file extensions.
   * Defaults to the most common image formats.
   */
  @Prop() accept: string = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

  /** Max file size in bytes. Default is 10MB. */
  @Prop() maxFileSize = 10 * 1024 * 1024;

  /** Maximum number of files allowed. */
  @Prop() maxFiles = 1;

  /** Disables user interaction when true. */
  @Prop() disabled = false;

  /** When true, clears previously selected files whenever new files are chosen. */
  @Prop() replaceOnSelect = true;

  /** Optional pre-selected files. */
  @Prop({ mutable: true }) value: File[] = [];

  /** Optional label describing an existing uploaded resource. */
  @Prop() existingValueLabel: string;

  /** Fired whenever the list of selected files changes. */
  @Event() filesSelected: EventEmitter<File[]>;

  /** Fired when a file is rejected due to type, size, or exceeding the limit. */
  @Event() fileRejected: EventEmitter<{ fileName: string; reason: FileRejectReason }>;

  @State() isDragOver = false;
  @State() files: File[] = [];

  private fileInput?: HTMLInputElement;
  private inputId = `ir-image-upload-${Math.random().toString(36).slice(2)}`;

  componentWillLoad() {
    if (this.value?.length) {
      this.files = [...this.value];
    }
  }

  @Watch('value')
  watchValue(newValue: File[]) {
    this.files = Array.isArray(newValue) ? [...newValue] : [];
  }

  /** Clears all selected files. */
  @Method()
  async clear() {
    this.files = [];
    this.emitSelected();
    if (this.fileInput) {
      this.fileInput.value = '';
    }
  }

  private emitSelected() {
    this.filesSelected.emit(this.files);
  }

  private handleBrowseClick = () => {
    if (this.disabled) {
      return;
    }
    this.fileInput?.click();
  };

  private handleDrop = (event: DragEvent) => {
    event.preventDefault();
    if (this.disabled) {
      return;
    }
    this.isDragOver = false;
    if (event.dataTransfer?.files?.length) {
      this.ingestFiles(event.dataTransfer.files);
    }
  };

  private handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target?.files?.length) {
      this.ingestFiles(target.files);
    }
    if (target) {
      target.value = '';
    }
  };

  private ingestFiles(fileList: FileList) {
    const incoming = Array.from(fileList);
    const acceptedMimeTypes = this.accept
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const nextFiles = this.replaceOnSelect ? [] : [...this.files];

    for (const file of incoming) {
      if (nextFiles.length >= this.maxFiles) {
        this.fileRejected.emit({ fileName: file.name, reason: 'max-files' });
        continue;
      }
      if (this.maxFileSize && file.size > this.maxFileSize) {
        this.fileRejected.emit({ fileName: file.name, reason: 'file-size' });
        continue;
      }
      if (!this.isFileAccepted(file, acceptedMimeTypes)) {
        this.fileRejected.emit({ fileName: file.name, reason: 'file-type' });
        continue;
      }
      nextFiles.push(file);
    }

    this.files = nextFiles;
    this.value = [...this.files];
    this.emitSelected();
  }

  private isFileAccepted(file: File, acceptedMimeTypes: string[]) {
    if (!acceptedMimeTypes.length || acceptedMimeTypes.includes('*')) {
      return true;
    }

    const fileType = file.type;
    const fileExtension = file.name.includes('.') ? `.${file.name.split('.').pop().toLowerCase()}` : '';

    return acceptedMimeTypes.some(type => {
      if (type === '') {
        return false;
      }
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '').trim();
        return fileType.startsWith(`${baseType}/`);
      }
      return fileType === type;
    });
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleBrowseClick();
    }
  };

  private renderSelectedFiles() {
    if (!this.files.length) {
      return null;
    }

    return (
      <ul class="file-list">
        {this.files.map(file => (
          <li>
            <span class="file-name">{file.name}</span>
            <span class="file-size">{this.formatSize(file.size)}</span>
          </li>
        ))}
      </ul>
    );
  }

  private formatSize(bytes: number) {
    if (!bytes && bytes !== 0) {
      return '';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  render() {
    const maxSizeText = `${Math.round(this.maxFileSize / (1024 * 1024))}MB`;

    return (
      <Host>
        <div class={{ container: true, disabled: this.disabled }}>
          {this.label && (
            <label class="upload-label" htmlFor={this.inputId}>
              {this.label}
            </label>
          )}
          <div
            class={{
              dropzone: true,
              'is-dragging': this.isDragOver,
              disabled: this.disabled,
            }}
            role="button"
            tabindex={this.disabled ? -1 : 0}
            aria-disabled={this.disabled ? 'true' : 'false'}
            onClick={this.handleBrowseClick}
            onKeyDown={this.handleKeyDown}
            onDragEnter={event => {
              event.preventDefault();
              if (this.disabled) {
                return;
              }
              this.isDragOver = true;
            }}
            onDragOver={event => {
              event.preventDefault();
              if (this.disabled) {
                return;
              }
            }}
            onDragLeave={event => {
              event.preventDefault();
              if (this.disabled) {
                return;
              }
              if (event.currentTarget === event.target) {
                this.isDragOver = false;
              }
            }}
            onDrop={this.handleDrop}
          >
            <div class="dropzone-content">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="dropzone-icon">
                <path
                  d="M12 5a1 1 0 0 1 1 1v4h3l-4 5-4-5h3V6a1 1 0 0 1 1-1zm-7 9a3 3 0 0 1 3-3h1.09l1.2 1.5H8a1 1 0 0 0-1 1v4h10v-4a1 1 0 0 0-1-1h-2.3L14.91 11H16a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5z"
                  fill="currentColor"
                ></path>
              </svg>
              <p class="dropzone-title">Click to upload or drag and drop</p>
              <p class="dropzone-subtitle">{this.helperText || `PNG, JPG, GIF, WEBP up to ${maxSizeText}`}</p>
              {this.footerText && <p class="dropzone-footer">{this.footerText}</p>}
              {this.existingValueLabel && !this.files.length && <p class="existing-value">Current: {this.existingValueLabel}</p>}
            </div>
            <input
              ref={el => (this.fileInput = el)}
              id={this.inputId}
              type="file"
              accept={this.accept}
              multiple={this.maxFiles > 1 && !this.replaceOnSelect}
              onChange={this.handleInputChange}
              disabled={this.disabled}
            />
          </div>
          {this.renderSelectedFiles()}
        </div>
      </Host>
    );
  }
}
