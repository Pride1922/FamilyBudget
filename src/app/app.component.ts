import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service'; 

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

  constructor(private authService: AuthService, private router: Router,  private translate: TranslateService) {
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

  ngOnInit(): void {
    this.checkTokenValidity();
  }

  checkTokenValidity(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      // Add any additional logic if needed
    }
  }

  checkRoute(url: string) {
    const loginRoute = '/login';
    this.isLoginPage = (url === loginRoute);
    this.hideHeader = this.isLoginPage;
    this.hideSidebar = this.isLoginPage;
  }
}
