import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedInUser$: Observable<any>;

  constructor(private authService: AuthService) {
    this.loggedInUser$ = this.authService.loggedInUser;
  }

  ngOnInit(): void {
  }
}
