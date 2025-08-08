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
    if (isSheet) {
      return (
        <ul class="mobile-nav-items accordion">
          {this.pages.map(page => {
            const id = page.id ?? v4();
            if (page.subMenus) {
              const _collapseId = `collapse-${page.label.toLowerCase()}`;
              return (
                <li key={id} id={id} class={`mobile-nav-item ${page.className}`}>
                  <button
                    class="btn mobile-nav-link d-flex align-items-center justify-content-between"
                    style={{ width: '100%' }}
                    data-toggle="collapse"
                    data-parent="#mainMenuNavigation"
                    aria-expanded="false"
                    data-target={`#${_collapseId}`}
                    aria-controls={_collapseId}
                  >
                    <span>
                      {page.icon && <i class={page.icon}></i>}
                      <span>{page.label}</span>
                    </span>
                    <ir-icons name="angle-down"></ir-icons>
                  </button>
                  <ul class="collapse " id={_collapseId}>
                    {page.subMenus.map(submenu => {
                      const menuId = submenu.id ?? v4();
                      return (
                        <li key={menuId} id={menuId} class={`mobile-nav-item ${submenu.className ?? ''}`}>
                          <a onClick={e => this.linkClicked.emit(e)} class="mobile-nav-link" href={submenu.href}>
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
              <li key={id} id={id} class={`${page.className ?? ''}  mobile-nav-item`}>
                <a href={page.href} onClick={e => this.linkClicked.emit(e)} class="mobile-nav-link">
                  {page.icon && <i class={page.icon}></i>}
                  <span>{page.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      );
    }
    return (
      <ul class="navigation-items">
        {this.pages.map(page => {
          const id = page.id ?? v4();
          if (page.subMenus) {
            return (
              <li
                key={id}
                id={id}
                onMouseEnter={e => {
                  if (window.innerWidth < 765) {
                    return;
                  }
                  (e.target as HTMLLIElement).classList.add('show');
                }}
                onMouseLeave={e => {
                  if (window.innerWidth < 765) {
                    return;
                  }
                  (e.target as HTMLLIElement).classList.remove('show');
                }}
                data-menu="dropdown"
                class={`dropdown  navigation-item ac-menu-dropdown ${isSheet ? 'mobile-nav-item' : ''} ${page.className}`}
              >
                <a class="dropdown-toggle navigation-link" href="#" data-toggle="dropdown">
                  {page.icon && <i class={page.icon}></i>}
                  <span>{page.label}</span>
                </a>
                <ul class="dropdown-menu ">
                  {page.subMenus.map(submenu => {
                    const menuId = submenu.id ?? v4();
                    return (
                      <li key={menuId} id={menuId} class={`navigation-item ${submenu.className ?? ''}`}>
                        <a onClick={e => this.linkClicked.emit(e)} class="dropdown-item" href={submenu.href}>
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
