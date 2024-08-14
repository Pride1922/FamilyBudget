import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MerchantsService } from '../../services/merchants.service';
import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { Merchant } from '../../models/merchants.model';
import { Category } from '../../models/category.model';
import { Subcategory } from '../../models/subcategory.model';

@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.css']
})
export class MerchantsComponent implements OnInit {
  @Input() sidebarCollapsed: boolean = false; // Input to track sidebar state

  merchants: Merchant[] = [];
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  currentMerchant: Merchant = this.resetCurrentMerchant();
  isEditMode: boolean = false;
  merchantForm: FormGroup;
  displayedColumns: string[] = ['id', 'name', 'category', 'subcategory', 'address', 'phone', 'email', 'website', 'actions'];
  isSaving: boolean = false; // Flag to track saving state

  constructor(
    private merchantsService: MerchantsService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private fb: FormBuilder,
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {
    this.merchantForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      category_id: [null, Validators.required],
      subcategory_id: [null],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      website: ['']
    });

    this.merchantForm.get('category_id')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.loadSubcategories(categoryId);
      } else {
        this.subcategories = [];
      }
    });
  }

  ngOnInit(): void {
    this.loadMerchants();
    this.loadCategories();
    this.loadAllSubcategories(); // Load all subcategories on init
  }

  ngOnChanges(): void {
    this.updateLayout();
  }

  loadMerchants(): void {
    this.merchantsService.getMerchants().subscribe(
      data => this.merchants = data,
      error => console.error('Failed to load merchants', error)
    );
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      categories => this.categories = categories,
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

  loadAllSubcategories(): void {
    this.subcategoryService.getAllSubcategories().subscribe(
      subcategories => this.subcategories = subcategories,
      error => console.error('Failed to load all subcategories', error)
    );
  }

  saveMerchant(): void {
    if (this.merchantForm.valid) {
      const merchantData = this.merchantForm.value;

      // Disable the form submission button to prevent multiple clicks
      this.isSaving = true;

      if (this.isEditMode) {
        if (merchantData.id !== undefined) {
          this.merchantsService.updateMerchant(merchantData).subscribe(
            () => {
              this.loadMerchants();
              this.resetForm();
              this.snackBar.showSuccess(this.translate.instant('MERCHANTS.MERCHANT_UPDATED'));
            },
            error => {
              console.error('Failed to update merchant', error);
              this.snackBar.showError(this.translate.instant('MERCHANTS.UPDATE_FAILED'));
              this.isSaving = false; // Enable the form submission button on error
            },
            () => {
              this.isSaving = false; // Enable the form submission button on completion
            }
          );
        }
      } else {
        this.merchantsService.addMerchant(merchantData).subscribe(
          () => {
            this.loadMerchants();
            this.resetForm();
            this.snackBar.showSuccess(this.translate.instant('MERCHANTS.MERCHANT_ADDED'));
          },
          error => {
            console.error('Failed to add merchant', error);
            this.snackBar.showError(this.translate.instant('MERCHANTS.ADD_FAILED'));
            this.isSaving = false; // Enable the form submission button on error
          },
          () => {
            this.isSaving = false; // Enable the form submission button on completion
          }
        );
      }
    } else {
      this.merchantForm.markAllAsTouched();
    }
  }

  editMerchant(merchant: Merchant): void {
    this.currentMerchant = { ...merchant };
    this.isEditMode = true;
    this.merchantForm.patchValue(merchant);
    if (merchant.category_id) {
      this.loadSubcategories(merchant.category_id);
    }
  }

  deleteMerchant(id: number | undefined): void {
    if (id !== undefined) {
      this.merchantsService.deleteMerchant(id).subscribe(
        () => {
          this.loadMerchants();
          this.snackBar.showSuccess(this.translate.instant('MERCHANTS.MERCHANT_DELETED'));
        },
        error => {
          console.error('Failed to delete merchant', error);
          this.snackBar.showError(this.translate.instant('MERCHANTS.DELETE_FAILED'));
        }
      );
    }
  }

  resetForm(): void {
    this.currentMerchant = this.resetCurrentMerchant();
    this.isEditMode = false;
    this.merchantForm.reset();
    this.subcategories = [];
  }

  private resetCurrentMerchant(): Merchant {
    return {
      id: undefined,
      name: '',
      category_id: undefined,
      subcategory_id: undefined,
      address: '',
      phone: '',
      email: '',
      website: ''
    };
  }

  getCategoryNameById(id: number | undefined): string {
    const category = this.categories.find(c => c.id === id);
    return category ? category.name : '';
  }

  getSubcategoryNameById(id: number | undefined): string {
    const subcategory = this.subcategories.find(s => s.id === id);
    return subcategory ? subcategory.name : '';
  }

  updateLayout(): void {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (this.sidebarCollapsed) {
      mainContent.style.marginLeft = '5rem';  // Adjust for collapsed sidebar
    } else {
      mainContent.style.marginLeft = '16.5625rem';  // Adjust for expanded sidebar
    }
  }
}
