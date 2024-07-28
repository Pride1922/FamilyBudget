import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/register/register.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MFASetupComponent } from './components/mfasetup/mfasetup.component';
import { AuthGuard } from './guards/auth.guard';
import { CategoriesComponent } from './components/categories/categories.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { MerchantsComponent } from './components/merchants/merchants.component';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'reset-password', component: PasswordResetComponent },
  {
    path: 'manage-users',
    component: ManageUsersComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' }
  },
  { path: 'profile', component: ProfileComponent },
  { path: 'mfa-setup', component: MFASetupComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'merchants', component: MerchantsComponent },
  { path: '**', redirectTo: '' } // Redirect any other route to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
