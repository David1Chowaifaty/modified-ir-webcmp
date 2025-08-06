import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import { v4 } from 'uuid';
interface ACPage {
  label: string;
  href: string;
  id?: string;
  isNew?: boolean;
  className?: string;
  icon?: string;
}
export interface ACPages extends ACPage {
  subMenus?: ACPage[];
}
@Component({
  tag: 'ac-pages-menu',
  styleUrl: 'ac-pages-menu.css',
  shadow: false,
})
export class AcPagesMenu {
  @Prop() pages: ACPages[] = [];
  @Prop() location: 'sheet' | 'nav' = 'nav';

  @Event() linkClicked: EventEmitter<MouseEvent>;

  render() {
    const isSheet = this.location === 'sheet';
    return (
      <ul class="navigation-items" id="main-menu-navigation" data-menu="menu-navigation">
        {this.pages.map(page => {
          const id = page.id ?? v4();
          if (page.subMenus) {
            return (
              <li key={id} id={id} data-menu="dropdown" class={`dropdown navigation-item ac-menu-dropdown ${isSheet ? 'mobile-nav-item' : ''} ${page.className}`}>
                <a class="dropdown-toggle navigation-link" href="#" data-toggle="dropdown">
                  {page.icon && <i class={page.icon}></i>}
                  <span>{page.label}</span>
                </a>
                <ul class="dropdown-menu">
                  {page.subMenus.map(submenu => {
                    const menuId = submenu.id ?? v4();
                    return (
                      <li key={menuId} id={menuId} class={`navigation-item ${submenu.className ?? ''}`}>
                        <a onClick={e => this.linkClicked.emit(e)} class="dropdown-item" href={submenu.href} data-toggle="dropdown">
                          {submenu.icon && <i class={submenu.icon}></i>}
                          <span>{submenu.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          }
          return (
            <li key={id} id={id} class={`${page.className ?? ''}  navigation-item`}>
              <a href={page.href} onClick={e => this.linkClicked.emit(e)} class={`navigation-link`}>
                {page.icon && <i class={page.icon}></i>}
                <span>{page.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
}
