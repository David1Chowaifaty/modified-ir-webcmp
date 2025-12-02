import { Component, Prop, State, Watch } from '@stencil/core';
import { IrOnlineResource } from '../../common/models';
import { onlineResources } from '../../common/ir.common.resources';

@Component({
  tag: 'ir-common',
  styleUrl: '../../global/app.css',
  shadow: false,
})
export class IrCommon {
  @Prop({ reflect: true }) extraResources: string = '';
  @State() resources: IrOnlineResource[] = onlineResources;
  componentWillLoad() {
    this.parseRefs();
  }

  componentDidLoad() {
    this.initializeStyles();
  }

  @Watch('extraResources')
  hrefsChanged() {
    this.parseRefs();
    this.initializeStyles();
  }

  private parseRefs() {
    if (this.extraResources !== '') this.resources.push(JSON.parse(this.extraResources));
  }

  private appendTag(tagName: string, attributes: any) {
    const tag = document.createElement(tagName);
    const selectorParts = [];

    Object.keys(attributes).forEach(attr => {
      tag.setAttribute(attr, attributes[attr]);
      selectorParts.push(`[${attr}="${attributes[attr]}"]`);
    });

    const selector = `${tagName}${selectorParts.join('')}`;
    const existingTag = document.querySelector(selector);

    if (!existingTag) {
      document.head.appendChild(tag);
    }
  }

  private initializeStyles() {
    this.resources.forEach(res => {
      if (res.isCSS) {
        this.appendTag('link', {
          href: res.link,
          rel: 'stylesheet',
          type: 'text/css',
        });
      }
      if (res.isJS) {
        this.appendTag('script', {
          src: res.link,
        });
      }
    });
  }

  render() {
    return null;
  }
}
