import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FamilyBudget';
  hideHeader = false;
  hideSidebar = false;
  isLoginPage = false;

  constructor(private router: Router, private translate: TranslateService) {
    // Retrieve the language preference from localStorage
    const language = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(language);
    this.translate.use(language);

    // Subscribe to router events to determine if the current route is login
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRoute(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit() {}

  checkRoute(url: string) {
    const loginRoute = '/login';
    this.isLoginPage = (url === loginRoute);
    this.hideHeader = this.isLoginPage;
    this.hideSidebar = this.isLoginPage;
  }
}
