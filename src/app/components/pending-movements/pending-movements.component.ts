import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { MerchantsService } from '../../services/merchants.service';
import { CategoryService } from '../../services/category.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { CsvDataService } from '../../services/csv-data.service';
import { Merchant } from '../../models/merchants.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-pending-movements',
  templateUrl: './pending-movements.component.html',
  styleUrls: ['./pending-movements.component.css']
})
export class PendingMovementsComponent implements OnInit {
  @Input() sidebarCollapsed: boolean = false;

  pendingMovements: any[] = [];
  merchants: Merchant[] = [];
  categories: Category[] = [];
  subcategories: any[] = []; // Hold subcategories for the selected category
  isLoading = false; // Loading state for spinner

  constructor(
    private merchantsService: MerchantsService,
    private categoryService: CategoryService,
    private snackBar: SnackbarService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private csvDataService: CsvDataService
  ) {}

  ngOnInit(): void {
    this.isLoading = true; // Force spinner to show on component load
    this.loadMerchants();
    this.loadCategories();
    this.loadPendingMovements();
  }

  loadPendingMovements(): void {
    this.isLoading = true;
    this.csvDataService.getPendingMovements().subscribe(
      data => {
        this.pendingMovements = Array.isArray(data) ? data : []; // Ensure it's an array
        this.isLoading = false;
      },
      error => {
        console.error('Failed to load pending movements', error);
        this.isLoading = false;
        this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.LOAD_ERROR'));
      }
    );
  }

  loadMerchants(): void {
    this.merchantsService.getMerchants().subscribe(
      data => this.merchants = Array.isArray(data) ? data : [], // Ensure it's an array
      error => console.error('Failed to load merchants', error)
    );
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      categories => this.categories = Array.isArray(categories) ? categories : [], // Ensure it's an array
      error => console.error('Failed to load categories', error)
    );
  }

  loadSubcategories(categoryId: number): void {
    this.categoryService.getCategoryById(categoryId).subscribe(
      category => {
        try {
          // Check if subcategories is a string and parse it
          if (typeof category.subcategories === 'string') {
            this.subcategories = JSON.parse(category.subcategories);
          } else {
            this.subcategories = Array.isArray(category.subcategories) ? category.subcategories : [];
          }
          console.log('Subcategories after parsing:', this.subcategories); // Debugging: Check the parsed subcategories
        } catch (error) {
          console.error('Failed to parse subcategories', error);
          this.subcategories = [];
        }
      },
      error => console.error('Failed to load subcategories', error)
    );
  }

  onCategoryChange(movement: any): void {
    const selectedCategory = this.categories.find(c => c.name === movement.category);
    console.log('Selected Category:', selectedCategory); // Debugging: Check the selected category
    if (selectedCategory && selectedCategory.id) {
      movement.subcategory = null; // Clear the subcategory when the category changes
      this.loadSubcategories(selectedCategory.id);
    }
  }

  validateMerchant(movement: any): void {
    const isMerchantValid = this.merchants.some(m => m.name === movement.merchant);
    if (!isMerchantValid) {
      this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.INVALID_MERCHANT'));
    }
  }

  validateCategory(movement: any): void {
    const isCategoryValid = this.categories.some(c => c.name === movement.category);
    if (!isCategoryValid) {
      this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.INVALID_CATEGORY'));
    }
  }

  validateSubcategory(movement: any): void {
    const isSubcategoryValid = this.subcategories.some(sc => sc.name === movement.subcategory);
    if (!isSubcategoryValid) {
      this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.INVALID_SUBCATEGORY'));
    }
  }

  isMatched(row: any): boolean {
    const isMerchantValid = this.merchants.some(m => m.name === row.merchant);
    const isCategoryValid = this.categories.some(c => c.name === row.category);
    const isSubcategoryValid = this.subcategories.some(sc => sc.name === row.subcategory);
    return isMerchantValid && isCategoryValid && isSubcategoryValid;
  }

  saveMovement(movement: any): void {
    if (this.isMatched(movement)) {
      this.snackBar.showSuccess(this.translate.instant('PENDING_MOVEMENTS.MOVEMENT_SAVED'));
    } else {
      this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.VALIDATION_FAILED'));
    }
  }

  deleteMovement(movement: any): void {
    this.snackBar.showSuccess(this.translate.instant('PENDING_MOVEMENTS.MOVEMENT_DELETED'));
  }

  approveMovement(movement: any): void {
    movement.status = 'approved'; // Mark the movement as approved
    this.csvDataService.updateMovement(movement.id, movement).subscribe(() => {
      this.snackBar.showSuccess(this.translate.instant('PENDING_MOVEMENTS.MOVEMENT_APPROVED'));
      this.loadPendingMovements(); // Reload the list after approval
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadCSV(file);
    }
  }

  uploadCSV(file: File): void {
    this.isLoading = true; // Start spinner
    this.cd.detectChanges(); // Ensure change detection

    this.csvDataService.uploadCSVFile(file, (loading: boolean) => {
      this.isLoading = loading; // Update spinner state
      this.cd.detectChanges(); // Ensure change detection
    }).subscribe(
      response => {
        this.snackBar.showSuccess(this.translate.instant('PENDING_MOVEMENTS.CSV_UPLOAD_SUCCESS'));
        this.isLoading = false; // Stop spinner after successful upload
        this.loadPendingMovements(); // Reload data after successful upload
        this.cd.detectChanges(); // Ensure change detection
      },
      error => {
        console.error('Error uploading CSV file:', error);
        this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.CSV_UPLOAD_ERROR'));
        this.isLoading = false; // Stop spinner on error
        this.cd.detectChanges(); // Ensure change detection
      }
    );
  }
}
