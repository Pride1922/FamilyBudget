import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankAccountService } from '../../services/bank-account.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { BankAccount } from '../../models/bank-account';

@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css']
})
export class BankAccountComponent implements OnInit {
  @Input() sidebarCollapsed: boolean = false; // Input to track sidebar state

  bankAccounts: BankAccount[] = [];
  currentBankAccount: BankAccount = this.resetCurrentBankAccount();
  isEditMode: boolean = false;
  isEditing: boolean = false;  // <-- Define isEditing here
  bankAccountForm: FormGroup;
  displayedColumns: string[] = ['id', 'accountHolder', 'iban', 'bankName', 'accountType', 'balance', 'currency', 'actions'];
  isSaving: boolean = false; // Flag to track saving state

  constructor(
    private bankAccountService: BankAccountService,
    private fb: FormBuilder,
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {
    this.bankAccountForm = this.fb.group({
      id: [null],
      accountHolder: ['', Validators.required],
      iban: ['', Validators.required],
      bankName: ['', Validators.required],
      accountType: ['checking', Validators.required],
      balance: [0, Validators.required],
      currency: ['EUR', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadBankAccounts();
  }

  ngOnChanges(): void {
    this.updateLayout();
  }

  loadBankAccounts(): void {
    this.bankAccountService.getBankAccounts().subscribe(
      data => this.bankAccounts = data,
      error => console.error('Failed to load bank accounts', error)
    );
  }

  saveBankAccount(): void {
    if (this.bankAccountForm.valid) {
      const bankAccountData = this.bankAccountForm.value;

      this.isSaving = true;

      if (this.isEditMode) {
        this.bankAccountService.updateBankAccount(bankAccountData.id, bankAccountData).subscribe(
          () => {
            this.loadBankAccounts();
            this.resetForm();
            this.snackBar.showSuccess('Bank account updated successfully');
          },
          error => {
            this.snackBar.showError('Failed to update bank account');
            this.isSaving = false;
          }
        );
      } else {
        this.bankAccountService.createBankAccount(bankAccountData).subscribe(
          () => {
            this.loadBankAccounts();
            this.resetForm(); // Reset the form after successful submission
            this.snackBar.showSuccess('Bank account added successfully');
          },
          error => {
            this.snackBar.showError('Failed to add bank account');
            this.isSaving = false;
          }
        );
      }
    } else {
      this.bankAccountForm.markAllAsTouched();
    }
  }

  editBankAccount(bankAccount: BankAccount): void {
    this.currentBankAccount = { ...bankAccount };
    this.isEditMode = true;
    this.isEditing = true;  // Set isEditing to true when editing
    this.bankAccountForm.patchValue(bankAccount);
  }

  deleteBankAccount(id: number | undefined): void {
    if (id !== undefined) {
      this.bankAccountService.deleteBankAccount(id).subscribe(
        () => {
          this.loadBankAccounts();
          this.snackBar.showSuccess(this.translate.instant('BANK_ACCOUNTS.ACCOUNT_DELETED'));
        },
        error => {
          console.error('Failed to delete bank account', error);
          this.snackBar.showError(this.translate.instant('BANK_ACCOUNTS.DELETE_FAILED'));
        }
      );
    }
  }

  resetForm(): void {
    this.currentBankAccount = this.resetCurrentBankAccount();
    this.isEditMode = false;
    this.isEditing = false;  // Reset isEditing when the form is reset

    // Reset the form and validation states
    this.bankAccountForm.reset({
      accountHolder: '',
      iban: '',
      bankName: '',
      accountType: 'checking',
      balance: 0,
      currency: 'EUR'
    });

    // Reset validation states
    this.bankAccountForm.markAsPristine();  // Marks the form as pristine
    this.bankAccountForm.markAsUntouched(); // Marks all controls as untouched
    this.bankAccountForm.updateValueAndValidity(); // Updates the value and validity of the form
  }

  private resetCurrentBankAccount(): BankAccount {
    return {
      accountHolder: '',
      iban: '',
      bankName: '',
      accountType: 'checking',
      balance: 0,
      currency: 'EUR',
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
