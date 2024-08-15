import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  loggedInUser: any;
  isAdmin: boolean = false; // Add this property

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authService.loggedInUser.subscribe(user => {
      this.loggedInUser = user;
      this.isAdmin = this.loggedInUser && this.loggedInUser.role === 'admin'; // Set isAdmin
    });
  }

  toggleSidebar(): void {
    // Implement sidebar toggle logic if needed
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // New Methods for CSV Upload
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.validateAndUploadCSV(file);
    }
  }

  validateAndUploadCSV(file: File): void {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const csvData = reader.result as string;

      // Basic validation logic (to be expanded)
      if (this.isValidCSV(csvData)) {
        // Navigate to Pending Movements if valid
        this.router.navigate(['/pending-movements']);
      } else {
        alert('Invalid CSV file. Please upload a valid file.');
      }
    };
  }

  isValidCSV(csvData: string): boolean {
    // Split the CSV data into rows
    const rows = csvData.split('\n');

    // Get the headers from the first row
    const headers = rows[0].split(';');

    // Expected headers based on your CSV file
    const expectedHeaders = [
        'Rekeningnummer',
        'Naam van de rekening',
        'Rekening tegenpartij',
        'Omzetnummer',
        'Boekingsdatum',
        'Valutadatum',
        'Bedrag',
        'Munteenheid',
        'Omschrijving',
        'Detail van de omzet',
        'Bericht'
    ];

    // Check if all expected headers are present
    const isValid = expectedHeaders.every(header => headers.includes(header));

    // Provide user feedback
    if (isValid) {
        this.snackbarService.showSuccess(this.translate.instant('HEADER.CSV_VALIDATION.SUCCESS'));
    } else {
        this.snackbarService.showError(this.translate.instant('HEADER.CSV_VALIDATION.ERROR'));
    }

    return isValid;
}


}
