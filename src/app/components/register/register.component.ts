import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  token: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  passwordMatchValidator(frm: FormGroup) {
    return frm.get('password')?.value === frm.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  register(): void {
    if (this.registrationForm.valid && this.token) {
      const { email, username, password } = this.registrationForm.value;
      this.authService.registerUser(email, username, password, this.token).subscribe(
        response => {
          this.successMessage = 'Registration successful';
          setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect to login after 2 seconds
        },
        error => {
          this.errorMessage = error.error.message || 'Registration failed';
        }
      );
    } else {
      this.errorMessage = 'Please fill out the form correctly';
    }
  }
}
