import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { navbarData } from './nav-data';
import { INavbarData } from './helper';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  collapsed = false;
  multiple = false;
  navData: INavbarData[] = navbarData;

  @Output() toggleSidebar = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.toggleSidebar.emit(this.collapsed); // Emit the sidebar collapsed state
    const sidenav = document.querySelector('.sidenav') as HTMLElement;
    if (this.collapsed) {
      sidenav.classList.add('sidenav-collapsed');
    } else {
      sidenav.classList.remove('sidenav-collapsed');
    }
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.toggleSidebar.emit(this.collapsed); // Ensure sidebar is opened
    const sidenav = document.querySelector('.sidenav') as HTMLElement;
    sidenav.classList.remove('sidenav-collapsed');
  }

  handleClick(item: INavbarData): void {
    item.expanded = !item.expanded; // Toggle the expanded state
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

  changeLanguage(language: string): void {
    this.translate.use(language);
    localStorage.setItem('language', language);
  }

  handleLanguageClick(routeLink: string): void {
    const language = routeLink.split('/')[2];
    this.changeLanguage(language);
  }
}
