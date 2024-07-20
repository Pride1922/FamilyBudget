import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MFASetupComponent } from './mfasetup.component';

describe('MFASetupComponent', () => {
  let component: MFASetupComponent;
  let fixture: ComponentFixture<MFASetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MFASetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MFASetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
