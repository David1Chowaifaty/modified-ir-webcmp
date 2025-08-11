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

  @Event({ eventName: 'link-clicked' }) linkClicked: EventEmitter<MouseEvent>;

  private Icon({ name }: { name: string }) {
    return [<i class={name}></i>];
  }
  render() {
    const isSheet = this.location === 'sheet';
    if (isSheet) {
      return (
        <ul class="mobile-nav-items accordion" id="mainMenuNavigation">
          {this.pages.map(page => {
            const id = page.id ?? v4();
            if (page.subMenus) {
              const _collapseId = `collapse-${page.label.toLowerCase()}`;
              return (
                <li key={id} id={id} class={`mobile-nav-item ${page.className}`}>
                  <button
                    class="btn mobile-nav-link menu-icon-container justify-content-between"
                    style={{ width: '100%' }}
                    data-toggle="collapse"
                    data-parent="#mainMenuNavigation"
                    aria-expanded="false"
                    data-target={`#${_collapseId}`}
                    aria-controls={_collapseId}
                  >
                    <div class={'menu-icon-container'}>
                      {page.icon && this.Icon({ name: page.icon })}
                      <span>{page.label}</span>
                    </div>
                    <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
                      {page.isNew && <span class="new-badge">new</span>}
                      <ir-icons name="angle-down"></ir-icons>
                    </div>
                  </button>
                  <ul class="collapse " id={_collapseId}>
                    {page.subMenus.map(submenu => {
                      const menuId = submenu.id ?? v4();
                      return (
                        <li key={menuId} id={menuId} class={`mobile-nav-item menu-icon-container ${submenu.className ?? ''}`} style={{ width: '100%' }}>
                          <a onClick={e => this.linkClicked.emit(e)} class="mobile-nav-link w-100" href={submenu.href}>
                            <div class="menu-icon-container">
                              {submenu.icon && this.Icon({ name: submenu.icon })}
                              <span>{submenu.label}</span>
                            </div>
                            {submenu.isNew && <span class="new-badge">new</span>}
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
                  <div class="menu-icon-container">
                    {page.icon && this.Icon({ name: page.icon })}
                    <span>{page.label}</span>
                  </div>
                  {page.isNew && <span class="new-badge">new</span>}
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
                <button class="btn dropdown-toggle menu-icon-container navigation-link " data-toggle="dropdown">
                  <div class="menu-icon-container">
                    {page.icon && this.Icon({ name: page.icon })}
                    <span>{page.label}</span>
                  </div>
                  {page.isNew && <span class="new-badge">new</span>}
                </button>
                <ul class="dropdown-menu ">
                  {page.subMenus.map(submenu => {
                    const menuId = submenu.id ?? v4();
                    return (
                      <li key={menuId} id={menuId} class={`navigation-item ${submenu.className ?? ''}`}>
                        <a onClick={e => this.linkClicked.emit(e)} class="dropdown-item menu-icon-container" href={submenu.href}>
                          <div class="menu-icon-container">
                            {submenu.icon && this.Icon({ name: submenu.icon })}
                            <span>{submenu.label}</span>
                          </div>
                          {submenu.isNew && <span class="new-badge">new</span>}
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
                <div class="menu-icon-container">
                  {page.icon && this.Icon({ name: page.icon })}
                  <span>{page.label}</span>
                </div>
                {page.isNew && <span class="new-badge">new</span>}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
}
