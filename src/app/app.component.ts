import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FamilyBudget';
  hideSidebar = false;

  constructor(private translate: TranslateService, private router: Router) {
    // Retrieve the language preference from localStorage
    const language = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(language);
    this.translate.use(language);

    // Subscribe to router events to check the current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.hideSidebar = this.router.url === '/login';
    });
  }

  ngOnInit() {}
}
