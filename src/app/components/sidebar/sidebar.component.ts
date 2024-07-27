import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { navbarData } from './nav-data';
import { INavbarData } from './helper';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  multiple = false;
  navData: INavbarData[] = navbarData;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void { }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    const sidenav = document.querySelector('.sidenav') as HTMLElement;
    if (this.collapsed) {
      sidenav.classList.add('sidenav-collapsed');
    } else {
      sidenav.classList.remove('sidenav-collapsed');
    }
  }

  closeSidenav(): void {
    this.collapsed = false;
    const sidenav = document.querySelector('.sidenav') as HTMLElement;
    sidenav.classList.remove('sidenav-collapsed');
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

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
