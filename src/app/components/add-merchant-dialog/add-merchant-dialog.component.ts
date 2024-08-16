import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MerchantsService } from '../../services/merchants.service';
import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { Merchant } from '../../models/merchants.model';
import { Category } from '../../models/category.model';
import { Subcategory } from '../../models/subcategory.model';

@Component({
  selector: 'app-add-merchant-dialog',
  templateUrl: './add-merchant-dialog.component.html',
  styleUrls: ['./add-merchant-dialog.component.css']
})
export class AddMerchantDialogComponent implements OnInit {
  merchantForm: FormGroup;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  isEditMode = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private merchantsService: MerchantsService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<AddMerchantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { merchant: Merchant }
  ) {
    this.merchantForm = this.fb.group({
      name: ['', Validators.required],
      category_id: [null, Validators.required],
      subcategory_id: [null, Validators.required],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      website: ['']
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data.merchant;

    if (this.isEditMode) {
      this.merchantForm.patchValue(this.data.merchant);
      if (this.data.merchant.category_id) {
        this.loadSubcategories(this.data.merchant.category_id);
      }
    }

    this.loadCategories();

    this.merchantForm.get('category_id')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.loadSubcategories(categoryId);
      } else {
        this.subcategories = [];
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      categories => this.categories = categories,
      error => console.error(this.translate.instant('ADD_MERCHANT.LOAD_CATEGORIES_ERROR'), error)
    );
  }

  loadSubcategories(categoryId: number): void {
    this.subcategoryService.getSubcategoriesByCategoryId(categoryId).subscribe(
      subcategories => this.subcategories = subcategories,
      error => console.error(this.translate.instant('ADD_MERCHANT.LOAD_SUBCATEGORIES_ERROR'), error)
    );
  }

  onSave(): void {
    if (this.merchantForm.valid) {
      this.isSaving = true;
      const merchantData: Merchant = this.merchantForm.value;
      this.dialogRef.close(merchantData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getSaveButtonText(): string {
    return this.isSaving ? this.translate.instant('ADD_MERCHANT.SAVING') : this.translate.instant('ADD_MERCHANT.ADD_BUTTON');
  }
}
