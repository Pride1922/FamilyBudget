import { Component, OnInit } from '@angular/core';
import {  navbarData } from './nav-data';
import {INavbarData} from './helper';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  multiple = false;
  navData: INavbarData[] = navbarData;

  constructor() { }

  ngOnInit(): void { }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    const sidenav = document.querySelector('.sidenav') as HTMLElement;
    if (this.collapsed) {
      sidenav.classList.add('collapsed');
    } else {
      sidenav.classList.remove('collapsed');
    }
  }

  closeSidenav(): void {
    this.collapsed = false;
    const sidenav = document.querySelector('.sidenav') as HTMLElement;
    sidenav.classList.remove('collapsed');
  }

  handleClick(item: INavbarData): void {
    if (!this.multiple) {
      this.navData.forEach(i => {
        if (i !== item) {
          i.expanded = false;
        }
      });
    }
    item.expanded = !item.expanded;
  }

  getActiveClass(item: INavbarData): string {
    return item.expanded ? 'active' : '';
  }

  shrinkItems(item: INavbarData): void {
    this.navData.forEach(i => {
      if (i !== item) {
        i.expanded = false;
      }
    });
  }
}
