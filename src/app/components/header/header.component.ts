import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private authService: AuthService, private router: Router, private translate: TranslateService) {}

  toggleSidebar(): void {
    // Implement sidebar toggle logic if needed
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
