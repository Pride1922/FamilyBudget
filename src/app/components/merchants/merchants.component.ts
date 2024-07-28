// merchants.component.ts
import { Component, OnInit } from '@angular/core';
import { MerchantsService } from '../../services/merchants.service';
import { Merchant } from '../../models/merchants.model';

@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.css']
})
export class MerchantsComponent implements OnInit {
  merchants: Merchant[] = [];
  currentMerchant: Merchant = this.resetCurrentMerchant();
  isEditMode: boolean = false;

  constructor(private merchantsService: MerchantsService) {}

  ngOnInit(): void {
    this.loadMerchants();
  }

  loadMerchants(): void {
    this.merchantsService.getMerchants().subscribe((data) => {
      this.merchants = data;
    });
  }

  saveMerchant(): void {
    if (this.isEditMode) {
      if (this.currentMerchant.id !== undefined) {
        this.merchantsService.updateMerchant(this.currentMerchant).subscribe(() => {
          this.loadMerchants();
          this.resetForm();
        });
      }
    } else {
      this.merchantsService.addMerchant(this.currentMerchant).subscribe(() => {
        this.loadMerchants();
        this.resetForm();
      });
    }
  }

  editMerchant(merchant: Merchant): void {
    this.currentMerchant = { ...merchant };
    this.isEditMode = true;
  }

  deleteMerchant(id: number | undefined): void {
    if (id !== undefined) {
      this.merchantsService.deleteMerchant(id).subscribe(() => {
        this.loadMerchants();
      });
    }
  }

  resetForm(): void {
    this.currentMerchant = this.resetCurrentMerchant();
    this.isEditMode = false;
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
}
