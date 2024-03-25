import { Component, Prop, State, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-dropdown',
  styleUrl: 'ir-dropdown.css',
  scoped: true,
})
export class IrDropdown {
  @Prop({ reflect: true }) data: {
    name: string;
    icon: string;
    children: {
      name: string;
      icon: string;
    }[];
  } = null;
  @Prop({ reflect: true }) object: any = null;
  @State() show: boolean = false;

  @Event({ bubbles: true, composed: true }) dropdownItemCLicked: EventEmitter<{ name: string; object: any }>;
  render() {
    let content = null;
    if (this.data !== null) {
      content = (
        <li class={this.show ? 'dropdown nav-item show' : 'dropdown nav-item'} data-menu="dropdown">
          <a
            class="dropdown-toggle nav-link"
            onClick={() => {
              this.show = !this.show;
            }}
            data-toggle="dropdown"
          >
            <ir-icon icon={this.data.icon}></ir-icon>
            <span data-i18n="Dashboard" class="text-primary">
              {this.data.name}
            </span>
          </a>
          <ul class={this.show ? 'dropdown-menu show' : 'dropdown-menu'}>
            {this.data.children.map(child => {
              return (
                <li data-menu="">
                  <a
                    class="dropdown-item"
                    data-toggle=""
                    onClick={() => {
                      this.dropdownItemCLicked.emit({ name: child.name, object: this.object });
                      this.show = false;
                    }}
                  >
                    <ir-icon icon={child.icon}></ir-icon>
                    <span data-i18n={child.name}>{child.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </li>
      );
    }
    return (
      <ul class="nav navbar-nav" id="main-menu-navigation" data-menu="menu-navigation">
        {content}
      </ul>
    );
  }
}
