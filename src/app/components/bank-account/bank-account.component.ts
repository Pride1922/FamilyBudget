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
  isEditing: boolean = false;
  bankAccountForm: FormGroup;
  displayedColumns: string[] = ['accountHolder', 'iban', 'bankName', 'accountType', 'balance', 'currency', 'actions'];
  isSaving: boolean = false;

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
            this.snackBar.showSuccess(this.translate.instant('BANK_ACCOUNTS.ACCOUNT_UPDATED'));
          },
          error => {
            this.snackBar.showError(this.translate.instant('BANK_ACCOUNTS.UPDATE_FAILED'));
            this.isSaving = false;
          }
        );
      } else {
        this.bankAccountService.createBankAccount(bankAccountData).subscribe(
          () => {
            this.loadBankAccounts();
            this.resetForm();
            this.snackBar.showSuccess(this.translate.instant('BANK_ACCOUNTS.ACCOUNT_ADDED'));
          },
          error => {
            this.snackBar.showError(this.translate.instant('BANK_ACCOUNTS.ADD_FAILED'));
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
    this.isEditing = true;
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
    this.isEditing = false;
    this.bankAccountForm.reset({
      accountHolder: '',
      iban: '',
      bankName: '',
      accountType: 'checking',
      balance: 0,
      currency: 'EUR'
    });
    this.bankAccountForm.markAsPristine();
    this.bankAccountForm.markAsUntouched();
    this.bankAccountForm.updateValueAndValidity();
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
      mainContent.style.marginLeft = '5rem';
    } else {
      mainContent.style.marginLeft = '16.5625rem';
    }
  }
}
