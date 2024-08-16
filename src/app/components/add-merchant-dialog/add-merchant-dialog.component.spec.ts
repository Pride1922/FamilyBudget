import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMerchantDialogComponent } from './add-merchant-dialog.component';

describe('AddMerchantDialogComponent', () => {
  let component: AddMerchantDialogComponent;
  let fixture: ComponentFixture<AddMerchantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddMerchantDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMerchantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
