import { Component, OnInit, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MerchantsService } from '../../services/merchants.service';
import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { CsvDataService } from '../../services/csv-data.service';
import { Merchant } from '../../models/merchants.model';
import { Category } from '../../models/category.model';
import { Subcategory } from '../../models/subcategory.model';
import { AddMerchantDialogComponent } from '../add-merchant-dialog/add-merchant-dialog.component';

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
  subcategories: Subcategory[] = [];
  isLoading = false;

  constructor(
    private merchantsService: MerchantsService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private snackBar: SnackbarService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private csvDataService: CsvDataService,
    private dialog: MatDialog,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadMerchants();
    this.loadCategories();
    this.loadPendingMovements();
  }

  loadPendingMovements(): void {
    this.isLoading = true;
    this.csvDataService.getPendingMovements().subscribe(
      data => {
        this.pendingMovements = Array.isArray(data) ? data : [];
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
      data => this.merchants = Array.isArray(data) ? data : [],
      error => console.error('Failed to load merchants', error)
    );
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      categories => this.categories = Array.isArray(categories) ? categories : [],
      error => console.error('Failed to load categories', error)
    );
  }

  loadSubcategories(categoryId: number): void {
    this.subcategoryService.getSubcategoriesByCategoryId(categoryId).subscribe(
      (subcategories: Subcategory[]) => {
        this.subcategories = subcategories;
      },
      error => console.error('Failed to load subcategories', error)
    );
  }

  openAddMerchantDialog(): void {
    const dialogRef = this.dialog.open(AddMerchantDialogComponent, {
      width: '400px',
      data: { merchant: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.merchantsService.addMerchant(result).subscribe(
          (newMerchant: Merchant) => {
            this.merchants.push(newMerchant);
            this.snackBar.showSuccess(this.translate.instant('MERCHANTS.MERCHANT_ADDED'));
          },
          error => {
            this.snackBar.showError(this.translate.instant('MERCHANTS.ADD_FAILED'));
          }
        );
      }
    });
  }

  validateMerchant(movement: any): void {

    const selectedMerchant = this.merchants.find(m => m.name === movement.merchant);

    if (selectedMerchant) {
        movement.category_id = selectedMerchant.category_id;
        movement.subcategory_id = selectedMerchant.subcategory_id;

        if (selectedMerchant.category_id !== undefined && selectedMerchant.category_id !== null) {
            const selectedCategory = this.categories.find(c => c.id === selectedMerchant.category_id);
            if (selectedCategory) {
                movement.category = selectedCategory.name;
                this.loadSubcategories(selectedCategory.id as number);

                if (selectedMerchant.subcategory_id !== undefined && selectedMerchant.subcategory_id !== null) {
                    this.subcategoryService.getSubcategoryById(selectedMerchant.subcategory_id as number).subscribe(
                        (subcategory: Subcategory) => {
                            movement.subcategory = subcategory.name;
                            this.cd.detectChanges(); // Force change detection to update the view immediately
                        },
                        error => console.error('Failed to load subcategory', error)
                    );
                } else {
                    movement.subcategory = null;
                    this.cd.detectChanges(); // Force change detection to update the view immediately
                }
            } else {
                movement.category = null;
                movement.subcategory = null;
                this.cd.detectChanges(); // Force change detection to update the view immediately
            }
        } else {
            movement.category = null;
            movement.subcategory = null;
            this.cd.detectChanges(); // Force change detection to update the view immediately
        }

        // this.snackBar.showSuccess(this.translate.instant('PENDING_MOVEMENTS.MERCHANT_VALID'));
    } else {
        this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.INVALID_MERCHANT'));
        movement.category = null;
        movement.subcategory = null;
        this.cd.detectChanges(); // Force change detection to update the view immediately
    }
}

  triggerChangeDetectionWithDelay(): void {
    setTimeout(() => {
      this.cd.detectChanges();
    }, 0);
  }

  onCategoryChange(movement: any): void {
    const selectedCategory = this.categories.find(c => c.name === movement.category);
    if (selectedCategory && selectedCategory.id) {
      movement.subcategory = null;
      this.loadSubcategories(selectedCategory.id);
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
    movement.status = 'approved';
    this.csvDataService.updateMovement(movement.id, movement).subscribe(() => {
      this.snackBar.showSuccess(this.translate.instant('PENDING_MOVEMENTS.MOVEMENT_APPROVED'));
      this.loadPendingMovements();
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadCSV(file);
    }
  }

  uploadCSV(file: File): void {
    this.isLoading = true;
    this.cd.detectChanges();

    this.csvDataService.uploadCSVFile(file, (loading: boolean) => {
      this.isLoading = loading;
      this.cd.detectChanges();
    }).subscribe(
      response => {
        this.snackBar.showSuccess(this.translate.instant('PENDING_MOVEMENTS.CSV_UPLOAD_SUCCESS'));
        this.isLoading = false;
        this.loadPendingMovements();
        this.cd.detectChanges();
      },
      error => {
        console.error('Error uploading CSV file:', error);
        this.snackBar.showError(this.translate.instant('PENDING_MOVEMENTS.CSV_UPLOAD_ERROR'));
        this.isLoading = false;
        this.cd.detectChanges();
      }
    );
  }
}
